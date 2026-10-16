export enum FoldPostureMode {
  UNFOLDED_DUAL = 'UNFOLDED_DUAL',
  FLEX_TABLETOP = 'FLEX_TABLETOP',
  COVER_COMPACT = 'COVER_COMPACT',
}

export interface FoldPostureMeta {
  mode: FoldPostureMode;
  titleKo: string;
  specSubtitle: string;
  ratioLabel: string;
}

export const FOLD_POSTURE_MODES: Record<FoldPostureMode, FoldPostureMeta> = {
  [FoldPostureMode.UNFOLDED_DUAL]: {
    mode: FoldPostureMode.UNFOLDED_DUAL,
    titleKo: '펼침 대화면 (Unfolded)',
    specSubtitle: 'Galaxy Z Fold 7 · 8.0" QXGA+ (좌: 마일로 스테이지 / 우: 케어 허브)',
    ratioLabel: 'Dual-Pane 8.0"',
  },
  [FoldPostureMode.FLEX_TABLETOP]: {
    mode: FoldPostureMode.FLEX_TABLETOP,
    titleKo: '플렉스 모드 (Flex 115°)',
    specSubtitle: '상단: 살아있는 마일로 교감 / 하단: 확인형 기록 & GLP-1 패드',
    ratioLabel: 'Flex 115°',
  },
  [FoldPostureMode.COVER_COMPACT]: {
    mode: FoldPostureMode.COVER_COMPACT,
    titleKo: '커버 화면 (Cover)',
    specSubtitle: '6.3" 한 손 빠른 확인 & 음성 대화 모드',
    ratioLabel: 'Cover 6.3"',
  },
};

export enum StudioDestination {
  DUAL_WORKSPACE = 'DUAL_WORKSPACE',
  ZERO_EFFORT_LOG = 'ZERO_EFFORT_LOG',
  GLP1_CARE = 'GLP1_CARE',
  MILO_MOTIONS = 'MILO_MOTIONS',
  DOCTOR_REPORT = 'DOCTOR_REPORT',
}

export const STUDIO_DESTINATIONS: { id: StudioDestination; labelKo: string }[] = [
  { id: StudioDestination.DUAL_WORKSPACE, labelKo: '듀얼 홈' },
  { id: StudioDestination.ZERO_EFFORT_LOG, labelKo: '확인형 기록' },
  { id: StudioDestination.GLP1_CARE, labelKo: 'GLP-1 케어' },
  { id: StudioDestination.MILO_MOTIONS, labelKo: '마일로 14종' },
  { id: StudioDestination.DOCTOR_REPORT, labelKo: '병원 리포트' },
];

export enum MiloPoseState {
  HAPPY_CHEERING = 'HAPPY_CHEERING',
  LISTENING_COMFORTING = 'LISTENING_COMFORTING',
  SAD_WORRIED = 'SAD_WORRIED',
  GLP1_ACTION = 'GLP1_ACTION',
  MEAL_CHECK = 'MEAL_CHECK',
  SUCCESS_SCALE = 'SUCCESS_SCALE',
  WALKING_CHEERFULLY = 'WALKING_CHEERFULLY',
  STEADY_JOGGING = 'STEADY_JOGGING',
  SQUAT_READY = 'SQUAT_READY',
  SQUAT_HOLD = 'SQUAT_HOLD',
  CYCLING = 'CYCLING',
  STRENGTH_TRAINING = 'STRENGTH_TRAINING',
  YOGA_STRETCHING = 'YOGA_STRETCHING',
  STAIR_CLIMBING = 'STAIR_CLIMBING',
}

export interface MiloPoseMeta {
  id: MiloPoseState;
  titleKo: string;
  titleEn: string;
  sheetCategory: string;
  miloBubbleQuote: string;
  badgeColorHex: string;
}

export const MILO_POSES: Record<MiloPoseState, MiloPoseMeta> = {
  [MiloPoseState.HAPPY_CHEERING]: {
    id: MiloPoseState.HAPPY_CHEERING,
    titleKo: '기쁨 / 칭찬',
    titleEn: 'Happy & Cheering',
    sheetCategory: '감정·이벤트 (Events)',
    miloBubbleQuote: '우와! 오늘 걸음 수랑 수분 섭취 목표 다 채웠네! 진짜 대단해 헤헤 💙',
    badgeColorHex: '#34D399',
  },
  [MiloPoseState.LISTENING_COMFORTING]: {
    id: MiloPoseState.LISTENING_COMFORTING,
    titleKo: '경청 / 공감',
    titleEn: 'Listening & Comforting',
    sheetCategory: '감정·이벤트 (Events)',
    miloBubbleQuote: '응응, 내가 다 듣고 있어. 오늘 하루 어떤 기분이었는지 편하게 말해줘!',
    badgeColorHex: '#7DD3FC',
  },
  [MiloPoseState.SAD_WORRIED]: {
    id: MiloPoseState.SAD_WORRIED,
    titleKo: '걱정 / 부작용 공감',
    titleEn: 'Sad / Sick / Worried',
    sheetCategory: '감정·이벤트 (Events)',
    miloBubbleQuote: '주사 맞고 속이 많이 울렁거렸구나… 무리하지 말고 따뜻한 물 조금씩 마시자 😢',
    badgeColorHex: '#FB7185',
  },
  [MiloPoseState.GLP1_ACTION]: {
    id: MiloPoseState.GLP1_ACTION,
    titleKo: 'GLP-1 주사 & 케어',
    titleEn: 'GLP-1 Action',
    sheetCategory: '감정·이벤트 (Events)',
    miloBubbleQuote: '지난주엔 왼쪽 배에 맞았으니까, 오늘은 오른쪽 배에 맞을 차례야! 반창고도 콩 붙였어!',
    badgeColorHex: '#A5B4FC',
  },
  [MiloPoseState.MEAL_CHECK]: {
    id: MiloPoseState.MEAL_CHECK,
    titleKo: '식단 & 카운팅',
    titleEn: 'Meal & Health Check',
    sheetCategory: '감정·이벤트 (Events)',
    miloBubbleQuote: '점심 사진 보니까 연어 포케 먹었네! 단백질 28g 합격! 밥은 반 남겼지?',
    badgeColorHex: '#FCD34D',
  },
  [MiloPoseState.SUCCESS_SCALE]: {
    id: MiloPoseState.SUCCESS_SCALE,
    titleKo: '체중 기록 완료',
    titleEn: 'Success & Scale',
    sheetCategory: '감정·이벤트 (Events)',
    miloBubbleQuote: '오늘 아침 체중 74.2kg 기록 완료! 한 달 동안 근육 손실 없이 -4.1kg 감량 중이야!',
    badgeColorHex: '#38BDF8',
  },
  [MiloPoseState.WALKING_CHEERFULLY]: {
    id: MiloPoseState.WALKING_CHEERFULLY,
    titleKo: '신나게 걷기',
    titleEn: 'Walking Cheerfully',
    sheetCategory: '운동 모션 1 (Exercise 1)',
    miloBubbleQuote: '살랑살랑 산책하니까 기분도 한결 가벼워진다! 오늘 6,420보 걸었어!',
    badgeColorHex: '#34D399',
  },
  [MiloPoseState.STEADY_JOGGING]: {
    id: MiloPoseState.STEADY_JOGGING,
    titleKo: '가볍게 뛰기',
    titleEn: 'Steady Jogging',
    sheetCategory: '운동 모션 1 (Exercise 1)',
    miloBubbleQuote: '헛둘헛둘! 무리하지 않는 슬로우 조깅으로 심박수 122bpm 유지 중!',
    badgeColorHex: '#FB923C',
  },
  [MiloPoseState.SQUAT_READY]: {
    id: MiloPoseState.SQUAT_READY,
    titleKo: '스쿼트 준비',
    titleEn: 'Starting a Squat',
    sheetCategory: '운동 모션 1 (Exercise 1)',
    miloBubbleQuote: 'GLP-1 맞을 땐 하체 근손실 방지가 제일 중요해! 나랑 스쿼트 10개만 준비~',
    badgeColorHex: '#60A5FA',
  },
  [MiloPoseState.SQUAT_HOLD]: {
    id: MiloPoseState.SQUAT_HOLD,
    titleKo: '스쿼트 동작',
    titleEn: 'Squat Hold & Exercising',
    sheetCategory: '운동 모션 1 (Exercise 1)',
    miloBubbleQuote: '으랏차차! 허벅지에 힘 꽉! 근손실 절대 지켜!!',
    badgeColorHex: '#F43F5E',
  },
  [MiloPoseState.CYCLING]: {
    id: MiloPoseState.CYCLING,
    titleKo: '자전거 타기',
    titleEn: 'Cycling',
    sheetCategory: '운동 모션 2 (Exercise 2)',
    miloBubbleQuote: '쌩쌩~ 관절에 무리 없는 실내 자전거 25분 타기 성공!',
    badgeColorHex: '#2DD4BF',
  },
  [MiloPoseState.STRENGTH_TRAINING]: {
    id: MiloPoseState.STRENGTH_TRAINING,
    titleKo: '근력 운동',
    titleEn: 'Strength Training',
    sheetCategory: '운동 모션 2 (Exercise 2)',
    miloBubbleQuote: '으쌰! 덤벨 들고 근력 뿜뿜! 기초대사량을 높여보자!',
    badgeColorHex: '#F472B6',
  },
  [MiloPoseState.YOGA_STRETCHING]: {
    id: MiloPoseState.YOGA_STRETCHING,
    titleKo: '요가 & 스트레칭',
    titleEn: 'Yoga & Stretching',
    sheetCategory: '운동 모션 2 (Exercise 2)',
    miloBubbleQuote: '후우~ 깊게 숨을 들이마시고 내쉬면서 오늘 쌓인 스트레스를 다 풀어주자 🧘',
    badgeColorHex: '#C084FC',
  },
  [MiloPoseState.STAIR_CLIMBING]: {
    id: MiloPoseState.STAIR_CLIMBING,
    titleKo: '계단 오르기',
    titleEn: 'Stair Climbing',
    sheetCategory: '운동 모션 2 (Exercise 2)',
    miloBubbleQuote: '한 계단씩 총총! 일상 속 계단 오르기가 최고의 유산소 운동이야!',
    badgeColorHex: '#FBBF24',
  },
};

export const MILO_POSE_LIST: MiloPoseMeta[] = Object.values(MILO_POSES);

export enum MiloTurnaroundView {
  FRONT = 'FRONT',
  SIDE = 'SIDE',
  BACK = 'BACK',
}

export const TURNAROUND_VIEWS: { id: MiloTurnaroundView; labelKo: string }[] = [
  { id: MiloTurnaroundView.FRONT, labelKo: '정면 (Front)' },
  { id: MiloTurnaroundView.SIDE, labelKo: '측면 꼬리 (Side)' },
  { id: MiloTurnaroundView.BACK, labelKo: '뒷모습 (Back)' },
];

export enum InjectionSiteId {
  ABDOMEN_TOP_LEFT = 'ABDOMEN_TOP_LEFT',
  ABDOMEN_TOP_RIGHT = 'ABDOMEN_TOP_RIGHT',
  ABDOMEN_BOTTOM_LEFT = 'ABDOMEN_BOTTOM_LEFT',
  ABDOMEN_BOTTOM_RIGHT = 'ABDOMEN_BOTTOM_RIGHT',
  THIGH_LEFT = 'THIGH_LEFT',
  THIGH_RIGHT = 'THIGH_RIGHT',
}

export interface InjectionSiteMeta {
  key: InjectionSiteId;
  id: string;
  labelKo: string;
  shortLabel: string;
  lastUsedDaysAgo: number;
  isRecommendedToday: boolean;
}

export const INJECTION_SITES: Record<InjectionSiteId, InjectionSiteMeta> = {
  [InjectionSiteId.ABDOMEN_TOP_LEFT]: {
    key: InjectionSiteId.ABDOMEN_TOP_LEFT,
    id: 'abd_tl',
    labelKo: '복부 좌상단',
    shortLabel: '좌상 복부',
    lastUsedDaysAgo: 21,
    isRecommendedToday: false,
  },
  [InjectionSiteId.ABDOMEN_TOP_RIGHT]: {
    key: InjectionSiteId.ABDOMEN_TOP_RIGHT,
    id: 'abd_tr',
    labelKo: '복부 우상단',
    shortLabel: '우상 복부',
    lastUsedDaysAgo: 14,
    isRecommendedToday: false,
  },
  [InjectionSiteId.ABDOMEN_BOTTOM_LEFT]: {
    key: InjectionSiteId.ABDOMEN_BOTTOM_LEFT,
    id: 'abd_bl',
    labelKo: '복부 좌하단 (지난주 투여)',
    shortLabel: '좌하 복부',
    lastUsedDaysAgo: 7,
    isRecommendedToday: false,
  },
  [InjectionSiteId.ABDOMEN_BOTTOM_RIGHT]: {
    key: InjectionSiteId.ABDOMEN_BOTTOM_RIGHT,
    id: 'abd_br',
    labelKo: '복부 우하단 (오늘 추천 ⭐)',
    shortLabel: '우하 복부',
    lastUsedDaysAgo: 28,
    isRecommendedToday: true,
  },
  [InjectionSiteId.THIGH_LEFT]: {
    key: InjectionSiteId.THIGH_LEFT,
    id: 'thigh_l',
    labelKo: '왼쪽 허벅지',
    shortLabel: '좌측 허벅지',
    lastUsedDaysAgo: 35,
    isRecommendedToday: false,
  },
  [InjectionSiteId.THIGH_RIGHT]: {
    key: InjectionSiteId.THIGH_RIGHT,
    id: 'thigh_r',
    labelKo: '오른쪽 허벅지',
    shortLabel: '우측 허벅지',
    lastUsedDaysAgo: 42,
    isRecommendedToday: false,
  },
};

export const INJECTION_SITE_LIST: InjectionSiteMeta[] = Object.values(INJECTION_SITES);

export interface ZeroEffortConfirmItem {
  id: string;
  sourceBadge: string;
  detectedTime: string;
  title: string;
  miloQuestion: string;
  nutritionOrMetricSummary: string;
  proteinGrams: number;
  caloriesKcal: number;
  userQuickReplyText: string;
  isConfirmed: boolean;
  imageUrl?: string | null;
}

export interface Glp1DoseLog {
  id: string;
  dateLabel: string;
  medicationName: string;
  doseMg: string;
  site: InjectionSiteMeta;
  sideEffects: string[];
  nauseaLevel: number;
  moodEmoji: string;
  miloCareNote: string;
}

export interface MiloChatMessage {
  id: string;
  senderIsMilo: boolean;
  text: string;
  timestamp: string;
  actionCardText?: string | null;
  isActionConfirmed?: boolean;
}

export interface DailyWeightPoint {
  weekLabel: string;
  weightKg: number;
  skeletalMuscleKg: number;
  doseLabel: string;
  nauseaScore: number;
  moodScore: number;
}

export const DEFAULT_ZERO_EFFORT_ITEMS: ZeroEffortConfirmItem[] = [
  {
    id: 'ze_poke',
    sourceBadge: '갤러리 음식 사진 감지 + Gemini Flash Vision',
    detectedTime: '오늘 오후 12:40 촬영',
    title: '하와이안 연어 포케 & 두부 볼',
    miloQuestion:
      '점심에 찍은 사진 보니까 연어 포케 먹었네! 연어 포케 맞지? 주사 맞은 날인데 밥은 반 남겼어?',
    nutritionOrMetricSummary: '단백질 28g (고단백 합격 ⭐) · 440 kcal · 식이섬유 풍부',
    proteinGrams: 28,
    caloriesKcal: 440,
    userQuickReplyText: '응, 밥은 반 남겼어! 기록 승인할게',
    isConfirmed: false,
    imageUrl: '/images/img_salmon_poke.jpg',
  },
  {
    id: 'ze_steps',
    sourceBadge: 'Google Health Connect 자동 동기화',
    detectedTime: '실시간 걸음 수 & 수면',
    title: '오후 산책 6,420보 & 수면 7시간 15분',
    miloQuestion:
      '오늘 속이 좀 울렁거렸는데도 6,420보나 걸었네, 진짜 고생했어! 다리는 안 아파? 운동 일기에 기록할까?',
    nutritionOrMetricSummary: '활동 칼로리 245 kcal 소모 · 평균 심박수 108 bpm',
    proteinGrams: 0,
    caloriesKcal: 245,
    userQuickReplyText: '응, 오늘 산책 기록으로 저장해줘!',
    isConfirmed: true,
    imageUrl: null,
  },
  {
    id: 'ze_glp1',
    sourceBadge: 'GLP-1 주사 데이 & 부작용 체크',
    detectedTime: '오늘 오전 08:30',
    title: '마운자로 5.0mg · 복부 우하단 투여',
    miloQuestion:
      '오늘 아침 오른쪽 복부에 마운자로 5mg 맞고 살짝 울렁거린다고 했지? 부작용 케어 노트에 이렇게 기록할까?',
    nutritionOrMetricSummary: '로테이션: 좌하복부(지난주) → 우하복부(오늘) · 오심 Level 2/5',
    proteinGrams: 0,
    caloriesKcal: 0,
    userQuickReplyText: '응, 오른쪽 복부 5mg + 경미한 오심으로 기록해줘',
    isConfirmed: false,
    imageUrl: '/images/img_milo_plush.jpg',
  },
];

export const DEFAULT_GLP1_LOGS: Glp1DoseLog[] = [
  {
    id: 'log_4',
    dateLabel: '4주차 · 10월 15일 (오늘)',
    medicationName: '마운자로 5.0mg',
    doseMg: '5.0mg',
    site: INJECTION_SITES[InjectionSiteId.ABDOMEN_BOTTOM_RIGHT],
    sideEffects: ['경미한 오심', '식욕 억제 양호'],
    nauseaLevel: 2,
    moodEmoji: '😌 평온',
    miloCareNote:
      '증량 2주차로 오심이 지난주(Level 3)보다 완화되었어요. 미지근한 수분 섭취 권장!',
  },
  {
    id: 'log_3',
    dateLabel: '3주차 · 10월 8일',
    medicationName: '마운자로 5.0mg (첫 증량)',
    doseMg: '5.0mg',
    site: INJECTION_SITES[InjectionSiteId.ABDOMEN_BOTTOM_LEFT],
    sideEffects: ['오심(울렁거림)', '피로감'],
    nauseaLevel: 3,
    moodEmoji: '🥺 약간 지침',
    miloCareNote:
      '2.5mg에서 5.0mg 첫 증량 후 다음 날 걸음 수가 3,200보로 줄어 마일로가 휴식을 권했어요.',
  },
  {
    id: 'log_2',
    dateLabel: '2주차 · 10월 1일',
    medicationName: '마운자로 2.5mg',
    doseMg: '2.5mg',
    site: INJECTION_SITES[InjectionSiteId.ABDOMEN_TOP_RIGHT],
    sideEffects: ['부작용 거의 없음'],
    nauseaLevel: 1,
    moodEmoji: '😊 활기참',
    miloCareNote: '우상단 복부 투여 완료! 일일 단백질 75g 이상 꾸준히 달성.',
  },
];

export const DEFAULT_WEIGHT_TREND: DailyWeightPoint[] = [
  {
    weekLabel: '1주차 (2.5mg)',
    weightKg: 78.3,
    skeletalMuscleKg: 28.4,
    doseLabel: '2.5mg',
    nauseaScore: 1,
    moodScore: 82,
  },
  {
    weekLabel: '2주차 (2.5mg)',
    weightKg: 76.9,
    skeletalMuscleKg: 28.3,
    doseLabel: '2.5mg',
    nauseaScore: 1,
    moodScore: 86,
  },
  {
    weekLabel: '3주차 (5.0mg)',
    weightKg: 75.4,
    skeletalMuscleKg: 28.2,
    doseLabel: '5.0mg',
    nauseaScore: 3,
    moodScore: 74,
  },
  {
    weekLabel: '4주차 (오늘)',
    weightKg: 74.2,
    skeletalMuscleKg: 28.2,
    doseLabel: '5.0mg',
    nauseaScore: 2,
    moodScore: 88,
  },
];

export const DEFAULT_DOCTOR_SUMMARY = `• [체성분 변화 요약] 최근 4주간 총 -4.1kg 감량 (78.3kg → 74.2kg). 골격근량은 28.4kg → 28.2kg으로 근손실이 최소화됨.
• [GLP-1 투여 및 부위 순환] 마운자로 2.5mg 2주 투여 후 5.0mg 증량 2주차. 복부 4분면(우상→좌하→우하) 로테이션 100% 준수.
• [부작용 및 정서 상관관계] 5.0mg 증량 후 12~24시간 내 오심(Nausea Level 2~3) 및 활동량 감소가 관찰되었으나 분할 식사 및 수분 섭취로 48시간 내 회복.
• [식이 및 활동 순응도] 일평균 6,420보 보행 및 일일 단백질 평균 74g 섭취 유지 중.`;

export const DEFAULT_CHAT_MESSAGES: MiloChatMessage[] = [
  {
    id: 'c1',
    senderIsMilo: true,
    text: '안녕! 오늘 마운자로 5mg 맞는 날이고 벌써 6,420보나 걸었네! 점심에 찍어둔 연어 포케 사진도 발견했어 헤헤 💙 속은 안 울렁거려?',
    timestamp: '오후 1:15',
    actionCardText: '능동형 감지 완료: [연어 포케 사진 1건] · [Health Connect 6,420보]',
  },
];
