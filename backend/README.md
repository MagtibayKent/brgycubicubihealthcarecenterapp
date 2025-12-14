Backend (minimal)

Purpose: hold Supabase `service_role` key and expose server-only endpoints.

Quick start:

1. cd backend
2. npm install
3. copy `.env.example` to `.env` and fill values
4. npm run dev

Notes:
- Keep the service_role key only on the server.
- Add RPCs or endpoints for privileged tasks (reports, scheduled jobs).
