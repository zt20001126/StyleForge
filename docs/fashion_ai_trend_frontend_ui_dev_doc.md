# StyleForge AI Fashion Trend Frontend UI Development Document

## 1. Product UI Goal

StyleForge frontend is a premium AI fashion trend and design SaaS interface. The MVP must feel closer to a high-end creative intelligence cockpit than a generic admin dashboard.

Primary experience:

- Users describe a fashion category, target user, scene, and style direction.
- The system returns a structured trend pool.
- Users select style, silhouette, structure, color, fabric, and selling points.
- A live design plan is assembled with popularity score and AI prompt.
- Users can save, favorite, export, and later generate visual assets from the plan.

## 2. Reference Implementation Patterns

### 2.1 Launch UI Pattern

Use a section-composed landing page:

- `Navbar`
- `Hero`
- `FeatureGrid`
- `Stats`
- `CTA`
- `Footer`

Implementation notes:

- Keep first viewport focused on the product name and AI fashion value proposition.
- Use a full-width dark stage, subtle grid lines, glass panels, and dashboard mockup.
- Avoid a generic marketing split layout. The product signal must be visible immediately.

### 2.2 Next Shadcn Dashboard Starter Pattern

Use an app shell for product pages:

- Persistent sidebar on desktop.
- Compact top header.
- `PageContainer` with dense but readable dashboard sections.
- Metric cards, chart cards, and data panels use consistent radius, border, and spacing.

Implementation notes:

- Use App Router route groups: marketing routes and app routes.
- Dashboard cards should be compact, not oversized hero cards.
- Use Recharts for trend and score visualization.

### 2.3 Vercel AI Image Generator Pattern

Use AI-workbench interaction patterns:

- Prompt/input panel is the main action center.
- Loading states are visible near the result region.
- Result cards preserve the submitted prompt/model/context.
- Generated outputs display as a responsive grid with status, metadata, and actions.

Implementation notes:

- For StyleForge, the AI result is first a structured design plan, then later images/videos.
- Keep `ai_prompt` copyable and exportable.
- Show prompt, selected design elements, and generated preview together.

## 3. Technical Stack

Required stack:

- Next.js App Router
- React + TypeScript
- TailwindCSS
- shadcn/ui-style primitives on top of Radix patterns
- lucide-react icons
- framer-motion for entrance and micro interactions
- Recharts for analytics cards
- Zustand for workbench state
- TanStack React Query for backend API calls
- next-themes for dark/light mode
- sonner for toast messages

## 4. Route Structure

```text
/
/trend-workbench
/gallery
/history
/settings
```

Recommended source layout:

```text
src/app/(marketing)/page.tsx
src/app/(app)/layout.tsx
src/app/(app)/trend-workbench/page.tsx
src/app/(app)/gallery/page.tsx
src/app/(app)/history/page.tsx
src/components/landing
src/components/workbench
src/components/dashboard
src/components/ui
src/lib/api
src/lib/types
src/store
```

## 5. Visual System

### 5.1 Visual Direction

Keywords:

- premium
- technical
- fashion intelligence
- dark cockpit
- editorial but operational
- clean, sharp, high contrast

Default theme is dark. Light theme must remain usable but does not need to be the primary brand expression.

### 5.2 Color Tokens

Use dark neutral surfaces with controlled cyan, violet, and lime accents:

- Background: near-black blue, not pure black.
- Surface: translucent dark panels.
- Border: low-opacity white/cyan lines.
- Primary accent: electric cyan.
- Secondary accent: violet.
- Positive signal: lime/emerald.
- Risk signal: amber/red.

Do not let the UI become a single-hue blue or purple page. Use fashion color swatches from AI output as content color, not global chrome.

### 5.3 Typography

- Use a modern sans font such as Geist.
- Hero type can be large.
- Dashboard headings must be compact.
- Numeric values use tabular numbers.
- No negative letter spacing.

### 5.4 Cards And Panels

- Radius: 8px to 12px.
- Cards use subtle borders and translucent surfaces.
- Avoid nested cards.
- Repeated items may be cards; page sections should be full-width or unframed.

### 5.5 Motion

Use motion sparingly:

- Landing hero entrance.
- Cards fade/slide in.
- Selected trend chips animate with scale or border glow.
- Loading states use skeletons or soft pulse.

Do not animate core dashboard layout in a way that causes visual instability.

## 6. Core Pages

### 6.1 Landing Page

Landing sections:

- `LandingNav`: brand, product links, CTA.
- `Hero`: product name, value proposition, CTA, dashboard preview.
- `CapabilityGrid`: trend analysis, AI design generation, bestseller forecast, design asset archive.
- `WorkflowSection`: input, trend pool, design plan, export.
- `LandingCTA`: enter workbench.

Hero copy:

- H1: `StyleForge`
- Supporting line: `AI fashion trend intelligence and design co-creation platform.`

### 6.2 Trend Workbench

Main layout:

```text
WorkbenchShell
  AnalysisInputForm
  TrendOverviewCards
  TrendPool
    TrendOptionSection(style)
    TrendOptionSection(silhouette)
    TrendOptionSection(structure)
    ColorPaletteSection
    TrendOptionSection(fabric)
    TrendOptionSection(selling point)
  RecommendedDirectionCards
  MyDesignPlanPanel
```

Desktop layout:

- Left/main column: input and trend pool.
- Right sticky column: design plan summary.

Mobile layout:

- Single column.
- Design plan becomes a bottom section, not an overlapping floating panel.

### 6.3 Gallery

Gallery shows saved design plans and later AI images:

- Responsive card grid.
- Each card displays title, score, selected palette, prompt snippet, tags, and actions.
- Empty state must invite the user to start a trend analysis.

### 6.4 History

History shows trend analysis records:

- Table/list hybrid.
- Category, target user, scene, style, status, created time.
- Status badges: success, processing, failed.
- Empty state and loading state.

## 7. Data Mapping

Use backend contract from `fashion_ai_trend_design_mvp_dev_doc.md`.

Important frontend mappings:

| Backend Field | UI Representation |
| --- | --- |
| `summary` | Trend hero summary and overview card |
| `opportunity` | Highlight metric card |
| `risk` | Warning metric card |
| `score` | Progress, badge, or chart value |
| `color_palette.hex` | Swatch matrix |
| `recommended_directions` | Three recommendation cards |
| `popularity_score` | Circular/linear score indicator |
| `ai_prompt` | Copyable prompt panel |
| `warnings` | Warning list in design plan panel |

## 8. State And API

Use Zustand store:

- `input`
- `analysis`
- `selection`
- `myDesignPlan`
- `loading`
- `error`
- `submitAnalysis`
- `toggleSelection`
- `applyRecommendedDirection`
- `saveDesignPlan`
- `exportJson`
- `exportMarkdown`

API adapter must expose:

- `createTrendAnalysis(input)`
- `listTrendAnalyses(params)`
- `generateDesignPlan(selection)`
- `saveDesignPlan(plan)`

MVP may use mock data first. Keep API function signatures compatible with backend.

## 9. Interaction Rules

- Form cannot submit empty required fields.
- On analysis submit, show loading and keep user input.
- After success, initialize default selections from highest-score options.
- Selecting options updates `MyDesignPlanPanel` immediately.
- Applying a recommended direction replaces the current selection.
- Export JSON/Markdown is handled client-side in MVP.
- Save/favorite uses the API adapter and falls back to mock success if backend is unavailable.

## 10. Required States

Every major module must support:

- initial
- loading
- success
- empty
- error

For MVP, mock data should make success state immediately demoable.

## 11. Acceptance Criteria

- `/` renders a polished high-end StyleForge landing page.
- `/trend-workbench` supports the full mock workflow from input to live design plan.
- `/gallery` shows saved/mock plan cards and empty state when applicable.
- `/history` shows mock trend records with status badges.
- Desktop and mobile layouts do not overlap.
- Dark theme is the default.
- Light theme remains readable.
- `npm run build` passes.
- `npm run lint` passes.

