# Milo Material web app

Cloud Run serves the responsive browser app and the Gemini chat endpoint. The UI follows MyGLPMate's `feature/milo-b-native` at `b1d8b60c63149af74df95978399adbdd6ef34159` (2026-10-16), including the rounded Milo illustration in `docs/design/milo-rounded-v1/`.

## Navigation

- **Milo**: one continuing conversation, a preserved text draft, and explicit manual record entry.
- **기록**: 기록 / 흐름 / 건강 tabs, text search, kind filters, measured weight history and manual health records.
- **나**: optional name, prescribed schedule, user-authored memories, visit preparation, story export, preferences and data management.
- First launch introduces Milo in four optional steps. Progress survives reload; finishing or skipping never erases records.

The interface uses the official `@material/web` library for buttons, fields, dialogs and tabs; Material 3 color roles, typography, states, touch targets, and adaptive navigation are applied in `public/styles.css`. Material Web and the Material Symbols subset are bundled locally. The character asset is copied from the user's reference repository.

## Run and verify

```sh
cd cloudrun
npm ci
npm run build
npm test
PORT=8080 npm start
```

Docker builds the JavaScript bundle in a separate Node 22 build stage. The production image contains only static public files and `server.mjs`.

## Data and AI behavior

Records, optional name, preferences, confirmed notes and the most recent 100 conversation messages are stored in the current browser's local storage. The unsent conversation draft is also preserved. After onboarding, a browser with no personal records opens a clearly labeled judging demo containing 30 days of synthetic records. Demo data has a separate storage key and never overwrites personal records. Preferences can switch between demo and personal data or reset samples. Health records are not automatically sent to Gemini. The report calculates measured weight changes, injections taken, meals, activity durations and distinct symptom states from the selected records. It supports print / PDF through the browser and a CSV download of the underlying records. Record export creates a JSON file; deletion offers an undo action. A plan does not create an injection record, and a missing plan dose remains missing.

Chat sends the submitted message and up to six recent turns to Gemini. Cloud Run authenticates with its service identity; no user password, API key or OAuth refresh token is included in the image. Provider errors return an error instead of a simulated AI success. The default model is `gemini-4-argon`.

The browser version has no Apple Health / Health Connect connection, background reminders, native speech/media pipeline, iOS record synchronization or on-device model. These boundaries are explained in the corresponding UI. App preferences supports KOREAN / ENGLISH. The choice persists in browser storage and updates interface copy, dates, accessible labels and future Gemini replies. User-authored records, names, notes, drafts and earlier conversation messages are preserved in their original language.

## Design references

- https://github.com/material-components/material-web/blob/main/docs/intro.md
- https://m3.material.io/styles/color/the-color-system
- https://m3.material.io/styles/typography/applying-type
- https://m3.material.io/foundations/layout/canonical-examples/overview
