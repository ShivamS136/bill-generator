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
| `npm run dev` | Dev server (mode `development`) |
| `npm run build` | Production build (mode `production`) |
| `npm run build:dev` | Build in mode `development` |
| `npm run preview` / `preview:dev` | Serve the production / dev build locally |
| `npm run typecheck` | `tsc -b` |
| `npm run check` / `check:fix` | Biome lint + format check / autofix |
| `npm run lint` / `format` | Biome lint only / format with write |

## Environments

All env files are git-ignored except `.env.example`, which lists every key (all optional). Copy it to `.env` and fill in your own defaults; use `.env.development` / `.env.production` for mode-specific overrides such as `VITE_BASE_PATH`.

The mode decides the rest: `dev` and `build:dev` (mode `development`) show the 🧪 Sample bill and an environment badge; `build` (mode `production`) leaves the sample out of the bundle.

The Pages build sets `VITE_BASE_PATH` and `VITE_GITHUB_REPO` from the repository, and reads the `VITE_DRIVER_SALARY_*` defaults from GitHub repository variables (**Settings → Secrets and variables → Actions → Variables**). Unset variables leave those fields empty.

## Styling

Tailwind CSS v4 via `@tailwindcss/vite`. Theme tokens (colors, fonts, shadows) live in `src/styles/index.css` under `@theme`; shared class strings are in `src/components/ui.ts` and `src/components/form/styles.ts`. Biome sorts classes (`useSortedClasses`, also inside `cx(...)`).

Inside a `<Paper>`, avoid Tailwind's `translate-*`/`rotate-*`/`scale-*` utilities — they use individual transform properties that the PDF renderer ignores; use an inline `transform` instead.

## Adding a bill

1. Create `src/bills/<bill-id>/index.tsx` exporting `defineBill<YourData>({ initialData, Form, Preview, fileName })`.
   `src/bills/_sample/index.tsx` is a working reference.
2. Build the form from `src/components/form` (`TextField`, `AmountField`, `SelectField`, `TextAreaField`, `SignatureInput`, `FieldGrid`, `FormSection`).
3. Render the preview inside one or more `<Paper>` sheets — each sheet is one A4 page in the PDF.
   Render signatures with `SignatureMark` inside `Draggable` to make them movable, resizable and rotatable; `Preview` gets `onChange` to store their placement.
   Add `normalize` to validate stored data (e.g. `parseSignature`) when the saved shape may be outdated.
4. Attach it in `src/bills/registry.ts`: `{ id: '<bill-id>', name, emoji, module: yourBill }`.

Bills without a `module` show a "coming soon" state. Routes are hash based (`#/fuel-bill`) so deep links work on GitHub Pages.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`.
Enable it once under **Settings → Pages → Source: GitHub Actions**.
