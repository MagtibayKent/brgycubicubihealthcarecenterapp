# Barangay Clinic System

## Description
A full-stack clinic records management application for managing patient visits, medical records, and generating clinic statistics. The system uses a React frontend for user interface and a Node.js backend for privileged Supabase operations.

## Frameworks and Technologies

**Frontend:**
- Vite + React 18
- Supabase (PostgREST API)
- Chart.js + react-chartjs-2 for reports

**Backend:**
- Node.js + Express
- Supabase (service_role privileged operations)
- CORS enabled for cross-origin requests

**Database:**
- Supabase (PostgreSQL)

## Setup Instructions

### Prerequisites
- Node.js v16+ and npm
- Git

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_BACKEND_URL=http://localhost:4242
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   App available at `http://localhost:5173`

### Backend Setup (Optional)
1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Fill in Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE=your_service_role_key
   PORT=4242
   ```

4. Start backend (with auto-reload):
   ```bash
   npm run dev
   ```
   Backend available at `http://localhost:4242`

## Features
- **Record Management:** New visit forms, listing, search, edit, and delete flows (`src/components/Record.jsx`)
- **Edit Modal:** Modal for editing records (`src/components/EditModal.jsx`)
- **Delete Confirmation:** Confirmation modal for deletions (`src/components/DeleteConfirmModal.jsx`)
- **Reports:** Aggregated charts and statistics (`src/components/Reports.jsx`)
- **Supabase Integration:** Client initialization for database access (`src/supabaseClient.js`)

### Styling
- Styles are organized in `src/index.css` with short commented sections.

### Debugging
- Development `console.debug` calls in `Record.jsx` should be removed or gated for production.

### Extending the App
- Add new components under `src/components/` and wire routes in `App.jsx`.
- Centralize data access through `supabaseClient.js` or a new `src/services/` layer.

## Contributing
See `CONTRIBUTING.md` for a short guide on project conventions and how to extend the app.