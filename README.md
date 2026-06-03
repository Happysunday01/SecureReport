# SecureReport

SecureReport is an incident reporting application with a backend API and a frontend user interface.

## Repository structure

- `backend/` - Express API server, admin creation script, and local database support
- `frontend/` - Static UI files for the incident reporting app
- `pb_data/`, `pocketbase.exe` - local PocketBase data/binary ignored from git

## Setup

1. Install dependencies
   - `npm install`
   - `cd backend && npm install`
2. Start the backend server
   - `cd backend && npm run dev`
   - or `cd backend && npm start`
3. Open the frontend
   - Open `frontend/index.html` in a browser
   - or serve the `frontend/` folder from a static web server

## Backend commands

- `npm run dev` — start the backend with `nodemon`
- `npm start` — start the backend with `node server.js`
- `npm run create-admin` — create an admin user

## Notes

- A `.gitignore` file is configured to ignore `node_modules/`, PocketBase local data, `pocketbase.exe`, `.env` files, logs, OS files, and editor settings.
- If you use environment variables, keep them in a local `.env` file and do not commit them.
