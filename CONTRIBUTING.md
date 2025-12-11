Contributing to Barangay Clinic (short guide)

1. Project layout
- `src/` : application source
  - `components/` : React components (Record.jsx, Reports.jsx, EditModal.jsx, etc.)
  - `supabaseClient.js` : initialize and export `supabase` client
  - `index.css` : global styles, organized by commented sections

2. Coding conventions
- Keep components small and focused. Prefer extracting repeated UI into small components.
- Add concise file header comments at the top of each file describing purpose.
- For CSS, add a short comment above major sections (nav, forms, reports) — avoid large blocks.

3. Database and Supabase
- Use `supabaseClient` for DB calls. For complex data logic, create `src/services/` and call from components.
- Be mindful of Row-Level Security (RLS) policies in Supabase. If client writes fail with 403, check project policies.

4. Debugging
- Use `console.debug` during development. Remove or guard these logs for production builds.
- For failures, capture Network tab requests (POST/PATCH to PostgREST endpoints) to understand RLS or schema errors.

5. Pull requests
- Keep PRs small and focused.
- Add a short description of the change and mention any DB migrations needed.

6. Running locally
- `npm install` then `npm run dev` to start the vite dev server.

Thanks for contributing — keep changes scoped and document new files briefly.
