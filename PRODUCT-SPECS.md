“Sets by Muscle” — MVP Product Doc

A tiny, front-end-only web app to track strength training sets per muscle group, plan around variable PT sessions, and avoid accidental over/under-training. Runs as a single HTML file with JS + CSS, persisting to localStorage.

1) Goals & Non-Goals

G-01 (Goal): Let a user quickly log sets per muscle group for a specific training day.
G-02: Show simple insights: most-trained groups (bar chart) and a color “heat map” that gets redder as groups are trained more.
G-03: Provide a searchable list of training days and entries.
G-04: Keep it super simple to develop + host: static site, no backend, localStorage only.

NG-01 (Non-goal): No accounts/auth, no sync, no programs/workout plans, no weights/RPE, no reps tracking.
NG-02: No medical advice; only simple heuristics based on user’s stated targets.

2) Primary Persona

P-01 “Laila”: Trains with variable PT on Tuesdays; wants to hit ~10–15 sets per target muscles across the week. Needs to drop in “I did 3 sets of bench” and see how that affects chest/triceps/front delts totals so she can decide what to train Thu/Sun to avoid overtraining.

3) User Stories (with IDs)

US-01: As Laila, I can create/select a training day (date) so all sets are tied to that day.

US-02: As Laila, I can quick-add: type “3 sets bench” and the app allocates sets to mapped muscles automatically.

US-03: As Laila, I can manually add sets to one or more muscle groups with a number field.

US-04: As Laila, I can see totals per muscle group over a selectable window (e.g., last 7 days).

US-05: As Laila, I can see a bar chart of most-trained groups in the selected window.

US-06: As Laila, I can see a colored SVG grid/silhouette where muscles get more red when trained more.

US-07: As Laila, I can search/filter training days by date range, query text, or muscle group.

US-08: As Laila, I can add a note to a training day (e.g., “PT: full body, slight ham focus”).

US-09: As Laila, I can set a weekly target (default 10–15 sets) and see simple hints (under/at/over).

US-10: As Laila, I can edit/delete entries for a day.

US-11: As Laila, I can export/import my data as JSON for backup/migration.

US-12: As Laila, I can use the app entirely offline and it remembers my data (localStorage).

4) Functional Requirements (Features) with IDs

FR-01 (Training Day CRUD) — Create/select today or any date; show day summary; add note. (US-01, US-08, US-10, US-12)
Acceptance: I can pick a date; day card shows date + note; deleting a day removes its entries.

FR-02 (Manual Set Entry) — Choose one or more muscle groups and enter an integer (can be fractional if needed). (US-03)
Acceptance: Adding “Chest 3” increments chest by 3 for that day.

FR-03 (Quick Add Parser) — Text box: parse patterns like 3 sets bench or benched 3 → allocate to muscles via a mapping dictionary + weights. (US-02)
Acceptance: “3 sets bench” adds 3 to Chest, and e.g., 1.5 to Triceps, 1.0 to Front Delts (configurable weights).

FR-04 (Rolling Totals) — Show totals per muscle over a window (7d default; options: 3/7/14/28 days). (US-04)
Acceptance: Date window selector updates totals instantly.

FR-05 (Bar Chart) — Simple SVG/Canvas bar chart of totals by muscle for the current window. (US-05)
Acceptance: Bars reflect sorted totals descending; hovering shows exact values.

FR-06 (Muscle Heat Map) — SVG grid (or simple body outline) with cells colored by training load. (US-06)
Acceptance: More sets → deeper red; legend explains scale.

FR-07 (Search & Filter) — Search by free text (notes), filter by date range and by muscle group to see matching days. (US-07)
Acceptance: Typing “ham” finds days with hamstring entries/notes.

FR-08 (Targets & Hints) — Per muscle, indicate Under (<10), Good (10–15), High (>15) for the selected window. (US-09)
Acceptance: Status chip per muscle updates with window and totals.

FR-09 (Edit/Delete) — Edit or remove an individual entry or an entire day. (US-10)
Acceptance: After deletion, totals/charts refresh correctly.

FR-10 (Export/Import JSON) — Download data as JSON; upload to restore/merge. (US-11)
Acceptance: Exported → re-imported equals original data.

5) Non-Functional Requirements

NFR-01: Single static file bundle (or 3 files: index.html, app.js, styles.css).

NFR-02: No external backend; localStorage only.

NFR-03: First paint < 1s on mid-range phone; all interactivity under 100ms.

NFR-04: Mobile-first layout; keyboard-friendly; color-blind-safe alternative cues (icons/text).

NFR-05: Works offline once loaded (no service worker needed for MVP).

6) Data Model (Local Storage Schema)

DM-01: Muscle Groups (fixed list for MVP)

[
  "Chest","Back","Lats","Traps","Rear Delts","Front Delts",
  "Biceps","Triceps","Quads","Hamstrings","Glutes","Calves","Core"
]


DM-02: Training Day

{
  "id": "2025-08-18",           // ISO date
  "note": "PT: full body, ham focus",
  "entries": [
    {
      "id": "e_1723971200000",
      "type": "manual" | "quick",
      "muscleSets": { "Chest": 3, "Triceps": 1.5, "Front Delts": 1 },
      "rawText": "3 sets bench", // only for 'quick'
      "timestamp": 1723971200000
    }
  ]
}


DM-03: App State / Settings

{
  "windowDays": 7,
  "targets": { "defaultMin": 10, "defaultMax": 15 },
  "muscleWeights": {
    "bench": { "Chest": 1.0, "Triceps": 0.5, "Front Delts": 0.33 },
    "squat": { "Quads": 1.0, "Glutes": 0.5, "Hamstrings": 0.33 },
    "deadlift": { "Hamstrings": 1.0, "Glutes": 0.5, "Back": 0.5 },
    "row": { "Back": 1.0, "Lats": 0.5, "Biceps": 0.33 },
    "ohp|shoulder press": { "Front Delts": 1.0, "Triceps": 0.5, "Chest": 0.25 },
    "curl": { "Biceps": 1.0 },
    "triceps": { "Triceps": 1.0 },
    "hip thrust": { "Glutes": 1.0, "Hamstrings": 0.33 },
    "hamstring curl": { "Hamstrings": 1.0 },
    "lat raise": { "Front Delts": 1.0, "Rear Delts": 0.25 },
    "calf raise": { "Calves": 1.0 },
    "plank|crunch": { "Core": 1.0 }
  }
}


DM-04: Storage Keys

sbm_days → array of Training Day objects

sbm_settings → App State / Settings

7) Algorithms & Rules

ALG-01 (Quick Add Parse):

Extract {count} as the first integer or decimal in the string. Default to 1 if missing.

Find the first matching exercise keyword in muscleWeights (case-insensitive; supports simple | alternatives).

Allocate count * weight sets to each mapped muscle; merge into the selected day.

If no keyword match, prompt to use manual entry.

ALG-02 (Window Totals):

For a given end date (default = today), sum per muscle for entries whose day.date ∈ (end-windowDays+1 … end).

ALG-03 (Target Status):

If total < min → Under; between [min, max] → Good; > max → High.

ALG-04 (Heat Map Color):

Normalize each muscle’s total: n = clamp(total / maxScale, 0, 1) where maxScale = max(targetMax, 15) by default.

Map n to color via HSL from light grey → red, e.g., hsl(0, 80%, L) with L = 95% - n*60%.

Provide labels and exact numbers on hover; also show status chips for accessibility.

8) UI / UX (Components with IDs)

UI-01 Header: App title + date picker (defaults to today), window selector (3/7/14/28d).

UI-02 Quick Add Box: Text input (placeholder: "e.g., 3 sets bench") + Add button; parse feedback inline. (FR-03)

UI-03 Manual Entry: Multi-select of muscles + numeric input (“Sets”) + Add. (FR-02)

UI-04 Day Summary Card: Shows selected day, note (editable), and list of entries with edit/delete actions. (FR-01, FR-09)

UI-05 Totals Panel: Per muscle totals for the current window with status chips (Under/Good/High). (FR-04, FR-08)

UI-06 Bar Chart: Simple SVG/Canvas chart sorted by total desc; tooltip on hover. (FR-05)

UI-07 Heat Map: SVG grid of labeled cells (one per muscle); color legend at bottom. (FR-06)

UI-08 History & Search: Table/list of days with note snippet, filters: date range, text, muscle. (FR-07)

UI-09 Data Controls: Export JSON, Import JSON (file input), “Reset All” (with confirm). (FR-10)

UI-10 Footer: Version + tiny privacy blurb.

Wireframe (text):
[Header]
[Quick Add]
[Manual Entry]
[Day Summary Card]
[Totals Panel (chips)]
[Bar Chart]
[Heat Map]
[History & Search]
[Data Controls]
[Footer]

9) Accessibility & i18n

A11Y: Keyboard navigable; inputs labeled; chart bars & heat cells have text/ARIA labels and tooltips. Status chips include icons (↓ ✓ ↑).

Localization: MVP in English; copy text centralized for future Dutch toggle.

10) Tech & Hosting

Stack: Vanilla JS + SVG for charts/heatmap. (Optional: tiny helper libs under 10 KB total if truly needed.)

Build: None required; just static files.

Hosting: Any static hosting (GitHub Pages/Netlify or your “skere site”).

File Structure:

index.html
/assets/app.js
/assets/styles.css
/assets/body-map.svg  // optional, or inline SVG grid

11) Privacy

No accounts, no network requests.

All data stored locally in the browser via localStorage.

Export is a local file; import reads a local file. User is responsible for backups.

12) Risks & Mitigations

R-01 Parsing fails on weird text → Always offer manual entry fallback with a friendly hint.

R-02 Over/under advice oversimplifies → Clear disclaimer; user-configurable min/max targets.

R-03 Color-only signals → Add status chips and numeric labels.

13) MVP Scope Checklist (Release 1)

 FR-01 Training day CRUD + notes

 FR-02 Manual entry (multi-muscle)

 FR-03 Quick add parser (bench/squat/deadlift/row/ohp at minimum)

 FR-04 Rolling totals (window selector)

 FR-05 Bar chart (SVG)

 FR-06 Heat map (SVG grid with legend)

 FR-07 Search & filter (date range, text, muscle)

 FR-08 Targets & hints

 FR-09 Edit/delete entries

 FR-10 Export/import JSON

 NFRs met (offline, fast, mobile-first)

14) Acceptance Tests (QA) with IDs

QA-01: Create day 2025-08-18, add note “PT full body”; day persists after reload.

QA-02: Quick add “3 sets bench” allocates Chest + Triceps + Front Delts by weights; totals reflect 7-day window.

QA-03: Manual add “Hamstrings: 4” on 2025-08-20; bar chart and heat map update; Hamstrings chip shows Good if within 10–15 across window.

QA-04: Search “ham focus” returns the correct days.

QA-05: Edit an entry from 3→2 sets; totals decrease; charts update.

QA-06: Delete a day; entries vanish, storage shrinks.

QA-07: Export JSON, clear storage, import JSON → data restored exactly.

QA-08: Window switch 7→14 days changes totals and status chips accordingly.

15) Copy (MVP)

Placeholder texts:

Quick Add: “Type like: 3 sets bench or squat 5”

Manual: “Select muscles & enter sets”

Status legend: “Under (<10) · Good (10–15) · High (>15)”

Heat legend: “More red = more sets in selected window”

16) Open Questions

OQ-01: Should we include a default exercise list for quick-add autocomplete?

OQ-02: Do we want fractional allocations (e.g., 0.33) visible or rounded for display? (Backend keeps decimals.)

OQ-03: Should “Full Body PT” quick action add 1 set to many groups, or just a note?

17) Appendix — Minimal Exercise → Muscle Mapping (MVP)

Bench: Chest (1.0), Triceps (0.5), Front Delts (0.33)

Squat: Quads (1.0), Glutes (0.5), Hamstrings (0.33)

Deadlift: Hamstrings (1.0), Glutes (0.5), Back (0.5)

Row: Back (1.0), Lats (0.5), Biceps (0.33)

OHP/Shoulder Press: Front Delts (1.0), Triceps (0.5), Chest (0.25)

Hip Thrust: Glutes (1.0), Hamstrings (0.33)

Hamstring Curl: Hamstrings (1.0)

Lat Raise: Front Delts (1.0), Rear Delts (0.25)

Calf Raise: Calves (1.0)

Core (Plank/Crunch): Core (1.0)

18) Stretch (Post-MVP)

Body silhouette SVG instead of grid; drag-to-add sets.

Simple weekly calendar view.

PWA/service worker for installable offline app.

Optional per-muscle weekly caps (soft warnings).

Custom exercise editor with your own mappings.

Implementation Notes (developer quick start)

Single index.html with inline SVG bar chart & heat map to avoid deps.

localStorage wrapper with schema migration guard.

Pure functions: parseQuickAdd(text), allocateSets(keyword, count, weights), computeTotals(days, window), statusFor(total), colorFor(total).

If you want, I can follow this doc and produce a tiny single-file prototype next—just say the word and I’ll ship an index.html that matches this MVP.