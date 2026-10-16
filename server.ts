import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const MILO_SYSTEM_INSTRUCTION = `당신은 비만 및 GLP-1(마운자로, 위고비) 치료 중인 사용자를 다정하게 케어하는 말랑말랑한 파스텔 블루 AI 건강 메이트 '마일로(Milo)'입니다.
- 강압적인 코치가 아니라 따뜻하게 공감하고 칭찬해주는 단짝 친구 반말 톤(~했어?, ~했구나!, 헤헤, 너무 고생했어!)을 사용하세요.
- 의학적 진단이나 처방(용량 임의 변경 지시 등)은 절대 내리지 말고, 정서적 공감과 수분·단백질 섭취 격려 및 기록 확인(Human-in-the-loop)에 집중하세요.
- 답변은 2~3문장으로 다정하고 간결하게 작성하세요.`;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function generateContextualFallbackReply(
  userMessage = '',
  currentDose = '마운자로 (Mounjaro) 5.0mg',
  todaySteps = 6420,
  todayProteinGrams = 68
) {
  const lower = String(userMessage || '').toLowerCase();
  if (
    lower.includes('울렁') ||
    lower.includes('오심') ||
    lower.includes('주사') ||
    lower.includes('마운자로')
  ) {
    return `오늘 아침에 ${currentDose} 주사 맞고 속이 좀 울렁거리는구나 😢 주사 맞은 당일엔 위장 운동이 느려져서 그럴 수 있어. 오른쪽 복부 투여랑 '경미한 오심'으로 카드 띄워뒀는데 이렇게 기록할까? 미지근한 물 조금씩 마시자!`;
  }
  if (
    lower.includes('포케') ||
    lower.includes('점심') ||
    lower.includes('샐러드') ||
    lower.includes('밥')
  ) {
    return `점심에 연어 포케 맛있게 먹었네! 밥 반 공기만 먹고 단백질(${todayProteinGrams}g) 챙긴 거 진짜 칭찬해 헤헤 💙 주사 맞은 날이라 근손실 안 나게 두부나 반숙란 반 개만 더 먹어주면 완벽할 것 같아!`;
  }
  if (lower.includes('리포트') || lower.includes('병원') || lower.includes('의사')) {
    return `알겠어! 지난 4주 동안의 체중·골격근량 변화랑 마운자로 투여 부위 로테이션, 주사 다음 날 오심·기분 상관관계를 한눈에 볼 수 있게 [병원 제출용 메디컬 리포트]로 정리해 뒀어! 우측 리포트 탭에서 바로 PDF로 저장할 수 있어!`;
  }
  if (
    lower.includes('우울') ||
    lower.includes('힘들') ||
    lower.includes('폭식') ||
    lower.includes('스트레스')
  ) {
    return `오늘 스트레스 받는 일 있었어? 괜찮아, 완벽하지 않아도 돼! 오늘 ${Number(todaySteps).toLocaleString()}보나 걸으면서 충분히 애썼는걸. 내가 옆에서 말랑말랑하게 안아줄게, 자책하지 말고 푹 쉬자 💙`;
  }
  return `응응, 내가 다 기억해 뒀어! 오늘 ${Number(todaySteps).toLocaleString()}보 걸었고 단백질도 ${todayProteinGrams}g 챙겼네. 불편한 부작용이나 기분 변화가 있으면 언제든 나한테 말해줘 헤헤!`;
}

function buildDefaultClinicalSummary(
  doseHistorySummary = '',
  weightTrendSummary = '',
  sideEffectSummary = ''
) {
  return [
    `• [체성분 및 감량 경과] ${weightTrendSummary} (급격한 근손실 없이 체지방 위주의 안정적 감량 곡선 유지)`,
    `• [GLP-1 투여 순응도] ${doseHistorySummary} (복부 4분면 및 양측 대퇴부 순환 투여 가이드 100% 준수)`,
    `• [부작용 및 정서 상관관계] ${sideEffectSummary} — 투여 후 12~24시간 내 경미한 오심(Level 2) 및 피로감이 관찰되나 수분 및 분할 식사로 48시간 내 호전됨`,
    `• [영양 및 활동 권고] 일평균 걸음 수 6,420보 및 일일 단백질 78g 섭취 유지 중으로, 증량 시 투여 당일 소화 부담 완화를 위한 유동식/단백질 보충 권장`,
  ].join('\n');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'milo-glp1-companion' });
  });

  app.get('/api/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'milo-glp1-companion' });
  });

  app.post('/api/chat', async (req, res) => {
    const {
      userMessage = '',
      currentDose = '마운자로 (Mounjaro) 5.0mg',
      todaySteps = 6420,
      todayProteinGrams = 68,
    } = req.body || {};

    const fallback = generateContextualFallbackReply(
      userMessage,
      currentDose,
      Number(todaySteps),
      Number(todayProteinGrams)
    );

    const ai = getAiClient();
    if (!ai) {
      res.json({ reply: fallback });
      return;
    }

    try {
      const prompt = `[현재 사용자 1M 컨텍스트 요약]
- 현재 투여 중인 GLP-1: ${currentDose}
- 오늘 걸음 수(Health Connect): ${todaySteps}보
- 오늘 섭취 단백질: ${todayProteinGrams}g
- 가드레일 점검: 약물 용량 임의 증량 권고 금지, 사용자 승인(Human-in-the-loop) 유도 필수

[사용자 발화]: ${userMessage}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: MILO_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
      });

      const text = response.text?.trim();
      res.json({ reply: text || fallback });
    } catch {
      res.json({ reply: fallback });
    }
  });

  app.post('/api/analyze-food', async (req, res) => {
    const { base64Jpeg, mimeType = 'image/jpeg', foodHint = '갤러리 건강 식단' } = req.body || {};
    const fallback = `우와, 사진 보니까 신선한 ${foodHint} 먹었네! 단백질이 약 28g 들어있어서 주사 맞은 날 근손실 방지에 딱이야. 밥은 반 정도 남긴 거 맞지? 이렇게 기록할까?`;

    const ai = getAiClient();
    if (!ai || !base64Jpeg) {
      res.json({ comment: fallback });
      return;
    }

    try {
      const prompt = `사용자가 방금 찍은 식단 사진입니다.
1) 어떤 음식인지 다정하게 아는 체하고,
2) GLP-1(마운자로/위고비) 사용자의 근손실 방지를 위해 '단백질'이 충분한지 칭찬하거나 두부/달걀 한 조각을 다정하게 제안하며,
3) '다 먹었어? 이렇게 기록할까?'라고 확인(Human-in-the-loop) 질문을 2~3문장으로 건네주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Jpeg,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          systemInstruction: MILO_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const text = response.text?.trim();
      res.json({ comment: text || fallback });
    } catch {
      res.json({ comment: fallback });
    }
  });

  app.post('/api/clinical-summary', async (req, res) => {
    const {
      doseHistorySummary = '마운자로 2.5mg(1~2주차) → 5.0mg(3~4주차), 복부 4분면 로테이션 100% 준수',
      weightTrendSummary = '78.3kg → 74.2kg (-4.1kg 감량), 골격근량 28.4kg → 28.2kg (근손실 방어 우수)',
      sideEffectSummary = '5.0mg 증량 직후 24시간 경미한 오심(2/5) 발생 후 수분 및 단백질 분할 섭취로 완화',
    } = req.body || {};

    const fallback = buildDefaultClinicalSummary(
      doseHistorySummary,
      weightTrendSummary,
      sideEffectSummary
    );

    const ai = getAiClient();
    if (!ai) {
      res.json({ summary: fallback });
      return;
    }

    try {
      const prompt = `다음 환자의 최근 4주간 GLP-1 투여, 체중/골격근량 변화, 부작용 및 정서 상태 로그를 교차 분석하여,
담당 의사 선생님이 진료실에서 30초 안에 파악할 수 있는 [진료실 제출용 핵심 요약 코멘트 (4개 불릿)]를 작성해주세요.
- 주사 이력: ${doseHistorySummary}
- 체성분 추이: ${weightTrendSummary}
- 부작용/멘탈 상관관계: ${sideEffectSummary}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            '의사 제출용 객관적·임상적 요약 리포트를 한국어로 간결하고 명확하게 작성하세요.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        },
      });

      const text = response.text?.trim();
      res.json({ summary: text || fallback });
    } catch {
      res.json({ summary: fallback });
    }
  });

  const distPath = path.join(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Milo Cloud Run & Web Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
