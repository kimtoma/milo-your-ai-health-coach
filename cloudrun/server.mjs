import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_INSTRUCTION = `당신은 비만 및 GLP-1(마운자로, 위고비) 치료 중인 사용자를 다정하게 케어하는 말랑말랑한 파스텔 블루 AI 건강 메이트 '마일로(Milo)'입니다.
- 강압적인 코치가 아니라 따뜻하게 공감하고 칭찬해주는 단짝 친구 반말 톤(~했어?, ~했구나!, 헤헤, 너무 고생했어!)을 사용하세요.
- 의학적 진단이나 처방(용량 임의 변경 지시 등)은 절대 내리지 말고, 정서적 공감과 수분·단백질 섭취 격려 및 기록 확인(Human-in-the-loop)에 집중하세요.
- 답변은 2~3문장으로 다정하고 간결하게 작성하세요.`;

async function callGeminiArgon(model, thinkingLevel, prompt) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    return null;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      thinkingConfig: {
        thinkingLevel
      }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

function fallbackReply(message = '') {
  if (message.includes('울렁') || message.includes('오심') || message.includes('주사') || message.includes('마운자로')) {
    return {
      reply: "오늘 아침에 마운자로 5mg 주사 맞고 속이 좀 울렁거리는구나 😢 주사 당일엔 위장 운동이 느려져서 그럴 수 있어. [복부 우하단 · 5mg · 경미한 오심] 카드를 띄워뒀는데 이렇게 기록할까?",
      pose: "SAD_WORRIED",
      actionBadge: "확인형 카드 생성됨: [복부 우하단 · 마운자로 5mg · 부작용: 경미한 오심]"
    };
  }
  if (message.includes('포케') || message.includes('점심') || message.includes('샐러드')) {
    return {
      reply: "점심에 찍어둔 연어 포케 사진 보니까 단백질(28g) 구성이 진짜 훌륭해 헤헤 💙 주사 맞은 날 근손실 안 나게 두부 한 조각만 더 챙기면 완벽할 것 같아! 밥 반 공기 남긴 걸로 기록할까?",
      pose: "MEAL_CHECK",
      actionBadge: "확인형 카드 생성됨: [연어 포케 볼 (밥 1/2) · 단백질 28g · 440kcal]"
    };
  }
  if (message.includes('리포트') || message.includes('병원') || message.includes('의사')) {
    return {
      reply: "알겠어! 지난 4주 동안의 체중(-4.1kg)·골격근량(28.2kg 유지) 변화랑 마운자로 투여 부위 로테이션, 주사 다음 날 오심·기분 상관관계를 [병원 제출용 메디컬 리포트]로 정리해 뒀어!",
      pose: "SUCCESS_SCALE",
      actionBadge: "Gemini 4 Argon (thinking_level=high) 임상 요약 리포트 생성 완료"
    };
  }
  return {
    reply: "응응, 내가 다 듣고 있어! 오늘 6,420보나 걸었고 단백질도 68g 챙겼네 헤헤 💙 불편한 부작용이나 기분 변화가 있으면 언제든 편하게 말해줘!",
    pose: "LISTENING_COMFORTING",
    actionBadge: "실시간 컨텍스트 동기화 완료"
  };
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'milo-argon-cloudrun', model: 'gemini-4-argon' }));
    return;
  }

  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const userMessage = parsed.message || '';
        const fb = fallbackReply(userMessage);
        const aiText = await callGeminiArgon(
          'gemini-4-argon',
          'medium',
          `[사용자 발화]: ${userMessage}\n[현재 상태]: 마운자로 5.0mg, 오늘 6,420보, 단백질 68g`
        );
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          reply: aiText || fb.reply,
          pose: fb.pose,
          actionBadge: fb.actionBadge,
          modelUsed: aiText ? 'gemini-4-argon' : 'gemini-4-argon (demo-engine)'
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(e) }));
      }
    });
    return;
  }

  // Serve static index.html
  const indexPath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(indexPath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading index.html');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Milo Cloud Run Server listening on http://0.0.0.0:${PORT}`);
});
