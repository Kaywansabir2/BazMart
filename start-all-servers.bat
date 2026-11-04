@echo off
REM BazMart - Unified Local Startup Batch Script
REM Ports: 4000 (Customer App), 4001 (Backend API), 4002 (Admin/Driver Portal). NEVER PORT 3000!

echo =================================================
echo    Starting BazMart High-Velocity Local Stack   
echo =================================================

set ROOT=%~dp0
set "PATH=C:\Users\zakar\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe;%PATH%"

echo [1/3] Launching Laravel Enterprise Backend API on http://localhost:4001...
start "BazMart Laravel API (:4001)" cmd /k "cd /d %ROOT%backend-laravel && php artisan serve --host=127.0.0.1 --port=4001"

echo [2/3] Launching Customer Web App on http://localhost:4000...
start "BazMart Customer Web (:4000)" cmd /k "cd /d %ROOT%mobile-app && node server.js"

echo [3/3] Launching Admin & Driver Portal on http://localhost:4002...
start "BazMart Admin Web (:4002)" cmd /k "cd /d %ROOT%admin-web && npx next start -p 4002"

echo.
echo All 3 BazMart servers initiated in external windows:
echo   - Customer Web:  http://localhost:4000
echo   - Backend API:   http://localhost:4001
echo   - Admin Portal:  http://localhost:4002
echo.
echo Opening Admin Portal in browser...
start http://localhost:4002
echo Strict Port Safety: Port 3000 untouched.
