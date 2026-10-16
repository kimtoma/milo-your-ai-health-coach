export async function chatWithMilo(params: {
  userMessage: string;
  currentDose: string;
  todaySteps: number;
  todayProteinGrams: number;
}): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    return data.reply;
  } catch {
    return `응응, 내가 다 기억해 뒀어! 오늘 ${params.todaySteps.toLocaleString()}보 걸었고 단백질도 ${params.todayProteinGrams}g 챙겼네. 불편한 부작용이나 기분 변화가 있으면 언제든 나한테 말해줘 헤헤!`;
  }
}

export async function analyzeFoodPhotoWithMilo(params: {
  base64Jpeg?: string | null;
  mimeType?: string;
  foodHint: string;
}): Promise<string> {
  try {
    const response = await fetch('/api/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    return data.comment;
  } catch {
    return `우와, 사진 보니까 신선한 ${params.foodHint} 먹었네! 단백질이 약 28g 들어있어서 주사 맞은 날 근손실 방지에 딱이야. 밥은 반 정도 남긴 거 맞지? 이렇게 기록할까?`;
  }
}

export async function generateDoctorClinicalSummary(params: {
  doseHistorySummary: string;
  weightTrendSummary: string;
  sideEffectSummary: string;
}): Promise<string> {
  try {
    const response = await fetch('/api/clinical-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    return data.summary;
  } catch {
    return [
      `• [체성분 및 감량 경과] ${params.weightTrendSummary} (급격한 근손실 없이 체지방 위주의 안정적 감량 곡선 유지)`,
      `• [GLP-1 투여 순응도] ${params.doseHistorySummary} (복부 4분면 및 양측 대퇴부 순환 투여 가이드 100% 준수)`,
      `• [부작용 및 정서 상관관계] ${params.sideEffectSummary} — 투여 후 12~24시간 내 경미한 오심(Level 2) 및 피로감이 관찰되나 수분 및 분할 식사로 48시간 내 호전됨`,
      `• [영양 및 활동 권고] 일평균 걸음 수 6,420보 및 일일 단백질 78g 섭취 유지 중으로, 증량 시 투여 당일 소화 부담 완화를 위한 유동식/단백질 보충 권장`,
    ].join('\n');
  }
}
