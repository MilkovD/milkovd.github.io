# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the React + TypeScript app; shared UI lives in `src/components`, Supabase helpers in `src/supabaseClient.ts`, and wishlist data in `src/wishlist.ts`.
- `public/` serves static assets; `images/` stores shared media; standalone static pages (e.g., `currency-converter.html`, `rustoeng.html`, `index.html`) live at the repo root.
- Vite outputs to `dist/` after builds; keep new frontend modules under `src/` and static files under `public/`.

## Build, Test, and Development Commands
- `npm install` to install dependencies.
- `npm run dev` starts the Vite dev server for local development.
- `npm run build` runs TypeScript project references (`tsc -b`) then bundles via `vite build`.
- `npm run preview` serves the built `dist/` folder locally to sanity check production output.

## Coding Style & Naming Conventions
- Use functional React components with explicit prop typing; prefer hooks over class components.
- Follow the existing style: 2-space indentation, single quotes, and TypeScript-first modules.
- Name components/files in PascalCase (e.g., `HeaderBar.tsx`), utilities in lower camel case, and keep Supabase-related code centralized in `supabaseClient.ts`.
- Keep secrets out of the repo; rely on `import.meta.env` for runtime configuration.

## Testing Guidelines
- There is no automated test suite yet; add lightweight unit/interaction tests alongside code using `*.test.ts` or `*.test.tsx`.
- If adding tests, use Vitest + React Testing Library; mock Supabase auth calls and keep fixtures small.
- Run `npm run build` as a minimum verification step before opening a PR.

## Commit & Pull Request Guidelines
- Write short, imperative commit subjects; Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) are encouraged for clarity.
- PRs should include: a concise summary, linked issue (if any), screenshots for UI changes (auth states and menus), reproduction/verification steps, and any required env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Keep PRs narrowly scoped (e.g., separate visual tweaks from auth/session changes) and ensure the build passes before requesting review.

## Security & Configuration Tips
- Store Supabase keys in `.env.local` (never commit them). Example:
```
VITE_SUPABASE_URL=https://your-instance.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
- Document new env vars in `README` or a checked-in `.env.example` and avoid adding unreviewed third-party scripts to `public/` pages.
