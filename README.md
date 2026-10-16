# 🐾 Milo (마일로)
> **The Living AI Health & GLP-1 Companion for Effortless Weight & Mental Care**  
> **가장 게으른 방식으로 쓰는 가장 완벽한 GLP-1 & 멘탈 케어 AI 건강 컴패니언**

[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Jetpack%20Compose-3DDC84?logo=android)](#)
[![Architecture](https://img.shields.io/badge/Architecture-MVVM%20%7C%20Adaptive%20UI-38BDF8)](#)
[![Language](https://img.shields.io/badge/Kotlin-2.2.10-7F52FF?logo=kotlin)](#)

---

## 🌐 Language Navigation
- [🇺🇸 English Documentation](#-english-documentation)
- [🇰🇷 한국어 문서 (Korean Documentation)](#-한국어-문서-korean-documentation)

---

# 🇺🇸 English Documentation

## 1. Overview & Problem Statement
Patients undergoing weight management and **GLP-1 receptor agonist therapy** (e.g., Mounjaro, Wegovy) face three critical challenges:
1. **Logging Fatigue:** Manually entering every meal, calorie, water cup, and step count leads to high user drop-off.
2. **GLP-1 Side Effects & Muscle Loss:** Patients struggle to rotate injection sites properly, manage post-injection nausea/fatigue, and maintain sufficient daily protein (80g+) and hydration (2,000ml+) to prevent skeletal muscle loss.
3. **Emotional Isolation & Clinical Communication Gap:** Diet pressure, appetite-suppression mood swings, and brief doctor consultations make it difficult to communicate 30-day symptom/weight correlations effectively.

**Milo** solves this by combining a **squishy, breathing pastel-blue AI companion character** with **Zero-Effort Confirm-Based Logging (Human-in-the-Loop)** and an **Autonomous Doctor's Medical Bridge Report**.

---

## 2. Core Value Propositions
1. **Zero-Effort Logging (Human-in-the-Loop):** Milo proactively reads detected food photos from the gallery and activity/sleep data from Health Connect, then asks *"Is this right?"* so the user can log with a single tap.
2. **GLP-1 Specialized Care:** Tracks weekly injection schedules, 6-zone body rotation (Abdomen & Thighs), dosage escalation (`2.5mg` → `5.0mg`), and post-injection side effects (nausea, fatigue).
3. **Mental & Physical Sync:** An empathetic friend—never a harsh trainer—who checks in on emotional wellbeing, stress eating, and post-injection mood shifts.
4. **Medical Bridge (Doctor's PDF Report):** Synthesizes 30 days of weight, skeletal muscle mass, injection history, and side-effect correlations into a 1-page clinical PDF report for physician consultations.

---

## 3. Key Features

### ① Interactive Living Milo (14-Pose State Machine & Spring Physics)
* **Squishy & Reactive:** Built with custom Jetpack Compose procedural shaders and spring physics (`Spring.DampingRatioHighBouncy`). Poking Milo's belly or cheeks triggers a squishy bounce and a warm peach blush.
* **Voice-Reactive Aura:** When voice mode is active, Milo's water-drop head tuft wiggles and concentric aura rings pulse in sync with the user's voice decibels.
* **14 Character Poses & 360° Turnaround (`Front` / `Side Tail` / `Back`):**
  * **6 Event & Care Poses:** `Happy & Cheering`, `Listening & Comforting`, `Sad / Sick / Worried`, `GLP-1 Action (Pen + Band-Aid)`, `Meal & Health Check (Magnifying Glass + Poke Bowl)`, `Success & Scale`.
  * **8 Exercise Poses:** `Walking Cheerfully`, `Steady Jogging`, `Starting a Squat`, `Squat Hold`, `Cycling`, `Strength Training`, `Yoga & Stretching`, `Stair Climbing`.

### ② Zero-Effort Confirm UI (Proactive Health & Meal Detection)
* Instead of tedious manual input, Milo proactively detects meal photos (e.g., Hawaiian Salmon Poke Bowl) and daily step/sleep telemetry, then asks:
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
3. **`🎬 Demo 3: Autonomous Doctor PDF Report (1:45–3:00)`** — Milo synthesizes 30 days of logs into a physician-ready clinical summary and exports a real PDF file.

---

## 5. Tech Stack & Project Structure
* **UI Framework:** 100% Jetpack Compose + Material Design 3 + Custom 2.5D Canvas Shaders
* **Architecture:** MVVM (`ViewModel` + `StateFlow`) with Adaptive Responsive Layout
* **Media & System APIs:** Zero-permission `ActivityResultContracts.PickVisualMedia`, Runtime `RECORD_AUDIO` permission flow, Android `PdfDocument` engine

```text
app/src/main/java/com/example/
├── MainActivity.kt                        # Adaptive main scaffold & navigation
├── model/
│   └── FoldStudioModels.kt                # 14 Milo poses, GLP-1 sites, Zero-Effort cards, telemetry models
├── network/
│   └── MiloGeminiService.kt               # Multimodal AI REST client & offline-safe demo fallback engine
├── viewmodel/
│   └── FoldStudioViewModel.kt             # State machine, 3-minute demo triggers, and PDF report generator
└── ui/
    ├── components/
    │   ├── FoldPostureHeader.kt           # Telemetry pills and 3-minute live demo bar
    │   ├── LivingMiloCanvas.kt            # Interactive 2.5D/3D plush Milo shader, props & squish physics
    │   ├── PrdWorkspacePane.kt            # Living Milo stage + 14-pose chips + voice/text chat
    │   ├── AssetStudioPane.kt             # Tab 1 (Zero-Effort Confirm) & Tab 3 (14 Motions Studio)
    │   └── InteractivePreviewPane.kt      # Tab 2 (GLP-1 Care) & Tab 4 (Doctor PDF Report)
    └── theme/
        ├── Color.kt                       # Milo signature pastel sky-blue & dark slate palette
        ├── Theme.kt                       # Material 3 color scheme & rounded shapes
        └── Type.kt                        # Clean typography scale
```

---
---

# 🇰🇷 한국어 문서 (Korean Documentation)

## 1. 프로젝트 개요 및 해결하려는 문제
비만 관리 및 **GLP-1 주사제(마운자로, 위고비 등)** 치료 과정에 있는 사용자들은 세 가지 큰 어려움을 겪습니다:
1. **기록 피로감 (Logging Fatigue):** 매 끼니 식단, 칼로리, 수분 섭취량, 걸음 수를 수동으로 입력해야 하는 번거로움 때문에 높은 이탈률이 발생합니다.
2. **GLP-1 부작용 및 근손실 위험:** 주사 투여 부위(복부·허벅지) 로테이션을 잊어버리거나, 증량 직후 찾아오는 오심(울렁거림)·피로감 관리, 그리고 근손실 방지를 위한 단백질(일 80g+) 및 수분 섭취 관리에 어려움을 겪습니다.
3. **정서적 고립감 및 진료실 소통 한계:** 식욕 억제 스트레스와 우울감을 털어놓을 곳이 없으며, 짧은 병원 진료 시간 동안 지난 한 달간의 체성분·용량·부작용 상관관계를 의사에게 정확히 전달하기 어렵습니다.

**Milo(마일로)**는 스마트폰 내 데이터를 선제적으로 파악하고 대화형(음성/텍스트)으로 먼저 말을 걸어와, **가장 게으른 방식으로 가장 완벽한 건강 일기를 쓰게 만드는 살아 숨 쉬는 AI 컴패니언 앱**입니다.

---

## 2. 핵심 가치 제안 (Value Proposition)
1. **Zero-Effort Logging (노력 없는 확인형 기록):** 사진첩과 헬스 커넥트 데이터를 먼저 읽고 마일로가 *"이거 맞지?"*라고 물어보는 확인형(Confirm-based · Human-in-the-loop) 기록.
2. **GLP-1 특화 밀착 케어:** 위고비·마운자로 투여 일정, 6구역 신체 로테이션, 용량 증량 스케줄 및 부작용(메스꺼움, 열감, 피로감) 집중 관리.
3. **Mental & Physical Sync:** 강압적인 트레이너가 아닌 다정하게 공감해주는 단짝 친구 페르소나로 체중 변화와 식습관에 따른 감정 변화를 케어하는 멘탈 다이어리.
4. **Medical Bridge (병원 제출용 PDF 리포트):** 축적된 30일간의 체성분·주사 이력·부작용 상관관계를 담당 의사에게 바로 보여줄 수 있는 요약 리포트 및 PDF 내보내기.

---

## 3. 핵심 기능 상세

### ① 살아 숨 쉬는 마일로 (14종 상태 머신 & 탄성 물리 엔진)
* **말랑하고 반응하는 구름 (Squishy & Reactive):** 마일로의 배나 볼을 손가락으로 터치하면 `Spring.DampingRatioHighBouncy` 탄성 물리가 적용되어 말랑하게 눌리며 볼이 발그레해집니다.
* **음성 데시벨 반응형 물방울 뿔 & 오라 링:** 실시간 음성 교감 시 목소리 크기에 맞춰 마일로의 머리 위 물방울 뿔이 쫑긋거리고 파형 오라가 일렁입니다.
* **캐릭터 시트 14종 전체 모션 & 3방향 뷰(`정면 Front` / `측면 꼬리 Side` / `뒷모습 Back`):**
  * **감정·케어 6종 (`milo-events.jpg`):** `기쁨/칭찬`, `경청/공감`, `걱정/부작용 공감`, `GLP-1 주사 & 케어(주사기 펜 + 복부 반창고)`, `식단 & 카운팅(돋보기 + 포케 볼)`, `체중 기록 완료(체중계)`
  * **운동 모션 8종 (`milo-excercise-1, 2.jpg`):** `신나게 걷기`, `가볍게 뛰기`, `스쿼트 준비`, `스쿼트 동작`, `자전거 타기`, `근력 운동`, `요가 & 스트레칭`, `계단 오르기`

### ② 노력 없는 '확인형' 기록 (Zero-Effort Logging)
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
3. **`🎬 데모3: 병원용 PDF 자율생성 (1:45 ~ 3:00)`** — 지난 4주간의 체성분·주사 용량·부작용 상관관계를 종합하여 진료실 제출용 메디컬 리포트와 PDF를 즉시 생성합니다.

---

## 5. 빌드 및 설치 방법 (Build & Installation)

### 1) API 키 설정 (선택 사항)
* 프로젝트 루트의 `.env` 또는 AI Studio의 **Secrets 패널**에 `GEMINI_API_KEY`를 설정할 수 있습니다.
* 데모 현장의 네트워크 환경과 무관하게 즉각 동작하도록 오프라인 안전 폴백(Contextual Demo Engine)이 함께 내장되어 있습니다.

### 2) APK 설치
```bash
adb install -r app-debug.apk
```
또는 다운로드한 APK 파일을 안드로이드 기기로 전송(Quick Share / 카카오톡 / Google Drive)한 뒤 터치하여 즉시 설치할 수 있습니다.
