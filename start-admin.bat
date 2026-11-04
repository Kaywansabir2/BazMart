@echo off
REM BazMart - Admin & Operations Dashboard Launcher
REM Port: http://localhost:4002

echo =======================================================
echo    BazMart Next.js Admin & Driver Operations Portal
echo =======================================================
echo.

set ROOT=%~dp0

echo Starting Next.js Admin on http://localhost:4002 ...
start "BazMart Admin Web (:4002)" cmd /k "cd /d %ROOT%admin-web && npx next start -p 4002"

echo Opening browser...
start http://localhost:4002
echo Launcher completed.
