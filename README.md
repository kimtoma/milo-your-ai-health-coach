# Milo

**An empathetic GLP-1 & everyday wellness companion powered by Gemini 4 Argon.**

Team: **Forever on a DIET**

- [Open the live app](https://milo-health-coach-91706530537.asia-northeast3.run.app/)
- [Source repository](https://github.com/kimtoma/milo-your-ai-health-coach)

Milo helps people using GLP-1 treatments keep track of injections, weight, meals, movement and how they feel. Warm conversations sit alongside records that the user reviews and saves. A Korean / English Material Design interface, a soft interactive 3D Milo, and a clearly labeled 30-day demo make the experience easy to explore.

## Try it in three minutes

1. Complete or skip the four-step introduction. A new browser opens **DEMO** mode with 30 days of synthetic records.
2. Talk with **Milo**. The real-time 3D companion stays above the conversation and reacts to walking, meals, completed injections and feelings. Gemini 4 Argon responds in the selected language and uses recent conversation turns for continuity.
3. Open **Records → Records / Trends / Health** to search the timeline, inspect measured weight, or check data sources.
4. Select **View report**. Review the weight chart, injection history and daily-record summaries. Choose **Print / PDF** to print or save a PDF, or **Save CSV** to download the underlying records.
5. Open **Me → App preferences** to switch **KOREAN / ENGLISH**, change appearance, or return to personal records.

The demo contains 30 weight measurements, 5 injection records, 30 meals, 20 activities, 30 check-ins and one separate medication plan. Synthetic samples are clearly marked and stored separately from personal records. Personal mode does not receive sample records; switching modes preserves both stores. Existing browsers with personal records can open the demo from the banner or preferences.

## What works in the hosted app

- **Living 3D companion:** Three.js / WebGL renders a rounded, rigged Milo with tens of thousands of short GPU-drawn plush fibres, soft cheek color, blinking and gentle movement. Stroke the coat, tap to say hello, or use the left/right arrow keys to rotate. Walking, eating with a bowl and spoon, and post-injection bandage poses follow local conversation cues and confirmed record types. Multiple activities in one message play in order.
- **Comfortable motion:** rendering pauses offscreen or in a hidden tab, caps pixel density and frame rate, honors reduced-motion preferences, and has a pause control. Unavailable WebGL falls back to the preserved 2D animation resources.
- **Continuing conversation:** submitted messages and the most recent six turns are sent to Gemini 4 Argon. The browser retains up to 100 messages and an unsent draft across navigation and reloads.
- **Reviewed record entry:** injections, measured weight, meals, activities, check-ins and medication plans have explicit save actions. Changing a medicine does not fill in a dose. A plan never creates an injection taken.
- **Record history:** searchable timeline, type filters, weight charts and separate Records / Trends / Health views. Synthetic meal samples mix clearly labeled photorealistic example images with text-only entries; existing demo records gain these images without replacing saved IDs or personal records.
- **Period reports:** 7-, 30- and 90-day views calculate actual recorded counts, measured weight changes, logged activity durations and injection history. Missing symptoms remain distinct from explicitly recorded no symptoms. Reports support browser print-to-PDF and CSV download.
- **Bilingual interface:** Korean and English navigation, forms, guidance, dates, accessible labels, demo content and future AI replies. Original user-authored records and earlier conversation messages stay unchanged.
- **Personal settings:** optional name, user-confirmed notes, prescribed schedule, theme, color, weight units, record export and deletion with undo.
- **Adaptive Material UI:** desktop navigation, tablet rail, mobile bottom navigation, official Material Web controls and the interactive Milo companion.

The [Plush Studio](https://milo-health-coach-91706530537.asia-northeast3.run.app/milo-lab.html) compares the original illustration with the live 3D prototype and previews behavior from a sentence without transmitting or saving it. Its short, soft coat and brush response take visual inspiration from Google AI Studio's [GPU Fur Simulation](https://aistudio.google.com/apps/bundled/gpu-fur-simulation?showPreview=true&showAssistant=true). Milo uses a WebGL vertex-shader implementation; it does not require WebGPU.

## Architecture

| Layer | Implementation |
| --- | --- |
| Interface | JavaScript, Material Web 2.5, Material Design 3 color roles and responsive CSS |
| Character | Three.js 0.186.1, smooth procedural form, an expression rig and GPU-instanced short plush fibres in WebGL |
| Build | esbuild with pinned npm dependencies and a deferred 3D module |
| Web server | Node.js 22, static assets and `/api/chat` |
| AI | `gemini-4-argon` through Vertex AI, medium thinking level |
| Authentication | Cloud Run service identity and short-lived metadata tokens |
| Hosting | Google Cloud Run, `asia-northeast3` |
| Record storage | Browser local storage, with separate demo and personal namespaces |
| Reports | Calculated from selected records in the browser; print-to-PDF and CSV |

No health records are automatically attached to AI chat. Records are stored in the current browser and do not automatically sync with the iOS app or another device. The hosted web build does not connect to Apple Health / Health Connect, analyze meal photos, provide live voice sessions, recommend injection-site rotation, or generate clinical conclusions. Medication and dose changes remain decisions for the user's clinician.

The root `src/`, `server.ts` and Vite configuration retain the earlier React prototype. The submitted live experience is the independently runnable `cloudrun/` web app, selected by the root Dockerfile. Its navigation and rounded character follow the current MyGLPMate product direction; components and adaptive behavior use Material Design 3.

## Run locally

Use Node.js 22 or newer.

```sh
cd cloudrun
npm ci
npm run build
npm test
PORT=8080 npm start
```

Open `http://localhost:8080`. Manual records and reports work without AI credentials. `/health` reports whether AI is configured; chat clearly reports an unavailable connection when credentials are absent.

For Vertex AI, set:

```sh
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global
GEMINI_MODEL=gemini-4-argon
```

The deployed service uses its Cloud Run service account. API keys and user credentials are not included in the container image.

## Deploy to Cloud Run

```sh
gcloud run deploy milo-health-coach \
  --source=. \
  --project=YOUR_PROJECT_ID \
  --region=asia-northeast3 \
  --allow-unauthenticated \
  --port=8080 \
  --min-instances=0 --max-instances=2 \
  --cpu=1 --memory=256Mi --timeout=180 --concurrency=10 \
  --set-env-vars=GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=global,GEMINI_MODEL=gemini-4-argon
```

The Dockerfile builds static assets in a separate stage. The runtime image contains only public assets and the server. Environment files, local credentials, build directories and dependency folders are excluded from source uploads.

## Verification

The automated suite covers animation poses and transitions, action ordering, mixed photo/text demo records, service-identity authentication, provider failures, conversation continuity, language selection, exact dose preservation, kg/lb conversion, missing-value handling, isolated synthetic records, report calculations and user-text preservation during localization. The live service has also been checked for real Gemini replies in Korean and English, persistent browser state, responsive navigation and report rendering.

## 한국어 안내

마일로는 짧고 보송한 털을 GPU로 그리는 3D 캐릭터로 함께합니다. 대화와 기록에 맞춰 걷거나 식사하고, 주사 후에는 반창고를 붙인 모습으로 반응합니다. 원본과 새 3D를 나란히 보는 Plush Studio도 제공합니다.

Milo는 GLP-1 치료 중의 주사·체중·식사·활동·컨디션을 나의 속도로 남기는 건강 메이트입니다. **Milo / 기록 / 나** 메뉴를 중심으로 구성했으며, 기록은 사용자가 내용을 확인한 뒤 직접 저장합니다.

온보딩 이후에는 심사용 **30일 데모**를 둘러볼 수 있습니다. 데모와 내 기록은 별도로 보관되며, **리포트 보기 → 인쇄 / PDF**에서 출력하거나 **CSV 저장**으로 기록을 내려받을 수 있습니다. **나 → 앱 사용 방식 → KOREAN / ENGLISH**에서 언어를 바꾸면 화면과 앞으로 받을 AI 답변에 반영됩니다.
