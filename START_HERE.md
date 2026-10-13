# HireSprint — Start Here

## Windows PowerShell
If PowerShell says `npm.ps1 cannot be loaded because running scripts is disabled`, use the Windows command shim directly:

```powershell
npm.cmd install
npm.cmd run dev
```

This avoids the PowerShell `npm.ps1` execution-policy error.

Alternative for the current terminal only:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
npm run dev
```

## URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api/health

## Default mode
`DEMO_MODE=true` means HireSprint starts without PostgreSQL. The backend provides working API endpoints and Socket.IO signaling with demo data.

## PostgreSQL mode
Copy `.env.example` to `.env`, set `DEMO_MODE=false`, configure `DATABASE_URL`, then run:

```powershell
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run seed
npm.cmd run dev
```
