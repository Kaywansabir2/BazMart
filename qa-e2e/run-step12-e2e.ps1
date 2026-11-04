# Option C Playwright Test Runner
$root = (Get-Item $PSScriptRoot).Parent.FullName
$phpPath = "C:\Users\zakar\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe"

Write-Host "============================================================"
Write-Host "BazMart Step 12: Automated Option C Playwright Runner"
Write-Host "Strict Port Safety: 4000, 4001, 4002 only. Port 3000 UNTOUCHED!"
Write-Host "============================================================"

# Clean up any existing listeners on 4000, 4001, 4002 only
Get-NetTCPConnection -LocalPort 4000, 4001, 4002 -ErrorAction SilentlyContinue | ForEach-Object {
    try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
}
Start-Sleep -Seconds 1

# Launch servers
Write-Host "[1/3] Starting Laravel API on :4001..."
$procLaravel = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$root\backend-laravel`" && set PATH=$phpPath;%PATH% && php artisan serve --host=127.0.0.1 --port=4001" -PassThru -WindowStyle Hidden

Write-Host "[2/3] Starting Customer Web App on :4000..."
$procCustomer = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$root\mobile-app`" && node server.js" -PassThru -WindowStyle Hidden

Write-Host "[3/3] Starting Next.js Admin & Finance on :4002..."
$procAdmin = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$root\admin-web`" && npm run dev -- -p 4002" -PassThru -WindowStyle Hidden

# Wait for readiness
$maxAttempts = 35
$attempt = 0
$allReady = $false

while (($attempt -lt $maxAttempts) -and ($allReady -eq $false)) {
    Start-Sleep -Seconds 2
    $attempt++
    Write-Host "Checking health attempt $attempt of $maxAttempts..."

    $h4001 = $false
    $h4000 = $false
    $h4002 = $false

    try {
        $res1 = Invoke-RestMethod -Uri "http://127.0.0.1:4001/api/v1/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($res1.status -eq "ok") { $h4001 = $true }
    } catch {}

    try {
        $res0 = Invoke-WebRequest -Uri "http://127.0.0.1:4000" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($res0.StatusCode -eq 200) { $h4000 = $true }
    } catch {}

    try {
        $res2 = Invoke-WebRequest -Uri "http://127.0.0.1:4002" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($res2.StatusCode -eq 200) { $h4002 = $true }
    } catch {}

    if ($h4001 -and $h4000 -and $h4002) {
        $allReady = $true
        Write-Host "All 3 servers are HEALTHY and responding!"
    }
}

$exitCode = 1
if ($allReady) {
    Write-Host "Running Playwright tests..."
    Set-Location "$root\qa-e2e"
    npx playwright test tests/step12-financial-accounting.spec.ts --reporter=list
    $exitCode = $LASTEXITCODE
} else {
    Write-Host "ERROR: Servers failed to become healthy."
}

Write-Host "Cleaning up test processes..."
if ($procLaravel) { try { Stop-Process -Id $procLaravel.Id -Force -ErrorAction SilentlyContinue } catch {} }
if ($procCustomer) { try { Stop-Process -Id $procCustomer.Id -Force -ErrorAction SilentlyContinue } catch {} }
if ($procAdmin) { try { Stop-Process -Id $procAdmin.Id -Force -ErrorAction SilentlyContinue } catch {} }

Get-NetTCPConnection -LocalPort 4000, 4001, 4002 -ErrorAction SilentlyContinue | ForEach-Object {
    try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
}

Write-Host "Zero lingering processes on 4000, 4001, 4002. Port 3000 untouched."
exit $exitCode
