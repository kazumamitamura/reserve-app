# Vercel デプロイ

## 通常の流れ

1. **Environment Variables** に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
2. **Root Directory** は **空**のまま（リポジトリルートに `package.json` がある場合）
3. Deploy

## 404 が出る場合

- **Root Directory** を空にして Redeploy
- **Output Directory** の Override がオフか確認
- ビルドログで Failed になっていないか確認
