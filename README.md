# Bill Generator

Frontend-only bill and receipt generator (fuel, rent, driver salary, internet, …) with an inline signature pad and PDF download. Everything runs in the browser; form data is saved to `localStorage`.

## Setup

```sh
nvm use          # Node 24 (.nvmrc)
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with `.env.development` |
| `npm run build` | Production build with `.env.production` (GitHub Pages, base `/bill-generator/`) |
| `npm run build:dev` | Build with `.env.development` (base `/`) |
| `npm run preview` / `preview:dev` | Serve the production / dev build locally |
| `npm run typecheck` | `tsc -b` |
| `npm run check` / `check:fix` | Biome lint + format check / autofix |
| `npm run lint` / `format` | Biome lint only / format with write |

## Environments

| File | Used by |
| --- | --- |
| `.env` | Shared defaults (app name, GitHub repo, per-bill field defaults such as `VITE_DRIVER_SALARY_*`) |
| `.env.development` | `dev`, `build:dev`; enables the 🧪 Sample bill |
| `.env.production` | `build`; sample bill is excluded from the bundle |
| `.env.local` (git-ignored) | Personal overrides |

## Styling

Tailwind CSS v4 via `@tailwindcss/vite`. Theme tokens (colors, fonts, shadows) live in `src/styles/index.css` under `@theme`; shared class strings are in `src/components/ui.ts` and `src/components/form/styles.ts`. Biome sorts classes (`useSortedClasses`, also inside `cx(...)`).

Inside a `<Paper>`, avoid Tailwind's `translate-*`/`rotate-*`/`scale-*` utilities — they use individual transform properties that the PDF renderer ignores; use an inline `transform` instead.

## Adding a bill

1. Create `src/bills/<bill-id>/index.tsx` exporting `defineBill<YourData>({ initialData, Form, Preview, fileName })`.
   `src/bills/_sample/index.tsx` is a working reference.
2. Build the form from `src/components/form` (`TextField`, `AmountField`, `SelectField`, `TextAreaField`, `SignatureField`, `ImageSourceField`, `FieldGrid`, `FormSection`).
3. Render the preview inside one or more `<Paper>` sheets — each sheet is one A4 page in the PDF.
   Use `DraggableImage` for signatures that should be movable on the preview; `Preview` gets `onChange` to store their placement.
4. Attach it in `src/bills/registry.ts`: `{ id: '<bill-id>', name, emoji, module: yourBill }`.

Bills without a `module` show a "coming soon" state. Routes are hash based (`#/fuel-bill`) so deep links work on GitHub Pages.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`.
Enable it once under **Settings → Pages → Source: GitHub Actions**.
