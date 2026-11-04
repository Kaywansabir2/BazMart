@echo off
REM BazMart - Dedicated Laravel Backend Launcher
REM Port: http://localhost:4001

echo =======================================================
echo    BazMart Laravel 13 Enterprise Backend Engine
echo =======================================================
echo.

set ROOT=%~dp0
set "PATH=C:\Users\zakar\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe;%PATH%"

echo Starting Laravel on http://127.0.0.1:4001 ...
start "BazMart Laravel API (:4001)" cmd /k "cd /d %ROOT%backend-laravel && php artisan serve --host=127.0.0.1 --port=4001"

echo Opening browser...
start http://localhost:4001
start http://localhost:4001/api/v1/catalog/home

echo Laravel launcher completed.
