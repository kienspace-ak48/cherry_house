# Chạy Flutter dev — đọc biến từ dart_defines.dev.json (tương tự .env)
# Bước 1: copy dart_defines.dev.example.json → dart_defines.dev.json và điền GOOGLE_WEB_CLIENT_ID

$definesFile = Join-Path $PSScriptRoot "dart_defines.dev.json"
if (-not (Test-Path $definesFile)) {
  Write-Host "Thieu file dart_defines.dev.json" -ForegroundColor Red
  Write-Host "  copy dart_defines.dev.example.json dart_defines.dev.json"
  Write-Host "  Sua GOOGLE_WEB_CLIENT_ID = GOOGLE_CLIENT_ID trong backend/.env"
  exit 1
}

Set-Location $PSScriptRoot
flutter run --dart-define-from-file=dart_defines.dev.json @args
