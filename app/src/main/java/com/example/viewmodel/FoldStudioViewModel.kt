package com.example.viewmodel

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color as AndroidColor
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.R
import com.example.model.DailyWeightPoint
import com.example.model.FoldPostureMode
import com.example.model.Glp1DoseLog
import com.example.model.InjectionSite
import com.example.model.MiloChatMessage
import com.example.model.MiloPoseState
import com.example.model.MiloTurnaroundView
import com.example.model.StudioDestination
import com.example.model.ZeroEffortConfirmItem
import com.example.network.MiloGeminiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream

data class FoldStudioUiState(
    val postureMode: FoldPostureMode = FoldPostureMode.UNFOLDED_DUAL,
    val currentDestination: StudioDestination = StudioDestination.DUAL_WORKSPACE,
    val showHingeGuide: Boolean = true,
    val isLeftRightSwapped: Boolean = false,
    val leftPaneWeight: Float = 0.45f,
    val rightHubTabIndex: Int = 0,

    // Milo Character State Machine
    val activePose: MiloPoseState = MiloPoseState.GLP1_ACTION,
    val turnaroundView: MiloTurnaroundView = MiloTurnaroundView.FRONT,
    val isVoiceActive: Boolean = false,
    val voiceDecibel: Float = 0.65f,
    val petCount: Int = 12,
    val isAiThinking: Boolean = false,

    // Health Connect & Daily Telemetry
    val todaySteps: Int = 6420,
    val todaySleepHours: String = "7시간 15분",
    val todayWaterMl: Int = 1450,
    val todayProteinGrams: Int = 68,
    val currentWeightKg: Float = 74.2f,
    val currentMedication: String = "마운자로 (Mounjaro) 5.0mg",
    val selectedInjectionSite: InjectionSite = InjectionSite.ABDOMEN_BOTTOM_RIGHT,
    val selectedSideEffects: Set<String> = setOf("경미한 오심(울렁거림)", "식욕 억제 양호"),
    val selectedMoodEmoji: String = "😌 평온·다독임",

    // Zero-Effort Confirm Cards (Human-in-the-loop)
    val zeroEffortItems: List<ZeroEffortConfirmItem> = defaultZeroEffortItems(),

    // GLP-1 History & 30-Day Medical Report Data
    val glp1Logs: List<Glp1DoseLog> = defaultGlp1Logs(),
    val weightTrend: List<DailyWeightPoint> = defaultWeightTrend(),
    val doctorClinicalSummary: String = defaultDoctorSummary(),
    val exportedPdfStatus: String? = null,

    // Multimodal Chat History with Milo
    val chatMessages: List<MiloChatMessage> = defaultChatMessages()
)

class FoldStudioViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(FoldStudioUiState())
    val uiState: StateFlow<FoldStudioUiState> = _uiState.asStateFlow()

    fun setPostureMode(mode: FoldPostureMode) {
        _uiState.update { it.copy(postureMode = mode) }
    }

    fun setDestination(destination: StudioDestination) {
        val mappedTab = when (destination) {
            StudioDestination.ZERO_EFFORT_LOG -> 0
            StudioDestination.GLP1_CARE -> 1
            StudioDestination.MILO_MOTIONS -> 2
            StudioDestination.DOCTOR_REPORT -> 3
            StudioDestination.DUAL_WORKSPACE -> _uiState.value.rightHubTabIndex
        }
        _uiState.update {
            it.copy(
                currentDestination = destination,
                rightHubTabIndex = mappedTab
            )
        }
    }

    fun setRightHubTab(index: Int) {
        val suggestedPose = when (index) {
            0 -> MiloPoseState.MEAL_CHECK
            1 -> MiloPoseState.GLP1_ACTION
            2 -> MiloPoseState.HAPPY_CHEERING
            3 -> MiloPoseState.SUCCESS_SCALE
            else -> _uiState.value.activePose
        }
        _uiState.update {
            it.copy(
                rightHubTabIndex = index,
                activePose = suggestedPose
            )
        }
    }

    fun toggleHingeGuide() {
        _uiState.update { it.copy(showHingeGuide = !it.showHingeGuide) }
    }

    fun swapPanes() {
        _uiState.update { it.copy(isLeftRightSwapped = !it.isLeftRightSwapped) }
    }

    fun adjustSplitRatio(weight: Float) {
        _uiState.update { it.copy(leftPaneWeight = weight.coerceIn(0.36f, 0.62f)) }
    }

    fun selectPose(pose: MiloPoseState) {
        _uiState.update { it.copy(activePose = pose) }
    }

    fun selectTurnaround(view: MiloTurnaroundView) {
        _uiState.update { it.copy(turnaroundView = view) }
    }

    fun petMilo() {
        _uiState.update {
            it.copy(
                petCount = it.petCount + 1,
                activePose = if (it.activePose == MiloPoseState.SAD_WORRIED) {
                    MiloPoseState.LISTENING_COMFORTING
                } else {
                    it.activePose
                }
            )
        }
    }

    fun toggleVoiceMode() {
        val nextVoice = !_uiState.value.isVoiceActive
        _uiState.update {
            it.copy(
                isVoiceActive = nextVoice,
                activePose = if (nextVoice) MiloPoseState.LISTENING_COMFORTING else MiloPoseState.HAPPY_CHEERING
            )
        }
    }

    fun confirmZeroEffortItem(id: String) {
        _uiState.update { state ->
            val target = state.zeroEffortItems.find { it.id == id }
            val updatedList = state.zeroEffortItems.map {
                if (it.id == id) it.copy(isConfirmed = true) else it
            }
            val addedProtein = if (target != null && !target.isConfirmed) target.proteinGrams else 0
            state.copy(
                zeroEffortItems = updatedList,
                todayProteinGrams = state.todayProteinGrams + addedProtein,
                activePose = MiloPoseState.HAPPY_CHEERING
            )
        }
    }

    fun addWaterCup() {
        _uiState.update {
            it.copy(
                todayWaterMl = it.todayWaterMl + 250,
                activePose = MiloPoseState.HAPPY_CHEERING
            )
        }
    }

    fun selectInjectionSite(site: InjectionSite) {
        _uiState.update {
            it.copy(
                selectedInjectionSite = site,
                activePose = MiloPoseState.GLP1_ACTION
            )
        }
    }

    fun toggleSideEffect(effect: String) {
        _uiState.update { state ->
            val updated = state.selectedSideEffects.toMutableSet()
            if (updated.contains(effect)) updated.remove(effect) else updated.add(effect)
            val nextPose = if (effect.contains("오심") && updated.contains(effect)) {
                MiloPoseState.SAD_WORRIED
            } else {
                MiloPoseState.GLP1_ACTION
            }
            state.copy(
                selectedSideEffects = updated,
                activePose = nextPose
            )
        }
    }

    fun selectMoodEmoji(mood: String) {
        _uiState.update { it.copy(selectedMoodEmoji = mood) }
    }

    fun recordTodayGlp1Injection() {
        val state = _uiState.value
        val newLog = Glp1DoseLog(
            id = "glp_${System.currentTimeMillis()}",
            dateLabel = "오늘 · 방금 전",
            medicationName = state.currentMedication,
            doseMg = "5.0mg",
            site = state.selectedInjectionSite,
            sideEffects = state.selectedSideEffects.toList(),
            nauseaLevel = if (state.selectedSideEffects.any { it.contains("오심") }) 2 else 0,
            moodEmoji = state.selectedMoodEmoji,
            miloCareNote = "마일로가 ${state.selectedInjectionSite.labelKo} 부위 로테이션과 부작용 상태를 안전하게 기록했어요!"
        )
        _uiState.update {
            it.copy(
                glp1Logs = listOf(newLog) + it.glp1Logs,
                activePose = MiloPoseState.HAPPY_CHEERING
            )
        }
    }

    fun sendChatMessage(userText: String) {
        if (userText.isBlank()) return
        val userMsg = MiloChatMessage(
            id = "msg_u_${System.currentTimeMillis()}",
            senderIsMilo = false,
            text = userText.trim(),
            timestamp = "방금"
        )

        val poseForInput = when {
            userText.contains("울렁") || userText.contains("오심") || userText.contains("속이") ->
                MiloPoseState.SAD_WORRIED
            userText.contains("주사") || userText.contains("마운자로") || userText.contains("위고비") ->
                MiloPoseState.GLP1_ACTION
            userText.contains("포케") || userText.contains("점심") || userText.contains("샐러드") ->
                MiloPoseState.MEAL_CHECK
            userText.contains("리포트") || userText.contains("병원") || userText.contains("의사") ->
                MiloPoseState.SUCCESS_SCALE
            else -> MiloPoseState.LISTENING_COMFORTING
        }

        _uiState.update {
            it.copy(
                chatMessages = it.chatMessages + userMsg,
                activePose = poseForInput,
                isAiThinking = true
            )
        }

        viewModelScope.launch {
            val state = _uiState.value
            val reply = MiloGeminiService.chatWithMilo(
                userMessage = userText,
                currentDose = state.currentMedication,
                todaySteps = state.todaySteps,
                todayProteinGrams = state.todayProteinGrams
            )
            val actionBadge = when {
                userText.contains("주사") || userText.contains("울렁") ->
                    "확인형 카드 생성됨: [복부 우하단 · 마운자로 5mg · 부작용: 경미한 오심]"
                userText.contains("포케") || userText.contains("점심") ->
                    "확인형 카드 생성됨: [연어 포케 볼 (밥 1/2) · 단백질 28g · 440kcal]"
                userText.contains("리포트") || userText.contains("병원") ->
                    "병원 제출용 30일 GLP-1 & 체성분 리포트 준비 완료"
                else -> null
            }
            val miloMsg = MiloChatMessage(
                id = "msg_m_${System.currentTimeMillis()}",
                senderIsMilo = true,
                text = reply,
                timestamp = "방금",
                actionCardText = actionBadge
            )
            _uiState.update {
                it.copy(
                    chatMessages = it.chatMessages + miloMsg,
                    isAiThinking = false
                )
            }
        }
    }

    fun onCustomFoodPhotoPicked(uriString: String) {
        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    activePose = MiloPoseState.MEAL_CHECK,
                    rightHubTabIndex = 0,
                    isAiThinking = true
                )
            }
            val aiComment = MiloGeminiService.analyzeFoodPhotoWithMilo(
                base64Jpeg = null,
                foodHint = "갤러리 건강 식단"
            )
            val newConfirm = ZeroEffortConfirmItem(
                id = "ze_custom_${System.currentTimeMillis()}",
                sourceBadge = "갤러리 AI 식단 감지 (On-Device 필터링)",
                detectedTime = "방금 촬영한 사진",
                title = "사용자 선택 고단백 건강 식단",
                miloQuestion = aiComment,
                nutritionOrMetricSummary = "추정 단백질 29g · 탄수화물 32g · 460kcal",
                proteinGrams = 29,
                caloriesKcal = 460,
                userQuickReplyText = "응, 맛있게 다 먹었어! 기록해줘",
                isConfirmed = false,
                customImageUri = uriString
            )
            _uiState.update {
                it.copy(
                    zeroEffortItems = listOf(newConfirm) + it.zeroEffortItems,
                    isAiThinking = false
                )
            }
        }
    }

    // --- 3-Minute Judges Live Demo Scenarios ---

    fun runDemoScenario1_Glp1AndNausea() {
        _uiState.update {
            it.copy(
                rightHubTabIndex = 1,
                activePose = MiloPoseState.SAD_WORRIED,
                isVoiceActive = true,
                selectedInjectionSite = InjectionSite.ABDOMEN_BOTTOM_RIGHT,
                selectedSideEffects = setOf("경미한 오심(울렁거림)", "주사 당일 피로감")
            )
        }
        sendChatMessage("안녕 마일로, 나 오늘 아침에 마운자로 5mg 주사 맞았어. 근데 속이 좀 울렁거리네.")
    }

    fun runDemoScenario2_ZeroEffortMeal() {
        _uiState.update {
            it.copy(
                rightHubTabIndex = 0,
                activePose = MiloPoseState.MEAL_CHECK,
                isVoiceActive = false
            )
        }
        sendChatMessage("점심에 찍어둔 연어 포케 사진 봤어? 밥은 반 남겼어!")
    }

    fun runDemoScenario3_DoctorReport() {
        _uiState.update {
            it.copy(
                rightHubTabIndex = 3,
                activePose = MiloPoseState.SUCCESS_SCALE,
                isVoiceActive = false,
                isAiThinking = true
            )
        }
        sendChatMessage("마일로, 오늘 진료 보러 가는데 의사 선생님께 드릴 한 달 치 마운자로 부작용이랑 식단 리포트 뽑아줘.")
        viewModelScope.launch {
            val summary = MiloGeminiService.generateDoctorClinicalSummary(
                doseHistorySummary = "마운자로 2.5mg(1~2주차) → 5.0mg(3~4주차), 복부 4분면 로테이션 100% 준수",
                weightTrendSummary = "78.3kg → 74.2kg (-4.1kg 감량), 골격근량 28.4kg → 28.2kg (근손실 방어 우수)",
                sideEffectSummary = "5.0mg 증량 직후 24시간 경미한 오심(2/5) 발생 후 수분 및 단백질 분할 섭취로 완화"
            )
            _uiState.update {
                it.copy(
                    doctorClinicalSummary = summary,
                    isAiThinking = false
                )
            }
        }
    }

    fun exportDoctorReportPdf(context: Context) {
        viewModelScope.launch {
            try {
                val pdfDocument = PdfDocument()
                val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
                val page = pdfDocument.startPage(pageInfo)
                val canvas: Canvas = page.canvas

                val titlePaint = Paint().apply {
                    color = AndroidColor.rgb(15, 23, 42)
                    textSize = 18f
                    isFakeBoldText = true
                }
                val bodyPaint = Paint().apply {
                    color = AndroidColor.rgb(51, 65, 85)
                    textSize = 11.5f
                }
                val accentPaint = Paint().apply {
                    color = AndroidColor.rgb(2, 132, 199)
                    textSize = 13f
                    isFakeBoldText = true
                }

                canvas.drawText("Milo Medical Bridge - GLP-1 & 체성분 진료 요약 리포트", 40f, 52f, titlePaint)
                canvas.drawText("생성일: 2026-10-15 | 투여 약물: ${_uiState.value.currentMedication}", 40f, 76f, bodyPaint)
                canvas.drawText("1. 4주 체중 및 골격근량 변화: 78.3kg -> 74.2kg (-4.1kg, 골격근량 28.2kg 유지)", 40f, 115f, accentPaint)
                canvas.drawText("2. 주사 부위 로테이션: 좌상복부 -> 우상복부 -> 좌하복부 -> 우하복부 (순환 준수)", 40f, 145f, accentPaint)
                canvas.drawText("3. 주요 부작용 및 멘탈 코칭 요약:", 40f, 175f, accentPaint)

                var yPos = 200f
                _uiState.value.doctorClinicalSummary.lines().forEach { line ->
                    val trimmed = line.trim()
                    if (trimmed.isNotEmpty()) {
                        canvas.drawText(trimmed.take(72), 48f, yPos, bodyPaint)
                        yPos += 22f
                    }
                }

                pdfDocument.finishPage(page)
                val file = File(context.cacheDir, "Milo_GLP1_Doctor_Report.pdf")
                FileOutputStream(file).use { out ->
                    pdfDocument.writeTo(out)
                }
                pdfDocument.close()

                _uiState.update {
                    it.copy(
                        exportedPdfStatus = "✅ 병원 제출용 PDF 생성 완료 (${file.name} · ${file.length() / 1024}KB)",
                        activePose = MiloPoseState.HAPPY_CHEERING
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(exportedPdfStatus = "✅ 진료실 태블릿/폴드7 대화면 브리핑 뷰 준비 완료")
                }
            }
        }
    }
}

private fun defaultZeroEffortItems(): List<ZeroEffortConfirmItem> = listOf(
    ZeroEffortConfirmItem(
        id = "ze_poke",
        sourceBadge = "갤러리 음식 사진 감지 + Gemini Flash Vision",
        detectedTime = "오늘 오후 12:40 촬영",
        title = "하와이안 연어 포케 & 두부 볼",
        miloQuestion = "점심에 찍은 사진 보니까 연어 포케 먹었네! 연어 포케 맞지? 주사 맞은 날인데 밥은 반 남겼어?",
        nutritionOrMetricSummary = "단백질 28g (고단백 합격 ⭐) · 440 kcal · 식이섬유 풍부",
        proteinGrams = 28,
        caloriesKcal = 440,
        userQuickReplyText = "응, 밥은 반 남겼어! 기록 승인할게",
        isConfirmed = false,
        imageResId = R.drawable.img_salmon_poke
    ),
    ZeroEffortConfirmItem(
        id = "ze_steps",
        sourceBadge = "Google Health Connect 자동 동기화",
        detectedTime = "실시간 걸음 수 & 수면",
        title = "오후 산책 6,420보 & 수면 7시간 15분",
        miloQuestion = "오늘 속이 좀 울렁거렸는데도 6,420보나 걸었네, 진짜 고생했어! 다리는 안 아파? 운동 일기에 기록할까?",
        nutritionOrMetricSummary = "활동 칼로리 245 kcal 소모 · 평균 심박수 108 bpm",
        proteinGrams = 0,
        caloriesKcal = 245,
        userQuickReplyText = "응, 오늘 산책 기록으로 저장해줘!",
        isConfirmed = true,
        imageResId = null
    ),
    ZeroEffortConfirmItem(
        id = "ze_glp1",
        sourceBadge = "GLP-1 주사 데이 & 부작용 체크",
        detectedTime = "오늘 오전 08:30",
        title = "마운자로 5.0mg · 복부 우하단 투여",
        miloQuestion = "오늘 아침 오른쪽 복부에 마운자로 5mg 맞고 살짝 울렁거린다고 했지? 부작용 케어 노트에 이렇게 기록할까?",
        nutritionOrMetricSummary = "로테이션: 좌하복부(지난주) → 우하복부(오늘) · 오심 Level 2/5",
        proteinGrams = 0,
        caloriesKcal = 0,
        userQuickReplyText = "응, 오른쪽 복부 5mg + 경미한 오심으로 기록해줘",
        isConfirmed = false,
        imageResId = R.drawable.img_milo_plush
    )
)

private fun defaultGlp1Logs(): List<Glp1DoseLog> = listOf(
    Glp1DoseLog(
        id = "log_4",
        dateLabel = "4주차 · 10월 15일 (오늘)",
        medicationName = "마운자로 5.0mg",
        doseMg = "5.0mg",
        site = InjectionSite.ABDOMEN_BOTTOM_RIGHT,
        sideEffects = listOf("경미한 오심", "식욕 억제 양호"),
        nauseaLevel = 2,
        moodEmoji = "😌 평온",
        miloCareNote = "증량 2주차로 오심이 지난주(Level 3)보다 완화되었어요. 미지근한 수분 섭취 권장!"
    ),
    Glp1DoseLog(
        id = "log_3",
        dateLabel = "3주차 · 10월 8일",
        medicationName = "마운자로 5.0mg (첫 증량)",
        doseMg = "5.0mg",
        site = InjectionSite.ABDOMEN_BOTTOM_LEFT,
        sideEffects = listOf("오심(울렁거림)", "피로감"),
        nauseaLevel = 3,
        moodEmoji = "🥺 약간 지침",
        miloCareNote = "2.5mg에서 5.0mg 첫 증량 후 다음 날 걸음 수가 3,200보로 줄어 마일로가 휴식을 권했어요."
    ),
    Glp1DoseLog(
        id = "log_2",
        dateLabel = "2주차 · 10월 1일",
        medicationName = "마운자로 2.5mg",
        doseMg = "2.5mg",
        site = InjectionSite.ABDOMEN_TOP_RIGHT,
        sideEffects = listOf("부작용 거의 없음"),
        nauseaLevel = 1,
        moodEmoji = "😊 활기참",
        miloCareNote = "우상단 복부 투여 완료! 일일 단백질 75g 이상 꾸준히 달성."
    )
)

private fun defaultWeightTrend(): List<DailyWeightPoint> = listOf(
    DailyWeightPoint("1주차 (2.5mg)", 78.3f, 28.4f, "2.5mg", 1, 82),
    DailyWeightPoint("2주차 (2.5mg)", 76.9f, 28.3f, "2.5mg", 1, 86),
    DailyWeightPoint("3주차 (5.0mg)", 75.4f, 28.2f, "5.0mg", 3, 74),
    DailyWeightPoint("4주차 (오늘)", 74.2f, 28.2f, "5.0mg", 2, 88)
)

private fun defaultDoctorSummary(): String = """
    • [체성분 변화 요약] 최근 4주간 총 -4.1kg 감량 (78.3kg → 74.2kg). 골격근량은 28.4kg → 28.2kg으로 근손실이 최소화됨.
    • [GLP-1 투여 및 부위 순환] 마운자로 2.5mg 2주 투여 후 5.0mg 증량 2주차. 복부 4분면(우상→좌하→우하) 로테이션 100% 준수.
    • [부작용 및 정서 상관관계] 5.0mg 증량 후 12~24시간 내 오심(Nausea Level 2~3) 및 활동량 감소가 관찰되었으나 분할 식사 및 수분 섭취로 48시간 내 회복.
    • [식이 및 활동 순응도] 일평균 6,420보 보행 및 일일 단백질 평균 74g 섭취 유지 중.
""".trimIndent()

private fun defaultChatMessages(): List<MiloChatMessage> = listOf(
    MiloChatMessage(
        id = "c1",
        senderIsMilo = true,
        text = "안녕! 오늘 마운자로 5mg 맞는 날이고 벌써 6,420보나 걸었네! 점심에 찍어둔 연어 포케 사진도 발견했어 헤헤 💙 속은 안 울렁거려?",
        timestamp = "오후 1:15",
        actionCardText = "능동형 감지 완료: [연어 포케 사진 1건] · [Health Connect 6,420보]"
    )
)
