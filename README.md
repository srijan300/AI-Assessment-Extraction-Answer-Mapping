# AI Assessment Mapper

AI Assessment Mapper is a web application designed for teachers and examination evaluators. It automates the extraction of question papers and handwritten student answer sheets, maps student answers directly to printed questions, highlights exact answer regions on the answer sheet, and provides optional AI-assisted grading and feedback.

---

## Features

- **Multimodal Document Upload**: Supports PDF and image files (PNG, JPG, JPEG) for both Question Papers and Student Answer Sheets.
- **Staged Processing Feedback**: Real-time 8-stage progress tracker giving clear visual visibility into AI processing.
- **Precision Question Extraction**:
  - Preserves exact printed order and original numbering.
  - Keeps labelled sub-parts like `11 (a)` and `11 (b)` as separate independent questions.
  - Distinguishes questions from page headers, footers, section titles, and instructions.
- **Handwritten Answer Region Detection**:
  - Detects student handwriting and transcribes response text.
  - Bounding boxes cover the **complete handwritten response block**, not just the question label.
  - Supports multi-page answers spanning multiple answer sheet pages.
- **Intelligent Answer Mapping**:
  - Handles out-of-order student responses.
  - Identifies unanswered questions and unmatched student notes.
  - Flag low-confidence mappings (< 0.75 confidence) for manual teacher review.
- **Interactive Document Viewer & Highlighting**:
  - Normalized 0–1000 coordinate overlays scaling seamlessly with zoom and browser resizing.
  - Page navigation and zoom controls (`- 100% +`, `Fit Width`).
  - Interactive selection: Clicking any question automatically jumps to its answer page and renders exact bounding box highlight.
- **Optional AI Grading & Feedback**: Provides awarded marks, correctness status, and actionable AI feedback callout boxes.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, React Dropzone.
- **Backend**: Node.js, Express, TypeScript, Multer, Zod schema validation.
- **AI Engine**: Google Gemini API via official `@google/genai` SDK using `gemini-2.5-flash`.

---

## Architecture

```
ai-assessment-mapper/
├── src/                        # React Frontend (Vite)
│   ├── components/
│   │   ├── layout/            # Sidebar & Header navigation
│   │   ├── upload/            # UploadCard with drag & drop
│   │   ├── processing/        # Staged progress screen
│   │   ├── assessment/        # QuestionList, QuestionCard, SummaryHeader
│   │   ├── answer-viewer/     # DocumentViewer & AnswerHighlightOverlay
│   │   └── ui/                # Button, Badge, Card components
│   ├── pages/                 # UploadPage & AssessmentPage
│   ├── types/                 # TypeScript interfaces
│   ├── lib/                   # Utility functions & coordinate math
│   ├── App.tsx
│   └── index.css
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── index.ts           # Server entry point (PORT 3001)
│   │   ├── routes/            # /api/process and /api/grade endpoints
│   │   ├── services/gemini/   # GoogleGenAI client, prompts, extraction & mapping
│   │   └── schemas/           # Zod schemas for runtime validation
│   └── tsconfig.json
│
├── .env.example
├── package.json
└── README.md
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=3001
```

> **Security Note**: `GEMINI_API_KEY` is loaded exclusively by the Express backend. It is **never** exposed to the browser or React bundle.

---

## Gemini API Setup

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Click **Create API Key**.
3. Copy your API key.
4. Paste it into your root `.env` file as `GEMINI_API_KEY=AIzaSy...`.
5. Restart the server.

---

## Running Locally

### Install Dependencies
```bash
npm install
```

### Run Both Frontend & Backend (Recommended)
```bash
npm run dev
```
- Frontend starts on `http://localhost:5173`
- Backend starts on `http://localhost:3001`

### Run Backend Only
```bash
npm run server
```

### Run Frontend Only
```bash
npm run client
```

---

## AI Pipeline

1. **Question Extraction**: Analyzes the question paper visually and outputs structured JSON containing question number, text, marks, subpart label, and page index.
2. **Handwritten Answer Extraction**: Scans all answer sheet pages, transcribes handwritten text, and detects normalized `[ymin, xmin, ymax, xmax]` bounding boxes (0–1000 scale).
3. **Answer Mapping**: Evaluates explicit question numbers, subparts, and semantic context to match questions with answers.
4. **Bounding Box Highlighting**: Converts normalized coordinates into relative CSS percentages (`top`, `left`, `width`, `height`) for responsive overlay rendering.
5. **Optional AI Evaluation**: Generates awarded marks and teacher feedback.

---

## Answer Mapping Strategy

The mapping engine matches student responses using a multi-signal hierarchy:
1. **Explicit Question Number Match**: Highest priority (e.g. `"Q11 (a)"` ➔ `"11 (a)"`).
2. **Subpart Alignment**: Matches subpart labels (`a`, `b`, `i`, `ii`).
3. **Semantic Similarity**: Keywords and content overlap.
4. **Confidence Thresholding**: Mappings with confidence `< 0.75` are assigned status `"needs_review"`.
5. **Unanswered & Unmatched Categorization**: Unmapped questions are marked `"unanswered"`, while extra student notes are grouped under `"Unmatched Answers"`.

---

## Highlighting Strategy

Gemini Vision outputs normalized coordinates from `0` to `1000`:
- `top` = `(ymin / 1000) * 100%`
- `left` = `(xmin / 1000) * 100%`
- `width` = `((xmax - xmin) / 1000) * 100%`
- `height` = `((ymax - ymin) / 1000) * 100%`

Coordinates scale dynamically with image zoom, canvas scaling, and window resizing without offset drift.

---

## Deployment

- **Frontend**: Ready to deploy on Vercel or Netlify (`npm run build`).
- **Backend**: Ready to deploy on Render, Railway, or Node hosting.

---

## Assumptions & Limitations

- Handwriting legibility influences OCR accuracy; low confidence answers trigger `"Needs Review"` status for teacher verification.
- Ideal image quality: Clear lighting, 300+ DPI scans or photos.
