# Barangay Clinic React App

## Description
A lightweight clinic records frontend built with Vite + React and Supabase.

## Technologies
- **Frontend Framework:** Vite + React
- **Backend/Database:** Supabase (PostgREST)
- **Charts:** Chart.js + react-chartjs-2 (optional)

## Installation
1. Ensure Node.js (v16+) is installed.
2. From the project root, run:
   ```bash
   npm install
   npm run dev
   ```
3. Configure Supabase: Update `src/supabaseClient.js` with your Supabase URL and anon key, or use environment variables for production.

The app will be available at the Vite dev URL (usually `http://localhost:5173`).

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