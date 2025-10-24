# Architectural Guide

## Architectural Approach & Key Decisions

### Data Flow

- **Client-side data**: Most UI state (experiment results, loading/error states) is managed in React components using hooks (`useState`, `useEffect`, `useSWR`).
- **API data**: Data is fetched from Next.js API routes (e.g., `/api/experiment`, `/api/reports`).
- **Resilience**: Components use SWR for caching and revalidation, with fallback to local state if API is unavailable. Error boundaries and retry controls are present in key UIs.
- **Export**: Results can be exported as JSON via a client-side blob download.

### API Endpoints

- **`/api/experiment`**: Accepts POST requests with experiment parameters, returns generated responses and metrics.
- **`/api/reports`**: Returns a list of saved experiment reports for display in the reports page.
- **`/api/experiment/responses`**: (Optional) Used for background polling or SWR-based updates of experiment results.
- **Error handling**: All endpoints are expected to return JSON with either a `responses` array or an `error` field. Client code guards against non-JSON and malformed responses.

### Component Structure

- **Page-level containers**: `ExperimentPage`, `Reports` — manage top-level state and orchestrate data fetching and error handling.
- **UI primitives**: `MetricCard`, `LoadingSpinner`, `ReportListItem`, `ResponseCard` — reusable, theme-aware components for consistent UI.
- **ResultsDisplay**: Central chart and metrics display, handles both local and API-fetched data, robust to missing/empty datasets.
- **Styling**: Mantine props for layout, global CSS classes for presentational styles, CSS variables for theme colors.
- **Accessibility**: ARIA attributes, keyboard navigation, and focus-visible styles are present in all interactive components.

### Key Decisions

- **Minimal inline styles**: All presentational styles are moved to CSS classes for maintainability and theme consistency.
- **Theme integration**: Mantine theme tokens are exposed to CSS via variables, allowing dynamic color adaptation.
- **Error resilience**: Defensive parsing, shape validation, and user-facing retry controls are standard in all API interactions.
- **Accessibility-first**: Focus-visible, ARIA, and keyboard navigation are prioritized in all new/refactored components.
- **Security**: `.env` files are excluded from version control; API keys and secrets are never committed.

For more details, see the code comments in each component and the API route files in `app/api/`.

---

## Metrics Calculation (`lib/metrics.ts`)

This module computes quality metrics for LLM-generated responses. Each metric is normalized to 0–1 (except overallScore, which is 0–100). The formulas, rationale, and limitations are explained below.

### Metrics Overview

- **Coherence**: Measures lexical cohesion and structural features (headings, lists, transitions).
- **Length**: Evaluates response length against a requirement-aware target, with Gaussian tolerance and penalties for short/long answers.
- **Vocabulary Richness**: Combines type-token ratio and hapax legomena, damped for short texts.
- **Repetition Penalty**: Penalizes repeated bigrams, rewarding diversity.
- **Readability**: Flesch-Kincaid grade mapped to a 0–1 score, with a target band for technical explanations.
- **Overall Score**: Weighted sum of the above, mapped to 0–100.

### Example Calculation

Given a prompt with 3 requirements and a response of 300 words:

- **Length target**: `base + perReq * reqCount = 100 + 60*3 = 280` (target length)
- **Length score**: Gaussian curve centered at 280, penalized if <140 or >504 words.
- **Coherence**: Jaccard similarity between sentences, bonus for headings/lists.
- **Vocabulary**: Unique content words / total, plus hapax ratio.
- **Repetition**: Penalizes repeated bigrams (e.g., "the cat" repeated).
- **Readability**: FK grade 10 → score near 1; grade 4 or 18 → score near 0.

### Limitations

- **Heuristics**: All metrics use simple heuristics (e.g., Jaccard for coherence, FK for readability). They may not capture deep semantic quality.
- **Language**: Assumes English; stopwords and syllable counting are English-centric.
- **Structure**: Headings/lists detected via regex, may miss edge cases.
- **Short texts**: Metrics are less reliable for very short responses (<40 words).
- **Repetition**: Only bigram repetition is penalized; longer phrase repetition is not detected.

### Rationale & Decisions

- **Why these metrics?**
  - Chosen for interpretability and ease of implementation; each metric is explainable and can be tuned for different prompt types.
  - Weighted sum allows flexible adjustment for different use cases (see DEFAULT_WEIGHTS).
- **Why not use deep learning for metrics?**
  - Project goal is transparency and reproducibility; all metrics are formulaic and can be audited.
- **Why normalize to 0–1?**
  - Enables easy comparison and aggregation; overallScore is mapped to 0–100 for user-facing display.
- **Why extract requirements from prompt?**
  - Allows length and coverage metrics to adapt to multi-part prompts, improving fairness.

### Extending/Customizing

- Adjust weights in DEFAULT_WEIGHTS for different priorities (e.g., more weight on coherence for essays).
- Add new metrics by extending `calculateMetrics` and updating the ResponseMetrics interface.
- For non-English support, update stopwords and syllable counting logic.

See code comments in `metrics.ts` for further details and implementation notes.

---

## Project Assumptions

### LLM API Used

- The project assumes access to a compatible LLM API (e.g., OpenAI, Groq, or similar) via a backend endpoint.
- API keys and credentials are provided via `.env` files (never committed to version control).
- The `/api/experiment` route expects to POST a prompt and parameter sets, and receive a JSON response with generated completions and metrics.
- The API response format is assumed to match the `ExperimentResponse` and `ResponseMetrics` interfaces defined in the codebase.
- Error handling expects the API to return either a valid JSON object or a JSON error field; non-JSON responses are treated as failures.

### Mock Data

- For local development and testing, mock data can be injected by stubbing API routes in `app/api/experiment/route.ts` and `app/api/reports/route.ts`.
- Example mock response:
  ```json
  {
    "responses": [
      {
        "id": "mock-1",
        "response": "This is a mock LLM output.",
        "metrics": { "coherenceScore": 0.8, "lengthScore": 0.9, ... }
      }
    ]
  }
  ```
- The UI components (`ResultsDisplay`, `ResponseCard`, etc.) are designed to handle both real and mock data, as long as the shape matches the expected interfaces.
- When the API is unavailable, the UI falls back to local state or mock data if provided.

### Other Assumptions

- All metrics and text processing are English-centric (stopwords, syllable counting, FK grade).
- The app is intended for desktop and modern browsers; mobile support is not guaranteed.
- Mantine theme tokens are available at runtime for dynamic styling.
- No sensitive data is stored or logged client-side; all secrets are managed via environment variables.

For more details, see the API route files and the interfaces in `app/types.ts` and `lib/metrics.ts`.

---

## UI/UX Design Rationale

### Design Principles

- **Clarity & Accessibility**: Layouts use Mantine's spacing and typography for readability. Focus-visible outlines and ARIA attributes ensure keyboard and screen reader accessibility.
- **Consistency**: All metric tiles, cards, and list items use shared CSS classes and Mantine props for consistent spacing, shadows, and border radii.
- **Responsiveness**: Components use Mantine's responsive props and grid utilities for desktop and tablet support.
- **Visual Hierarchy**: Key actions (run experiment, export, view report) are highlighted with color and button placement. Error and empty states use clear icons and messaging.

### Color Palette

- **Brand/Accent**: Teal (`#06b6d4`), Violet (`#6366f1`), Blue (`#3b82f6`)
- **Background/Foreground**: Light mode uses white backgrounds and dark text; dark mode uses near-black backgrounds and light text, controlled by Mantine's color scheme.
- **Utility Colors**: Red for errors, orange for readability, cyan/yellow for metrics.
- **CSS Variables**: Colors are set via CSS variables in `globals.css` and Mantine theme tokens, enabling easy dark/light mode switching.

### User Journey

1. **Landing**: User sees experiment form and instructions.
2. **Run Experiment**: User enters prompt and parameters, submits form.
3. **Loading State**: Spinner and status text shown while waiting for API.
4. **Results**: Metrics chart and response cards displayed; user can export results.
5. **Reports**: User navigates to reports page to view past experiments; can open details or start a new experiment.
