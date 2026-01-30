# middleware の型エラー修正を GitHub にプッシュ
# PowerShell で実行: .\PUSH_FIX.ps1

Set-Location $PSScriptRoot

Write-Host "=== 型エラー修正をプッシュ ===" -ForegroundColor Cyan
git add src/lib/supabase/middleware.ts
git status
git commit -m "fix: middleware cookiesToSet に型を追加"
git push
Write-Host "`n完了。Vercel が自動で再ビルドします。" -ForegroundColor Green
