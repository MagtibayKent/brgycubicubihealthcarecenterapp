Contributing to Barangay Clinic (short guide)

1. Project layout
- `src/` : application source
  - `components/` : React components (Record.jsx, Reports.jsx, EditModal.jsx, etc.)
  - `supabaseClient.js` : initialize and export public (anon) `supabase` client
  - `backend/` : optional Node/Express backend for privileged server-only actions
  - `index.css` : global styles

2. Coding conventions
- Keep components small and focused; extract repeated UI into small components.
- Write short file-level descriptions for new modules. Keep functions single-purpose.
- Prefer clear, readable variable names; avoid deeply nested logic in components.

3. Backend & environment guidance (added)
- The repository includes an optional `backend/` Express app for server-only operations (service_role key).
- Never commit real secrets. Keep `.env` files local and use `.env.example` as templates.
- Local dev: set Vite client envs (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_BACKEND_URL) in the frontend root `.env`.
- Server env (in `backend/.env`): set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only on the server.

4. Security notes
- Treat `SUPABASE_SERVICE_ROLE_KEY` as highly sensitive — do not push to any public repo.
- Ensure Row-Level Security (RLS) policies are configured for public anon usage; use the service role only for trusted server operations.

5. Debugging and logs
- Use browser devtools Network tab for API failures. Check server logs for backend errors.
- Keep `console` usage minimal; prefer structured error responses from the backend.

6. Pull requests & commits
- Keep PRs small and focused; include a brief description and list of affected files.
- Commit message convention (suggested):

  - Format: `type(scope): short description` where `type` is `feat`, `fix`, `docs`, `chore`, `refactor`, or `test`.
  - Example: `feat(backend): add clinic stats endpoint`

7. Running locally (quick commands)

Frontend (dev):
```bash
npm install
npm run dev
```

Backend (dev):
```bash
cd backend
npm install
npm run dev
```

8. PR checklist
- [ ] Code builds and runs locally
- [ ] No secrets committed (`git status` shows no `.env` files)
- [ ] Documentation updated for any new feature
- [ ] Tests added for non-trivial logic (if applicable)

9. Questions & support
- If you're unsure where to add server logic or how RLS should behave, open an issue or start a draft PR so we can review design decisions together.

Thanks — follow these guidelines to keep the project secure, modular, and review-friendly.
