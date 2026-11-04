# BazMart - Admin & Operations Dashboard Launcher (PowerShell)
# Port: http://localhost:4002

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "    BazMart Next.js Admin & Driver Operations Portal   " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Next.js Admin on http://localhost:4002 ..." -ForegroundColor Green
Set-Location "$PSScriptRoot\admin-web"
npx next dev -p 4002

