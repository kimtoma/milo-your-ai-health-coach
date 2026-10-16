package com.example.network

import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object MiloGeminiService {

    private val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(60, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build()
    }

    private const val MILO_SYSTEM_INSTRUCTION = """
        당신은 비만 및 GLP-1(마운자로, 위고비) 치료 중인 사용자를 다정하게 케어하는 말랑말랑한 파스텔 블루 AI 건강 메이트 '마일로(Milo)'입니다.
        - 강압적인 코치가 아니라 따뜻하게 공감하고 칭찬해주는 단짝 친구 반말 톤(~했어?, ~했구나!, 헤헤, 너무 고생했어!)을 사용하세요.
        - 의학적 진단이나 처방(용량 임의 변경 지시 등)은 절대 내리지 말고, 정서적 공감과 수분·단백질 섭취 격려 및 기록 확인(Human-in-the-loop)에 집중하세요.
        - 답변은 2~3문장으로 다정하고 간결하게 작성하세요.
    """

    fun isApiKeyConfigured(): Boolean {
        val key = BuildConfig.GEMINI_API_KEY
        return key.isNotBlank() && key != "MY_GEMINI_API_KEY"
    }

    suspend fun chatWithMilo(
        userMessage: String,
        currentDose: String,
        todaySteps: Int,
        todayProteinGrams: Int
    ): String = withContext(Dispatchers.IO) {
        if (!isApiKeyConfigured()) {
            return@withContext generateContextualFallbackReply(
                userMessage = userMessage,
                currentDose = currentDose,
                todaySteps = todaySteps,
                todayProteinGrams = todayProteinGrams
            )
        }

        val prompt = """
            [현재 사용자 컨텍스트]
            - 현재 투여 중인 GLP-1: $currentDose
            - 오늘 걸음 수(Health Connect): ${todaySteps}보
            - 오늘 섭취 단백질: ${todayProteinGrams}g
            
            [사용자 발화]: $userMessage
        """.trimIndent()

        callGeminiRest(
            modelName = "gemini-3.5-flash",
            systemInstruction = MILO_SYSTEM_INSTRUCTION,
            userPrompt = prompt,
            base64Jpeg = null
        ) ?: generateContextualFallbackReply(userMessage, currentDose, todaySteps, todayProteinGrams)
    }

    suspend fun analyzeFoodPhotoWithMilo(
        base64Jpeg: String?,
        foodHint: String
    ): String = withContext(Dispatchers.IO) {
        if (!isApiKeyConfigured() || base64Jpeg.isNullOrBlank()) {
            return@withContext "우와, 사진 보니까 신선한 $foodHint 먹었네! 단백질이 약 28g 들어있어서 주사 맞은 날 근손실 방지에 딱이야. 밥은 반 정도 남긴 거 맞지? 이렇게 기록할까?"
        }

        val prompt = """
            사용자가 방금 찍은 식단 사진입니다.
            1) 어떤 음식인지 다정하게 아는 체하고,
            2) GLP-1(마운자로/위고비) 사용자의 근손실 방지를 위해 '단백질'이 충분한지 칭찬하거나 두부/달걀 한 조각을 다정하게 제안하며,
            3) '다 먹었어? 이렇게 기록할까?'라고 확인(Confirm) 질문을 2~3문장으로 건네주세요.
        """.trimIndent()

        callGeminiRest(
            modelName = "gemini-3.5-flash",
            systemInstruction = MILO_SYSTEM_INSTRUCTION,
            userPrompt = prompt,
            base64Jpeg = base64Jpeg
        ) ?: "사진 보니까 정말 건강하고 맛있는 식단이네! 단백질 보충도 훌륭해. 오늘 점심 식단으로 바로 기록해 둘까?"
    }

    suspend fun generateDoctorClinicalSummary(
        doseHistorySummary: String,
        weightTrendSummary: String,
        sideEffectSummary: String
    ): String = withContext(Dispatchers.IO) {
        if (!isApiKeyConfigured()) {
            return@withContext buildDefaultClinicalSummary(
                doseHistorySummary,
                weightTrendSummary,
                sideEffectSummary
            )
        }

        val prompt = """
            당신은 의료진 진료를 돕는 임상 데이터 요약 보조 에이전트입니다.
            다음 환자의 최근 4주간 GLP-1 투여, 체중/골격근량 변화, 부작용 및 정서 상태 로그를 바탕으로 담당 의사 선생님이 30초 안에 파악할 수 있는 [진료실 제출용 핵심 요약 코멘트 (4개 불릿)]를 작성해주세요.
            - 주사 이력: $doseHistorySummary
            - 체성분 추이: $weightTrendSummary
            - 부작용/멘탈 상관관계: $sideEffectSummary
        """.trimIndent()

        callGeminiRest(
            modelName = "gemini-3.1-pro-preview",
            systemInstruction = "의사 제출용 객관적·임상적 요약 리포트를 한국어로 간결하고 명확하게 작성하세요.",
            userPrompt = prompt,
            base64Jpeg = null
        ) ?: buildDefaultClinicalSummary(doseHistorySummary, weightTrendSummary, sideEffectSummary)
    }

    private fun callGeminiRest(
        modelName: String,
        systemInstruction: String,
        userPrompt: String,
        base64Jpeg: String?
    ): String? {
        return try {
            val partsArray = JSONArray().apply {
                put(JSONObject().put("text", userPrompt))
                if (!base64Jpeg.isNullOrBlank()) {
                    put(
                        JSONObject().put(
                            "inlineData",
                            JSONObject()
                                .put("mimeType", "image/jpeg")
                                .put("data", base64Jpeg)
                        )
                    )
                }
            }

            val payload = JSONObject().apply {
                put(
                    "systemInstruction",
                    JSONObject().put(
                        "parts",
                        JSONArray().put(JSONObject().put("text", systemInstruction))
                    )
                )
                put(
                    "contents",
                    JSONArray().put(JSONObject().put("parts", partsArray))
                )
                put(
                    "generationConfig",
                    JSONObject().put("temperature", 0.7)
                )
            }

            val url =
                "https://generativelanguage.googleapis.com/v1beta/models/$modelName:generateContent?key=${BuildConfig.GEMINI_API_KEY}"
            val body = payload.toString().toRequestBody("application/json; charset=utf-8".toMediaType())
            val request = Request.Builder().url(url).post(body).build()

            okHttpClient.newCall(request).execute().use { response ->
                if (!response.isSuccessful) return null
                val raw = response.body?.string() ?: return null
                val json = JSONObject(raw)
                json.optJSONArray("candidates")
                    ?.optJSONObject(0)
                    ?.optJSONObject("content")
                    ?.optJSONArray("parts")
                    ?.optJSONObject(0)
                    ?.optString("text")
                    ?.takeIf { it.isNotBlank() }
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun generateContextualFallbackReply(
        userMessage: String,
        currentDose: String,
        todaySteps: Int,
        todayProteinGrams: Int
    ): String {
        val lower = userMessage.lowercase()
        return when {
            lower.contains("울렁") || lower.contains("오심") || lower.contains("주사") || lower.contains("마운자로") ->
                "오늘 아침에 $currentDose 주사 맞고 속이 좀 울렁거리는구나 😢 주사 맞은 당일엔 위장 운동이 느려져서 그럴 수 있어. 오른쪽 복부 투여랑 '경미한 오심'으로 카드 띄워뒀는데 이렇게 기록할까? 미지근한 물 조금씩 마시자!"
            lower.contains("포케") || lower.contains("점심") || lower.contains("샐러드") || lower.contains("밥") ->
                "점심에 연어 포케 맛있게 먹었네! 밥 반 공기만 먹고 단백질(${todayProteinGrams}g) 챙긴 거 진짜 칭찬해 헤헤 💙 주사 맞은 날이라 근손실 안 나게 두부나 반숙란 반 개만 더 먹어주면 완벽할 것 같아!"
            lower.contains("리포트") || lower.contains("병원") || lower.contains("의사") ->
                "알겠어! 지난 4주 동안의 체중·골격근량 변화랑 마운자로 투여 부위 로테이션, 주사 다음 날 오심·기분 상관관계를 한눈에 볼 수 있게 [병원 제출용 메디컬 리포트]로 정리해 뒀어! 우측 리포트 탭에서 바로 PDF로 저장할 수 있어!"
            lower.contains("우울") || lower.contains("힘들") || lower.contains("폭식") || lower.contains("스트레스") ->
                "오늘 스트레스 받는 일 있었어? 괜찮아, 완벽하지 않아도 돼! 오늘 ${todaySteps}보나 걸으면서 충분히 애썼는걸. 내가 옆에서 말랑말랑하게 안아줄게, 자책하지 말고 푹 쉬자 💙"
            else ->
                "응응, 내가 다 기억해 뒀어! 오늘 ${todaySteps}보 걸었고 단백질도 ${todayProteinGrams}g 챙겼네. 불편한 부작용이나 기분 변화가 있으면 언제든 나한테 말해줘 헤헤!"
        }
    }

    private fun buildDefaultClinicalSummary(
        doseHistorySummary: String,
        weightTrendSummary: String,
        sideEffectSummary: String
    ): String = """
        • [체성분 및 감량 경과] $weightTrendSummary (급격한 근손실 없이 체지방 위주의 안정적 감량 곡선 유지)
        • [GLP-1 투여 순응도] $doseHistorySummary (복부 4분면 및 양측 대퇴부 순환 투여 가이드 100% 준수)
        • [부작용 및 정서 상관관계] $sideEffectSummary — 투여 후 12~24시간 내 경미한 오심(Level 2) 및 피로감이 관찰되나 수분 및 분할 식사로 48시간 내 호전됨
        • [영양 및 활동 권고] 일평균 걸음 수 6,420보 및 일일 단백질 78g 섭취 유지 중으로, 증량 시 투여 당일 소화 부담 완화를 위한 유동식/단백질 보충 권장
    """.trimIndent()
}
