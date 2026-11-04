# BazMart — Dedicated Laravel Backend Launcher (PowerShell)
# Port: http://localhost:4001 (Port 3000 is strictly protected)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "    BazMart Laravel 13 Enterprise Backend Engine       " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

$env:Path = "C:\Users\zakar\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe;" + $env:Path

Write-Host "Serving Laravel on http://127.0.0.1:4001 ..." -ForegroundColor Green
Write-Host "Press Ctrl+C anytime to stop." -ForegroundColor Gray
Write-Host ""

Set-Location "$PSScriptRoot\backend-laravel"
php artisan serve --host=127.0.0.1 --port=4001

