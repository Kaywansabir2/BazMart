@echo off
setlocal
echo ==========================================================
echo   BazMart Retail — Android APK Compilation Launcher
echo ==========================================================

set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot"
set "PATH=%JAVA_HOME%\bin;C:\flutter\bin;%PATH%"

cd /d "%~dp0mobile-app"
echo [i] Running flutter pub get...
call flutter pub get
echo [*] Building Android Release APK...
call flutter build apk --release
if %ERRORLEVEL% equ 0 (
    echo.
    echo [OK] Android APK compiled successfully!
    echo Output: mobile-app\build\app\outputs\flutter-apk\
) else (
    echo.
    echo [ERROR] Flutter build apk failed with error %ERRORLEVEL%
)
cd /d "%~dp0"
pause

