import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-4-argon';
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || '';
const USE_VERTEX_AI = process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true';
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';
const aiConfigured = USE_VERTEX_AI ? Boolean(GOOGLE_CLOUD_PROJECT) : Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
let cachedToken;

async function cloudRunAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) return cachedToken.value;
  const response = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
    headers: { 'Metadata-Flavor': 'Google' },
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error(`Service identity authentication failed (${response.status})`);
  const token = await response.json();
  if (!token.access_token) throw new Error('Service identity returned no access token');
  cachedToken = { value: token.access_token, expiresAt: Date.now() + token.expires_in * 1000 };
  return cachedToken.value;
}

const SYSTEM_INSTRUCTION = `당신은 비만 및 GLP-1(마운자로, 위고비) 치료 중인 사용자를 다정하게 케어하는 말랑말랑한 파스텔 블루 AI 건강 메이트 '마일로(Milo)'입니다.
- 강압적인 코치가 아니라 따뜻하게 공감하고 칭찬해주는 단짝 친구 반말 톤(~했어?, ~했구나!, 헤헤, 너무 고생했어!)을 사용하세요.
- 의학적 진단이나 처방(용량 임의 변경 지시 등)은 절대 내리지 말고, 정서적 공감과 수분·단백질 섭취 격려 및 기록 확인(Human-in-the-loop)에 집중하세요.
- 답변은 2~3문장으로 다정하고 간결하게 작성하세요.
- 사용자가 말하지 않은 약 이름, 용량, 체중, 활동, 음식, 증상, 저장 완료 상태를 추측하거나 만들어내지 마세요. 기록은 사용자가 직접 입력하고 확인한 뒤에만 앱에서 저장됩니다.`;

async function callGeminiArgon(model, thinkingLevel, prompt, history = [], language = 'ko') {
  if (!aiConfigured) return null;
  const endpoint = GOOGLE_CLOUD_LOCATION === 'global' ? 'aiplatform.googleapis.com' : `${GOOGLE_CLOUD_LOCATION}-aiplatform.googleapis.com`;
  const url = USE_VERTEX_AI
    ? `https://${endpoint}/v1/projects/${GOOGLE_CLOUD_PROJECT}/locations/${GOOGLE_CLOUD_LOCATION}/publishers/google/models/${model}:generateContent`
    : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const authHeaders = USE_VERTEX_AI
    ? { Authorization: `Bearer ${await cloudRunAccessToken()}` }
    : { 'x-goog-api-key': GEMINI_API_KEY };
  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION + (language === 'en' ? '\n- Respond in English, warmly and concisely. Keep medicine names and recorded values exactly as provided.' : '\n- 한국어로 답변하세요.') }]
    },
    contents: [
      ...history.map(turn => ({
        role: turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: turn.text }]
      })),
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      thinkingConfig: {
        thinkingLevel: thinkingLevel.toUpperCase()
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(120000)
  });
  if (!res.ok) throw new Error(`Gemini request failed (${res.status})`);
  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.filter(part => !part.thought && part.text).map(part => part.text).join('');
  if (!reply) throw new Error('Gemini returned no answer');
  return reply;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'milo-argon-cloudrun', model: GEMINI_MODEL, aiConfigured, authMode: USE_VERTEX_AI ? 'service-identity' : aiConfigured ? 'api-key' : 'demo' }));
    return;
  }

  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      if (res.writableEnded) return;
      body += chunk;
      if (Buffer.byteLength(body) > 65536 && !res.writableEnded) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Message is too large' }));
      }
    });
    req.on('end', async () => {
      if (res.writableEnded) return;
      try {
        const parsed = JSON.parse(body || '{}');
        const userMessage = parsed?.message;
        if (typeof userMessage !== 'string' || !userMessage.trim() || userMessage.length > 8000) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'A message of 1 to 8000 characters is required' }));
          return;
        }
        const history = parsed.history ?? [];
        const language = parsed.language ?? 'ko';
        if (!['ko', 'en'].includes(language)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Language must be ko or en' }));
          return;
        }
        if (!Array.isArray(history) || history.length > 6 || history.some(turn =>
          !turn || !['user', 'assistant'].includes(turn.role) || typeof turn.text !== 'string' || !turn.text.trim() || turn.text.length > 1500
        )) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Up to 6 conversation turns of 1 to 1500 characters are allowed' }));
          return;
        }
        const aiText = await callGeminiArgon(
          GEMINI_MODEL,
          'medium',
          `[사용자 발화]: ${userMessage}`,
          history,
          language
        );
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          reply: aiText || (language === 'en' ? 'AI chat is not connected right now. You can still log records manually.' : '지금은 AI 연결이 준비되지 않았어요. 직접 기록은 계속 사용할 수 있어요.'),
          pose: 'LISTENING_COMFORTING',
          modelUsed: aiText ? GEMINI_MODEL : 'demo-engine',
          mode: aiText ? 'live' : 'demo'
        }));
      } catch (e) {
        const invalidJson = e instanceof SyntaxError;
        if (!invalidJson) console.error('Gemini request failed:', e.message);
        res.writeHead(invalidJson ? 400 : 502, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: invalidJson ? 'Invalid JSON' : '지금 AI 응답을 가져오지 못했어. 잠시 후 다시 시도해 줘.' }));
      }
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405); res.end('Method not allowed'); return;
  }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('Invalid path'); return; }
  const publicDir = path.join(__dirname, 'public');
  const filePath = path.resolve(publicDir, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!filePath.startsWith(publicDir + path.sep)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
  const type = types[path.extname(filePath)];
  if (!type) { res.writeHead(404); res.end('Not found'); return; }
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(err.code === 'ENOENT' ? 404 : 500); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': path.extname(filePath) === '.png' ? 'public, max-age=604800' : 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Milo Cloud Run Server listening on http://0.0.0.0:${PORT}`);
});
