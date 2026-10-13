# HireSprint — Quick Start Guide

## Windows PowerShell Command Usage
Because PowerShell execution policy blocks `.ps1` wrapper scripts, always run `npm.cmd` directly:

```powershell
npm.cmd install --legacy-peer-deps
npm.cmd run seed
npm.cmd run dev
```

## URLs
- **Frontend App**: http://localhost:5173
- **Backend API**: http://localhost:4000/api/v1/health

## Test Credentials
All accounts are provisioned with password: `HireSprint@123`
- **Student**: `student@hiresprint.local`
- **Teacher**: `teacher@hiresprint.local`
- **TnP Cell**: `tnp@hiresprint.local`
- **Coordinator**: `coordinator@hiresprint.local`
- **Admin**: `admin@hiresprint.local`

*(You can also use the one-click quick-select pills on the `/login` screen).*

## Automated Tests & Verification
```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
```
