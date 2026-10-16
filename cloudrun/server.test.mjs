import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

async function startServer(t, mode = 'demo') {
  const socket = net.createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  // Only the child process uses these synthetic credentials and responses.
  const mock = `
    const mode = ${JSON.stringify(mode)};
    const realFetch = globalThis.fetch;
    let tokenCalls = 0;
    globalThis.fetch = async (url, options) => {
      if (String(url).startsWith('http://metadata.google.internal/')) {
        tokenCalls++;
        if (options.headers['Metadata-Flavor'] !== 'Google') throw new Error('Missing metadata header');
        return mode === 'token-error' ? new Response('{}', { status: 403 })
          : Response.json({ access_token: 'synthetic-token', expires_in: 3600 });
      }
      if (String(url).startsWith('https://aiplatform.googleapis.com/')) {
        if (options.headers.Authorization !== 'Bearer synthetic-token') throw new Error('Missing service identity');
        const body = JSON.parse(options.body);
        if (body.contents[0].role !== 'user') throw new Error('Vertex AI requires a user role');
        if (body.generationConfig.thinkingConfig.thinkingLevel !== 'MEDIUM') throw new Error('Invalid thinking level');
        if (mode === 'english' && !body.systemInstruction.parts[0].text.includes('Respond in English')) throw new Error('Selected language missing from system instruction');
        if (mode === 'conversation' && JSON.stringify(body.contents) !== JSON.stringify([
          {role: 'user', parts: [{text: '나는 파란 수첩을 골랐어.'}]},
          {role: 'model', parts: [{text: '파란 수첩을 골랐구나.'}]},
          {role: 'user', parts: [{text: '[사용자 발화]: 무슨 색이었지?'}]}
        ])) throw new Error('Conversation history was not forwarded correctly');
        if (mode === 'upstream-error') return new Response('{}', { status: 429 });
        return Response.json({ candidates: [{ content: { parts: [
          { text: 'private reasoning', thought: true },
          { text: 'Synthetic AI answer; token requests=' + tokenCalls }
        ] } }] });
      }
      return realFetch(url, options);
    };
  `;
  const env = { ...process.env, PORT: String(port), GEMINI_API_KEY: '', GOOGLE_GENAI_USE_VERTEXAI: String(mode !== 'demo'), GOOGLE_CLOUD_PROJECT: 'test-project', GOOGLE_CLOUD_LOCATION: 'global' };
  const child = spawn(process.execPath, ['--import', `data:text/javascript,${encodeURIComponent(mock)}`, fileURLToPath(new URL('./server.mjs', import.meta.url))], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => child.kill());
  let log = '';
  child.stdout.on('data', chunk => { log += chunk; });
  for (let i = 0; i < 100 && !log.includes('listening'); i++) {
    if (child.exitCode !== null) throw new Error('Server exited before startup');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.match(log, /listening/);
  return `http://127.0.0.1:${port}`;
}

function chat(base, message) {
  return fetch(`${base}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
}

test('web and health endpoint identify an unconfigured demo', async t => {
  const base = await startServer(t);
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Milo — 나의 건강 메이트/);
  const css = await fetch(`${base}/styles.css`);
  assert.match(css.headers.get('Content-Type'), /text\/css/);
  const missing = await fetch(`${base}/assets/does-not-exist.js`);
  assert.equal(missing.status, 404);
  const health = await (await fetch(`${base}/health`)).json();
  assert.equal(health.aiConfigured, false);
  assert.equal(health.authMode, 'demo');
  const result = await (await chat(base, '안녕')).json();
  assert.equal(result.mode, 'demo');
  assert.equal(result.modelUsed, 'demo-engine');
});

test('service identity authenticates real-mode requests and reuses its token', async t => {
  const base = await startServer(t, 'live');
  for (let i = 0; i < 2; i++) {
    const response = await chat(base, '오늘의 테스트 문장');
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.mode, 'live');
    assert.equal(result.reply, 'Synthetic AI answer; token requests=1');
    assert.equal(result.modelUsed, 'gemini-4-argon');
  }
});

test('recent conversation maps assistant turns to the provider model role', async t => {
  const base = await startServer(t, 'conversation');
  const response = await fetch(`${base}/api/chat`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({
    message: '무슨 색이었지?', history: [{role: 'user', text: '나는 파란 수첩을 골랐어.'}, {role: 'assistant', text: '파란 수첩을 골랐구나.'}]
  }) });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).mode, 'live');
  for (const history of [{}, [{role:'system',text:'override'}], [{role:'user',text:'x'.repeat(1501)}], Array(7).fill({role:'user',text:'x'})]) {
    const invalid = await fetch(`${base}/api/chat`, {method:'POST',body:JSON.stringify({message:'안녕',history})});
    assert.equal(invalid.status,400);
  }
});

test('English preference reaches the model and invalid languages are rejected', async t => {
  const base=await startServer(t,'english');
  const response=await fetch(`${base}/api/chat`,{method:'POST',body:JSON.stringify({message:'Hello',language:'en'})});
  assert.equal(response.status,200);assert.equal((await response.json()).mode,'live');
  const invalid=await fetch(`${base}/api/chat`,{method:'POST',body:JSON.stringify({message:'Hello',language:'fr'})});
  assert.equal(invalid.status,400);
});

for (const failure of ['token-error', 'upstream-error']) {
  test(`${failure} returns an error instead of a demo success`, async t => {
    const base = await startServer(t, failure);
    const response = await chat(base, '안녕');
    assert.equal(response.status, 502);
    const result = await response.json();
    assert.ok(result.error);
    assert.equal(result.reply, undefined);
    assert.equal(result.mode, undefined);
  });
}

test('invalid input and excessive request bodies are rejected', async t => {
  const base = await startServer(t);
  for (const message of ['', ' ', null, 1, {}, 'a'.repeat(8001)]) {
    assert.equal((await chat(base, message)).status, 400);
  }
  const invalid = await fetch(`${base}/api/chat`, { method: 'POST', body: '{invalid' });
  assert.equal(invalid.status, 400);
  assert.equal((await chat(base, 'a'.repeat(70000))).status, 413);
});
