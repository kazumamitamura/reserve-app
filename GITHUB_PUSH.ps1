# reserve-app を GitHub にプッシュするスクリプト
# PowerShell で実行: .\GITHUB_PUSH.ps1

Write-Host "=== reserve-app / GitHub プッシュ ===" -ForegroundColor Cyan

if (-not (Test-Path "package.json")) {
    Write-Host "reserve-app のルートで実行してください。" -ForegroundColor Red
    exit 1
}

Write-Host "`n1. 状態確認..." -ForegroundColor Green
git status

Write-Host "`n2. ステージング..." -ForegroundColor Green
git add .

$msg = Read-Host "`n3. コミットメッセージ（空欄なら 'Update reserve-app'）"
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "Update reserve-app" }

git commit -m $msg

Write-Host "`n4. プッシュ..." -ForegroundColor Green
git push -u origin main

Write-Host "`n=== 完了 ===" -ForegroundColor Cyan
