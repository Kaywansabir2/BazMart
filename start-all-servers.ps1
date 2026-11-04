# BazMart — Unified Local Startup Script
# Strict Invariant: Ports 4000 (Customer App), 4001 (Backend API), 4002 (Admin/Driver Portal). NEVER PORT 3000!

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   Starting BazMart High-Velocity Local Stack    " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
$phpPath = "C:\Users\zakar\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe"
$env:PATH = "$phpPath;$env:PATH"

# 1. Start Laravel Enterprise Backend API on Port 4001
Write-Host "[1/3] Launching Laravel Enterprise Backend API on http://localhost:4001..." -ForegroundColor Yellow
$backendJob = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$root\backend-laravel`" && set PATH=$phpPath;%PATH% && php artisan serve --host=0.0.0.0 --port=4001" -PassThru -WindowStyle Minimized

# 2. Start Customer Web App on Port 4000
Write-Host "[2/3] Launching Customer Web App on http://localhost:4000..." -ForegroundColor Yellow
$mobileJob = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$root\mobile-app`" && node server.js" -PassThru -WindowStyle Minimized

# 3. Start Admin & Driver Web on Port 4002
Write-Host "[3/3] Launching Admin & Driver Portal on http://localhost:4002..." -ForegroundColor Yellow
$adminJob = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$root\admin-web`" && npx next start -p 4002" -PassThru -WindowStyle Minimized

Write-Host "`nAll 3 BazMart servers initiated in background processes:" -ForegroundColor Green
Write-Host "  - Customer Web:  http://localhost:4000" -ForegroundColor Green
Write-Host "  - Backend API:   http://localhost:4001" -ForegroundColor Green
Write-Host "  - Admin Portal:  http://localhost:4002" -ForegroundColor Green
Write-Host "`nStrict Port Safety: Port 3000 untouched." -ForegroundColor Cyan
