$phpPath = "C:\Users\zakar\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe"
$env:PATH = "$phpPath;$env:PATH"
Set-Location -Path $PSScriptRoot
& "$phpPath\php.exe" artisan test

