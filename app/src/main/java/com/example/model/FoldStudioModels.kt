package com.example.model

import androidx.annotation.DrawableRes

enum class FoldPostureMode(
    val titleKo: String,
    val specSubtitle: String,
    val ratioLabel: String
) {
    UNFOLDED_DUAL(
        titleKo = "펼침 대화면 (Unfolded)",
        specSubtitle = "Galaxy Z Fold 7 · 8.0\" QXGA+ (좌: 마일로 스테이지 / 우: 케어 허브)",
        ratioLabel = "Dual-Pane 8.0\""
    ),
    FLEX_TABLETOP(
        titleKo = "플렉스 모드 (Flex 115°)",
        specSubtitle = "상단: 살아있는 마일로 교감 / 하단: 확인형 기록 & GLP-1 패드",
        ratioLabel = "Flex 115°"
    ),
    COVER_COMPACT(
        titleKo = "커버 화면 (Cover)",
        specSubtitle = "6.3\" 한 손 빠른 확인 & 음성 대화 모드",
        ratioLabel = "Cover 6.3\""
    )
}

enum class StudioDestination(val labelKo: String) {
    DUAL_WORKSPACE("듀얼 홈"),
    ZERO_EFFORT_LOG("확인형 기록"),
    GLP1_CARE("GLP-1 케어"),
    MILO_MOTIONS("마일로 14종"),
    DOCTOR_REPORT("병원 리포트")
}

/**
 * All 14 poses from the user's attached Milo character sheets:
 * - milo-events.jpg (6 poses)
 * - milo-excercise-1.jpg (4 poses)
 * - milo-excercise-2.jpg (4 poses)
 */
enum class MiloPoseState(
    val titleKo: String,
    val titleEn: String,
    val sheetCategory: String,
    val miloBubbleQuote: String,
    val badgeColorHex: Long
) {
    // 6 Event & Care Poses (milo-events.jpg)
    HAPPY_CHEERING(
        titleKo = "기쁨 / 칭찬",
        titleEn = "Happy & Cheering",
        sheetCategory = "감정·이벤트 (Events)",
        miloBubbleQuote = "우와! 오늘 걸음 수랑 수분 섭취 목표 다 채웠네! 진짜 대단해 헤헤 💙",
        badgeColorHex = 0xFF34D399
    ),
    LISTENING_COMFORTING(
        titleKo = "경청 / 공감",
        titleEn = "Listening & Comforting",
        sheetCategory = "감정·이벤트 (Events)",
        miloBubbleQuote = "응응, 내가 다 듣고 있어. 오늘 하루 어떤 기분이었는지 편하게 말해줘!",
        badgeColorHex = 0xFF7DD3FC
    ),
    SAD_WORRIED(
        titleKo = "걱정 / 부작용 공감",
        titleEn = "Sad / Sick / Worried",
        sheetCategory = "감정·이벤트 (Events)",
        miloBubbleQuote = "주사 맞고 속이 많이 울렁거렸구나… 무리하지 말고 따뜻한 물 조금씩 마시자 😢",
        badgeColorHex = 0xFFFB7185
    ),
    GLP1_ACTION(
        titleKo = "GLP-1 주사 & 케어",
        titleEn = "GLP-1 Action",
        sheetCategory = "감정·이벤트 (Events)",
        miloBubbleQuote = "지난주엔 왼쪽 배에 맞았으니까, 오늘은 오른쪽 배에 맞을 차례야! 반창고도 콩 붙였어!",
        badgeColorHex = 0xFFA5B4FC
    ),
    MEAL_CHECK(
        titleKo = "식단 & 카운팅",
        titleEn = "Meal & Health Check",
        sheetCategory = "감정·이벤트 (Events)",
        miloBubbleQuote = "점심 사진 보니까 연어 포케 먹었네! 단백질 28g 합격! 밥은 반 남겼지?",
        badgeColorHex = 0xFFFCD34D
    ),
    SUCCESS_SCALE(
        titleKo = "체중 기록 완료",
        titleEn = "Success & Scale",
        sheetCategory = "감정·이벤트 (Events)",
        miloBubbleQuote = "오늘 아침 체중 74.2kg 기록 완료! 한 달 동안 근육 손실 없이 -4.1kg 감량 중이야!",
        badgeColorHex = 0xFF38BDF8
    ),

    // 4 Exercise Sheet 1 Poses (milo-excercise-1.jpg)
    WALKING_CHEERFULLY(
        titleKo = "신나게 걷기",
        titleEn = "Walking Cheerfully",
        sheetCategory = "운동 모션 1 (Exercise 1)",
        miloBubbleQuote = "살랑살랑 산책하니까 기분도 한결 가벼워진다! 오늘 6,420보 걸었어!",
        badgeColorHex = 0xFF34D399
    ),
    STEADY_JOGGING(
        titleKo = "가볍게 뛰기",
        titleEn = "Steady Jogging",
        sheetCategory = "운동 모션 1 (Exercise 1)",
        miloBubbleQuote = "헛둘헛둘! 무리하지 않는 슬로우 조깅으로 심박수 122bpm 유지 중!",
        badgeColorHex = 0xFFFB923C
    ),
    SQUAT_READY(
        titleKo = "스쿼트 준비",
        titleEn = "Starting a Squat",
        sheetCategory = "운동 모션 1 (Exercise 1)",
        miloBubbleQuote = "GLP-1 맞을 땐 하체 근손실 방지가 제일 중요해! 나랑 스쿼트 10개만 준비~",
        badgeColorHex = 0xFF60A5FA
    ),
    SQUAT_HOLD(
        titleKo = "스쿼트 동작",
        titleEn = "Squat Hold & Exercising",
        sheetCategory = "운동 모션 1 (Exercise 1)",
        miloBubbleQuote = "으랏차차! 허벅지에 힘 꽉! 근손실 절대 지켜!!",
        badgeColorHex = 0xFFF43F5E
    ),

    // 4 Exercise Sheet 2 Poses (milo-excercise-2.jpg)
    CYCLING(
        titleKo = "자전거 타기",
        titleEn = "Cycling",
        sheetCategory = "운동 모션 2 (Exercise 2)",
        miloBubbleQuote = "쌩쌩~ 관절에 무리 없는 실내 자전거 25분 타기 성공!",
        badgeColorHex = 0xFF2DD4BF
    ),
    STRENGTH_TRAINING(
        titleKo = "근력 운동",
        titleEn = "Strength Training",
        sheetCategory = "운동 모션 2 (Exercise 2)",
        miloBubbleQuote = "으쌰! 덤벨 들고 근력 뿜뿜! 기초대사량을 높여보자!",
        badgeColorHex = 0xFFF472B6
    ),
    YOGA_STRETCHING(
        titleKo = "요가 & 스트레칭",
        titleEn = "Yoga & Stretching",
        sheetCategory = "운동 모션 2 (Exercise 2)",
        miloBubbleQuote = "후우~ 깊게 숨을 들이마시고 내쉬면서 오늘 쌓인 스트레스를 다 풀어주자 🧘",
        badgeColorHex = 0xFFC084FC
    ),
    STAIR_CLIMBING(
        titleKo = "계단 오르기",
        titleEn = "Stair Climbing",
        sheetCategory = "운동 모션 2 (Exercise 2)",
        miloBubbleQuote = "한 계단씩 총총! 일상 속 계단 오르기가 최고의 유산소 운동이야!",
        badgeColorHex = 0xFFFBBF24
    )
}

enum class MiloTurnaroundView(val labelKo: String) {
    FRONT("정면 (Front)"),
    SIDE("측면 꼬리 (Side)"),
    BACK("뒷모습 (Back)")
}

enum class InjectionSite(
    val id: String,
    val labelKo: String,
    val shortLabel: String,
    val lastUsedDaysAgo: Int,
    val isRecommendedToday: Boolean
) {
    ABDOMEN_TOP_LEFT("abd_tl", "복부 좌상단", "좌상 복부", 21, false),
    ABDOMEN_TOP_RIGHT("abd_tr", "복부 우상단", "우상 복부", 14, false),
    ABDOMEN_BOTTOM_LEFT("abd_bl", "복부 좌하단 (지난주 투여)", "좌하 복부", 7, false),
    ABDOMEN_BOTTOM_RIGHT("abd_br", "복부 우하단 (오늘 추천 ⭐)", "우하 복부", 28, true),
    THIGH_LEFT("thigh_l", "왼쪽 허벅지", "좌측 허벅지", 35, false),
    THIGH_RIGHT("thigh_r", "오른쪽 허벅지", "우측 허벅지", 42, false)
}

data class ZeroEffortConfirmItem(
    val id: String,
    val sourceBadge: String,
    val detectedTime: String,
    val title: String,
    val miloQuestion: String,
    val nutritionOrMetricSummary: String,
    val proteinGrams: Int,
    val caloriesKcal: Int,
    val userQuickReplyText: String,
    val isConfirmed: Boolean = false,
    @DrawableRes val imageResId: Int? = null,
    val customImageUri: String? = null
)

data class Glp1DoseLog(
    val id: String,
    val dateLabel: String,
    val medicationName: String,
    val doseMg: String,
    val site: InjectionSite,
    val sideEffects: List<String>,
    val nauseaLevel: Int, // 0..5
    val moodEmoji: String,
    val miloCareNote: String
)

data class MiloChatMessage(
    val id: String,
    val senderIsMilo: Boolean,
    val text: String,
    val timestamp: String,
    val actionCardText: String? = null,
    val isActionConfirmed: Boolean = false
)

data class DailyWeightPoint(
    val weekLabel: String,
    val weightKg: Float,
    val skeletalMuscleKg: Float,
    val doseLabel: String,
    val nauseaScore: Int,
    val moodScore: Int
)
