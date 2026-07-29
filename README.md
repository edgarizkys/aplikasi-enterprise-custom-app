# Aplikasi Enterprise Custom

ERP system. Manage employees, projects, payroll.

## Tech Stack
- Backend: Express.js
- Database: Turso SQLite
- Frontend: Tailwind CSS
- Auth: JWT

## Setup
1. `npm install`
2. Set `TURSO_DB_URL` and `TURSO_AUTH_TOKEN` in `.env`
3. `npm run dev`

## Features
- Employee CRUD
- Project Tracking
- Payroll Integration
- Departmental Reporting

## API Endpoints
- GET `/api/employees` - List employees
- POST `/api/employees` - Add employee
- GET `/api/projects` - List projects
- POST `/api/projects` - Add project

## License
MIT