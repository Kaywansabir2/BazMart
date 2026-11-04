# ==============================================================================
# BazMart — Native Android APK Build Script
# Configured with verified OpenJDK 17 and Flutter Toolchain
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  BazMart Retail — Android APK Compilation Wizard         " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$javaHome = "C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot"
if (Test-Path "$javaHome\bin\java.exe") {
    $env:JAVA_HOME = $javaHome
    $env:Path = "$javaHome\bin;" + $env:Path
    Write-Host "[✓] JAVA_HOME set to: $javaHome" -ForegroundColor Green
} else {
    Write-Host "[!] Warning: Verified JDK 17 path not found. Falling back to system java." -ForegroundColor Yellow
}

$flutterPath = "C:\flutter\bin"
if (Test-Path "$flutterPath\flutter.bat") {
    $env:Path = "$flutterPath;" + $env:Path
}

Set-Location "$PSScriptRoot\mobile-app"
Write-Host "[i] Current Working Directory: $(Get-Location)" -ForegroundColor Gray
Write-Host "[i] Fetching Flutter dependencies..." -ForegroundColor Gray
flutter pub get

Write-Host "[*] Compiling Android Release APK..." -ForegroundColor Cyan
flutter build apk --release

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[✓] SUCCESS: Android APK compiled successfully!" -ForegroundColor Green
    Write-Host "[i] Output directory: mobile-app\build\app\outputs\flutter-apk\" -ForegroundColor Yellow
    Get-ChildItem -Path "build\app\outputs\flutter-apk\*.apk" -ErrorAction SilentlyContinue | Select-Object Name, Length, LastWriteTime
} else {
    Write-Host "`n[!] Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
}

Set-Location $PSScriptRoot

