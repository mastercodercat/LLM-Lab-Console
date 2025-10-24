# LLM Lab Console — Developer Guide

This document collects project conventions, setup steps, tooling commands, and practical guidelines introduced during the recent refactor (inline-style removal, resilient API handling, theme-aware CSS). Use it as a quick reference when developing, reviewing, or extending the project.

---

## Quick setup (Windows PowerShell)

Open PowerShell in the repository root and run:

```powershell
# install dependencies
npm install

# run TypeScript check
npx tsc --noEmit

# run ESLint across the repo
npm run lint -- .

# start dev server
npm run dev
```

Notes:

- The repo uses Next.js and Mantine for UI. Use `npm run dev` to run locally (Next dev server).
- If dependencies change, re-run `npm install`.

---

## Files you should know

- `app/components/ResultsDisplay.tsx` — Chart + result list UI. Uses Chart.js and small SWR integration for optional server-side metrics.
- `app/components/ResponseCard.tsx` — Per-response details and metric tiles.
- `app/components/ui/MetricCard.tsx` — Small presentational card used by `ResponseCard` and others.
- `app/components/ui/LoadingSpinner.tsx` — Centralized loading component (pulse animation injected once).
- `app/components/ui/ReportListItem.tsx` — List item for reports with keyboard & click handlers.
- `app/globals.css` — Global styles and project utility classes added for maintainability.

New/additional docs and guidelines are in this file.

---

## Styling & Theming Conventions

Goal: minimize inline styles, centralize presentational rules, and keep dynamic theme tokens available.

Rules:

- Prefer Mantine props (p, m, radius, color, etc.) for layout when available.
- Avoid `style={{ ... }}` for non-trivial styles. Use `className` and global CSS rules in `app/globals.css` (or component-scoped CSS modules if preferred).
- When a style requires a runtime Mantine theme value (e.g., a color token), set a CSS variable on the component root and reference that variable from the CSS class. Example:

```tsx
// component
<Paper style={{ ['--card-accent' as any]: theme.colors.teal[6] }} className="card-root">...</Paper>

/* globals.css */
.card-root { border-left: 4px solid var(--card-accent); }
```

- We added utility classes in `app/globals.css` (e.g., `.metric-card`, `.spinner-box`, `.report-item`, `.chart-box`) — reuse or extend these.

Accessibility/UX style rules:

- Keep `:focus-visible` outline for keyboard users (already present globally).
- Ensure color contrast is checked for all new CSS rules (especially for dark mode). Use `html[data-mantine-color-scheme="dark"]` variables if you need to tune dark-mode values.

---

## API fetching and resilience

Patterns adopted:

- SWR is used for optional background fetching (cached, deduped). Use it when you want automatic caching and revalidation.

  - Example options used: `revalidateOnFocus: false`, `dedupingInterval: 60000`.
  - For sensitive or mission-critical requests, configure retry policies explicitly.

- For direct `fetch` POST requests (like running an experiment):

  - Use `AbortController` to allow cancellation.
  - Read raw `response.text()` first and attempt to `JSON.parse` it; guard non-JSON responses.
  - Validate response shapes before using them (e.g., ensure `data.responses` is an array).

- UI fallback & retry UX:
  - Provide a retry button when an SWR fetch fails (calls `mutate()` to revalidate).
  - If the server fetch fails but local data exists (e.g., from a recent form submit), prefer rendering local data as a fallback while still showing an unobtrusive error/notice.

Example robust fetching pattern (pseudo):

```ts
const controller = new AbortController();
try {
  const res = await fetch(url, { signal: controller.signal });
  const txt = await res.text();
  const data = txt ? JSON.parse(txt) : {};
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
} catch (err) {
  if ((err as any).name === "AbortError") {
    /* cancelled */
  } else {
    throw err;
  }
}
```

Retry UX: when using SWR, render a friendly error card with a `Retry` button that calls `mutate()`; show `isValidating` state as the button loading indicator.

---

## Error handling & edge cases (apply these everywhere)

1. Defensive parsing: do not assume `res.json()` will always succeed. Wrap in try/catch.
2. Validate shapes before using: check `Array.isArray(x)` or presence of required fields.
3. Avoid rendering code paths that assume non-null deeply nested fields. Use optional chaining and fallbacks.
4. Provide meaningful user-facing messages for:
   - transient network failure ("Cannot reach server — retry"),
   - permanent failure ("Operation failed — check logs or contact admin"),
   - bad server response ("Unexpected server response").
5. For long-running operations, implement cancellation (AbortController) and a visible spinner. Allow users to cancel when appropriate.

---

## Accessibility checklist

- Add `aria-label` or `aria-describedby` to interactive/visual elements like charts.
- Ensure error messages and status updates use polite or assertive `aria-live` regions as appropriate.
- Keep and test keyboard accessibility for list items and buttons (`tabIndex`, `onKeyDown` handling). `ReportListItem` has `Enter` and space handling.
- Test color contrast for new CSS classes in both light/dark modes.
- Use tools: Lighthouse, axe, and manual keyboard testing.

---

## Testing suggestions

- Unit tests (Jest + React Testing Library):

  - `ResultsDisplay` — mock SWR and Chart.js; assert chart data produced and fallback UIs (loading, empty, error).
  - `ResponseCard` / `MetricCard` — snapshot outputs and accessibility attributes.
  - `ReportListItem` — assert keyboard navigation behavior (Enter/Space triggers navigation) using `next/navigation` mocking.

- Integration tests: spin up a minimal Next dev server and test flows: run an experiment, view results, export JSON.

---

## Security notes

- I found `.env` / `.env.local` in the workspace containing sensitive values (API keys, DB URL). Best practices:
  - Ensure these files are in `.gitignore` (do not commit secrets).
  - Rotate any keys that were committed or pushed to remote.
  - Use environment-specific secret storage for production (Azure Key Vault, AWS Secrets Manager, or similar).

---
