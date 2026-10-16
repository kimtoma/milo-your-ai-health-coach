# 🐾 Milo (마일로)
> **The Living Agentic Health & GLP-1 Companion Built with Gemini 4 Argon**  
> **가장 게으른 방식으로 쓰는 가장 완벽한 GLP-1 & 멘탈 케어 AI 에이전트 컴패니언**

[![Lead Model](https://img.shields.io/badge/Lead%20Brain-gemini--4--argon%20(1M%20Context)-4285F4)](#)
[![Subagents](https://img.shields.io/badge/Companion%20Models-gemini--3.8--flash%20%7C%203.8--live%20%7C%20nano--banana--2.1-34A853)](#)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Jetpack%20Compose-3DDC84?logo=android)](#)

---

## 🌐 Language Navigation
- [🇺🇸 English Documentation](#-english-documentation)
- [🇰🇷 한국어 문서 (Korean Documentation)](#-한국어-문서-korean-documentation)

---

# 🇺🇸 English Documentation

## 1. Hackathon Builder Guide Alignment (The 4 Judging Tests)
Milo is engineered directly around the **4 core judging criteria** of the *Build with Gemini 4 Argon* 1-day hackathon:

| Judging Test | How Milo Passes 100% |
| :--- | :--- |
| **1. Specific Problem for a Real Person** | Built specifically for **GLP-1 patients (Mounjaro / Wegovy)** who struggle with post-injection nausea, injection-site rotation, skeletal muscle loss anxiety, and daily food/symptom logging fatigue. |
| **2. Needed Gemini 4 Argon** | Uses **`gemini-4-argon` (`thinking_level="high"`)** across a shared **1M-token context window** to correlate 30 days of multimodal logs (meals, steps, doses, nausea, mood) into a clinical Doctor's Report, plus procedural 2.5D/3D spring-physics character shaders generated from multimodal character reference sheets. |
| **3. Keeps People in Control** | **Zero-Effort Confirm UI (Human-in-the-Loop):** Milo never writes health records or medical logs silently. It pre-fills detected meal photos and injection logs and asks *"Should I log this?"* with a one-tap **[Confirm & Log]** button. |
| **4. Live Demo Under 3 Minutes** | Features 3 stage-ready live demo triggers (`Demo 1: GLP-1 & Nausea Empathy`, `Demo 2: Salmon Poke Vision Check`, `Demo 3: Autonomous Doctor PDF Report`) plus live voice/text chat and Android Photo Picker input. |

---

## 2. Multi-Agent Architecture & Gemini Toolkit Mapping
Following the **"Orchestrate Argon with Flash and media subagents"** pattern, each model is assigned to its exact specialized role:

| Job in Milo | Model / Agent | Model ID | Role in Application |
| :--- | :--- | :--- | :--- |
| **Lead Brain, 1M-Context Clinical Reasoning & 2.5D/3D Shader Generation** | **Gemini 4 Argon** | `gemini-4-argon` | Synthesizes 30-day GLP-1 dose, weight, muscle mass, and side-effect correlations (`thinking_level="high"`) and powers procedural spring-physics Milo animations. |
| **Fast Parallel Vision & Meal Subagent** | **Gemini 3.8 Flash** | `gemini-3.8-flash` | Low-latency food photo analysis (estimating protein grams & calories to prevent GLP-1 muscle loss). |
| **Medical Guardrail & Intent Routing** | **Gemini 3.5 Flash-Lite** | `gemini-3.5-flash-lite` | High-frequency guardrail ensuring Milo never prescribes dosage changes and routes sensitive symptoms safely. |
| **Real-Time Voice & Empathy Session** | **Gemini 3.8 Live** | `gemini-3.8-live` | Natural two-way voice conversation where Milo's head tuft and aura rings react to live audio decibels. |
| **Character Sprites & Food Visual Assets** | **Nano Banana 2.1** | `gemini-nano-banana-2.1` | High-consistency generation of Milo plush textures and meal reference assets. |
| **Autonomous Clinical Report Sandbox** | **Antigravity Agent** | `antigravity-preview-09-2026` | Autonomous synthesis and verification of physician-ready clinical scorecards & PDF medical bridge reports. |
| **On-Device Photo Privacy Filter** | **Gemma 4** | `gemma-4-31b-it` (E2B/E4B) | Local-first filtering concept so only food photos are selected before cloud vision analysis. |

> **API Cleanliness (Gemini 4 Argon Best Practices):** `MiloGeminiService.kt` uses `thinking_level` (`"low"` | `"medium"` | `"high"`), sets extended 15-minute read timeouts for deep reasoning, and removes all deprecated legacy sampling parameters (`temperature`, `top_p`, `top_k`, `thinking_budget`).

---

## 3. Key Features

### ① Interactive Living Milo (14-Pose State Machine & Spring Physics)
* **Squishy & Reactive:** Built with custom Jetpack Compose procedural shaders and spring physics (`Spring.DampingRatioHighBouncy`). Poking Milo's belly or cheeks triggers a squishy bounce and a warm peach blush.
* **Voice-Reactive Aura:** When voice mode is active, Milo's water-drop head tuft wiggles and concentric aura rings pulse in sync with the user's voice decibels.
* **14 Character Poses & 360° Turnaround (`Front` / `Side Tail` / `Back`):**
  * **6 Event & Care Poses:** `Happy & Cheering`, `Listening & Comforting`, `Sad / Sick / Worried`, `GLP-1 Action (Pen + Band-Aid)`, `Meal & Health Check (Magnifying Glass + Poke Bowl)`, `Success & Scale`.
  * **8 Exercise Poses:** `Walking Cheerfully`, `Steady Jogging`, `Starting a Squat`, `Squat Hold`, `Cycling`, `Strength Training`, `Yoga & Stretching`, `Stair Climbing`.

### ② Zero-Effort Confirm UI (Human-in-the-Loop)
* Milo proactively detects meal photos (e.g., Hawaiian Salmon Poke Bowl) and daily step/sleep telemetry, then asks:
  > *"I saw you took a photo of Salmon Poke for lunch and walked 6,420 steps! Did you leave half the rice? Should I log this with 28g of protein?"*
* Users stay in full control with a single **[One-Tap Confirm & Log]** button and can analyze new meal photos anytime via the zero-permission **Android Photo Picker (`PickVisualMedia`)**.

### ③ GLP-1 Injection Rotation & Side-Effect Care
* **6-Zone Rotation Map:** Tracks Upper-Left/Right Abdomen, Lower-Left/Right Abdomen, and Left/Right Thighs, highlighting today's recommended site (*"Last week was Lower-Left Abdomen, so today is Lower-Right Abdomen ⭐"*).
* **Symptom & Mood Check-In:** Tracks nausea levels, fatigue, appetite suppression, and emotional state with empathetic feedback.

### ④ Doctor's Medical Bridge & Native PDF Export
* Generates a 1-page clinical summary correlating **4-week weight loss (-4.1kg)**, **skeletal muscle preservation (28.2kg)**, **GLP-1 dosage escalation (2.5mg → 5.0mg)**, and **post-injection nausea recovery**.
* Exports a real `.pdf` document (`Milo_GLP1_Doctor_Report.pdf`) using Android's native `PdfDocument` API.

---

## 4. 3-Minute Live Demo Walkthrough
Use the three quick-trigger chips in the top bar for a seamless 3-minute live demo:
1. **`🎬 Demo 1: Injection & Nausea Empathy (0:00–0:45)`** — User reports morning Mounjaro 5mg injection and mild nausea. Milo switches to a worried/empathetic pose, comforts the user, and prepares a confirmation card.
2. **`🎬 Demo 2: Salmon Poke Auto-Detection (0:45–1:45)`** — Milo inspects the lunch photo with a magnifying glass, praises the 28g protein intake, and logs the meal with one tap.
3. **`🎬 Demo 3: Autonomous Doctor PDF Report (1:45–3:00)`** — `gemini-4-argon` (`thinking_level="high"`) synthesizes 30 days of logs into a physician-ready clinical summary and exports a real PDF file.

---
---

# 🇰🇷 한국어 문서 (Korean Documentation)

## 1. 해커톤 빌더 가이드 부합성 (4대 심사 기준 완벽 매칭)
**Milo(마일로)**는 *Build with Gemini 4 Argon* 해커톤 빌더 가이드의 **4가지 핵심 심사 기준(4 Tests)**을 정조준하여 설계되었습니다:

| 해커톤 4대 심사 기준 | 마일로(Milo)의 구현 및 달성 포인트 |
| :--- | :--- |
| **1. 이름을 댈 수 있는 구체적인 사람의 문제 해결** | 막연한 다이어터가 아닌, **GLP-1 주사제(마운자로/위고비)를 맞으며 주사 당일 오심(울렁거림), 투여 부위 로테이션 혼선, 근손실 불안, 식단 기록 피로감을 겪는 환자**의 문제를 해결합니다. |
| **2. Gemini 4 Argon이 반드시 필요했던 작업** | **`gemini-4-argon` (`thinking_level="high"`)**의 1M 토큰 컨텍스트를 활용해 30일간의 식단·걸음 수·주사 용량·오심·기분 데이터를 교차 추론하여 **병원 제출용 임상 리포트**를 생성하고, 5장의 캐릭터 레퍼런스 시트를 바탕으로 **실시간 2.5D/3D 탄성 물리 캐릭터 셰이더**를 구현했습니다. |
| **3. 사용자의 통제권 보장 (Keep People in Control)** | **Zero-Effort 확인형 UI (Human-in-the-Loop):** 마일로는 건강/의료 데이터를 임의로 자동 확정하지 않습니다. 감지된 연어 포케 사진과 주사/부작용 카드를 먼저 제시하고 *"이렇게 기록할까?"*라고 물어본 뒤 사용자가 **[원터치 승인]**을 눌러야 최종 기록됩니다. |
| **4. 3분 이내 실제 입력으로 작동하는 라이브 데모** | 심사위원 앞에서 3분 안에 시연을 끝낼 수 있도록 상단 **`🎬 데모1` · `🎬 데모2` · `🎬 데모3` 원터치 시나리오 버튼**과 실시간 음성/텍스트 채팅 및 갤러리 사진 분석(`PickVisualMedia`)을 모두 지원합니다. |

---

## 2. 에이전틱 멀티모델 오케스트레이션 (Toolkit 매칭)
빌더 가이드의 **"Orchestrate Argon with Flash and media subagents"** 패턴에 맞춰 각 모델의 역할을 분리했습니다:

| 앱 내 역할 (Job in App) | 모델 / 에이전트 | 모델 ID | 마일로(Milo) 내 구체적 활용 |
| :--- | :--- | :--- | :--- |
| **메인 오케스트레이터 & 1M 컨텍스트 임상 추론 & 3D/2.5D 셰이더 생성** | **Gemini 4 Argon** | `gemini-4-argon` | 30일간의 체중·골격근량·GLP-1 용량·오심·감정 로그 복합 추론(`thinking_level="high"`) 및 마일로 물리 셰이더 코드 합성 |
| **고속 병렬 식단 비전 분석 서브 에이전트** | **Gemini 3.8 Flash** | `gemini-3.8-flash` | 갤러리 음식 사진(연어 포케 등)의 단백질(g)·칼로리 초고속 분석 및 근손실 방지 피드백 생성 |
| **의료 법규 가드레일 & 라우팅** | **Gemini 3.5 Flash-Lite** | `gemini-3.5-flash-lite` | 의학적 진단·처방(용량 임의 변경 등) 발언을 차단하는 초저지연 가드레일 체크 |
| **실시간 음성 교감 & 파형 반응** | **Gemini 3.8 Live** | `gemini-3.8-live` | 사용자의 음성 데시벨과 톤에 맞춰 마일로의 머리 뿔과 오라 링이 실시간 반응하는 양방향 음성 세션 |
| **마일로 플러시 텍스처 & 식단 리소스 생성** | **Nano Banana 2.1** | `gemini-nano-banana-2.1` | 일관성 높은 마일로 캐릭터 에셋 및 고해상도 식단 시각 리소스 생성 |
| **병원 제출용 리포트 자율 실행 샌드박스** | **Antigravity Agent** | `antigravity-preview-09-2026` | 의사 제출용 4주 경과 요약 및 PDF 메디컬 브릿지 리포트 자율 생성 파이프라인 |
| **온디바이스 사진 프라이버시 필터링** | **Gemma 4** | `gemma-4-31b-it` (E2B/E4B) | 민감한 개인 사진첩 중 '음식 사진'만 로컬에서 1차 선별하는 프라이버시 보호 아키텍처 |

> **Gemini 4 Argon 최신 파라미터 규격 준수:** `MiloGeminiService.kt`는 레거시 파라미터(`temperature`, `top_p`, `top_k`, `thinking_budget`)를 완전히 제거하고, 최신 `thinkingConfig.thinkingLevel` (`"low"` | `"medium"` | `"high"`) 및 15분 장기 추론 타임아웃 규격을 준수합니다.

---

## 3. 핵심 기능 상세

### ① 살아 숨 쉬는 마일로 (14종 상태 머신 & 탄성 물리 엔진)
* **말랑하고 반응하는 구름 (Squishy & Reactive):** 마일로의 배나 볼을 손가락으로 터치하면 `Spring.DampingRatioHighBouncy` 탄성 물리가 적용되어 말랑하게 눌리며 볼이 발그레해집니다.
* **음성 데시벨 반응형 물방울 뿔 & 오라 링:** 실시간 음성 교감 시 목소리 크기에 맞춰 마일로의 머리 위 물방울 뿔이 쫑긋거리고 파형 오라가 일렁입니다.
* **캐릭터 시트 14종 전체 모션 & 3방향 뷰(`정면 Front` / `측면 꼬리 Side` / `뒷모습 Back`):**
  * **감정·케어 6종 (`milo-events.jpg`):** `기쁨/칭찬`, `경청/공감`, `걱정/부작용 공감`, `GLP-1 주사 & 케어(주사기 펜 + 복부 반창고)`, `식단 & 카운팅(돋보기 + 포케 볼)`, `체중 기록 완료(체중계)`
  * **운동 모션 8종 (`milo-excercise-1, 2.jpg`):** `신나게 걷기`, `가볍게 뛰기`, `스쿼트 준비`, `스쿼트 동작`, `자전거 타기`, `근력 운동`, `요가 & 스트레칭`, `계단 오르기`

### ② 노력 없는 '확인형' 기록 (Zero-Effort Logging · Human-in-the-Loop)
* 사진첩의 신규 음식 사진(연어 포케 볼 등)과 걸음 수·수면 데이터를 마일로가 먼저 파악하고 다정하게 물어봅니다:
  > *"점심에 찍은 사진 보니까 연어 포케 먹었네! 단백질 28g 합격! 주사 맞은 날인데 밥은 반 남겼어?"*
* 사용자는 타자를 칠 필요 없이 **["응, 밥은 반 남겼어! 기록 승인할게" (원터치 승인)]** 버튼만 누르면 기록이 완료되며, 무권한 **Android Photo Picker**로 언제든 새로운 식단 사진을 추가할 수 있습니다.

### ③ GLP-1 주사 부위 로테이션 & 부작용·멘탈 케어
* **6구역 신체 로테이션 가이드:** 복부 4분면(좌상·우상·좌하·우하) 및 양측 허벅지 중 지난 투여 이력을 기반으로 오늘의 추천 부위(`복부 우하단 ⭐`)를 안내합니다.
* **부작용 & 감정 문진:** 주사 후 오심(울렁거림), 피로감, 식욕 억제 상태와 오늘의 기분 이모지를 함께 기록합니다.

### ④ 병원 제출용 리포트 (Doctor's Medical Bridge & PDF 생성)
* 진료실에서 의사 선생님께 짧은 시간 내에 정확한 경과를 전달할 수 있도록 최근 4주간의 **체중 감량(-4.1kg) 및 골격근량 유지(28.2kg) 그래프**, **주사 부위 순환 이력**, **증량 후 오심·활동량 상관관계 임상 요약**을 생성합니다.
* **[PDF 리포트 생성]** 버튼을 누르면 Android 순정 `PdfDocument` 엔진을 통해 실제 `.pdf` 파일(`Milo_GLP1_Doctor_Report.pdf`)을 생성합니다.

---

## 4. 심사위원 3분 라이브 데모 실행 가이드
앱 상단 헤더의 원터치 데모 칩 3개를 순서대로 누르면 3분 이내에 모든 핵심 시나리오를 시연할 수 있습니다:
1. **`🎬 데모1: 주사·오심 공감 (0:00 ~ 0:45)`** — *"오늘 아침에 마운자로 5mg 주사 맞았어. 근데 속이 좀 울렁거리네"* 발화 시 마일로가 걱정하는 표정으로 위로하며 [복부 우하단 / 5mg / 경미한 오심] 확인 카드를 생성합니다.
2. **`🎬 데모2: 연어포케 자동감지 (0:45 ~ 1:45)`** — 마일로가 돋보기를 들고 점심 연어 포케 사진과 6,420보 걸음 수를 분석해 단백질 섭취를 칭찬하고 원터치 승인을 유도합니다.
3. **`🎬 데모3: 병원용 PDF 자율생성 (1:45 ~ 3:00)`** — `gemini-4-argon`(`thinking_level="high"`)이 지난 4주간의 체성분·주사 용량·부작용 상관관계를 종합하여 진료실 제출용 메디컬 리포트와 PDF를 즉시 생성합니다.
