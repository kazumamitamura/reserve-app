# Reserve-One セットアップ（5ステップ）

通常のフローでそのまま動くように、次の順でセットアップしてください。

---

## 1. GitHub でリポジトリを作成

1. [GitHub](https://github.com/new) で **reserve-app** などのリポジトリを作成
2. 空のリポジトリでOK（README なしで作成可）

---

## 2. コードを GitHub に連携（初回のみ）

**重要:** `reserve-app` フォルダ**だけ**を Git のルートにする必要があります。

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\reserve-app"
# 既存の .git があれば削除（親フォルダの .git を使わない）
if (Test-Path .git) { Remove-Item -Recurse -Force .git }
# 新しくリポジトリを初期化
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/reserve-app.git
git push -u origin main
```

`あなたのユーザー名` は GitHub のユーザー名に置き換えてください。

---

## 3. Supabase で DB を準備

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. **SQL Editor** を開き、`supabase_schema.sql` の内容をコピーして実行
3. **Project Settings → API** から **URL** と **anon key** をメモ

---

## 4. Vercel でデプロイ

1. [Vercel](https://vercel.com) にログイン
2. **Add New → Project** で GitHub の **reserve-app** をインポート
3. **Environment Variables** に次を追加（本番・プレビュー両方）：
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase の URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase の anon key
4. **Root Directory** は **空のまま**（`package.json` がリポジトリルートにある場合）
5. **Deploy** をクリック

---

## 5. ローカル開発用の .env

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\reserve-app"
copy .env.local.example .env.local
# .env.local を開き、NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を本物の値に書き換え
npm install
npm run dev
```

---

## 管理者メールの設定

`supabase_schema.sql` 内の `admin@example.com` を、管理者にしたいメールアドレスに変更してから SQL を実行するか、Supabase の **Table Editor** で `profiles` の `role` を `admin` に手動更新してください。

---

## 404 が出る場合

- Vercel の **Root Directory** を確認：
  - GitHub のルートに `package.json` がある → **空**のまま
  - `package.json` が `Desktop/アプリ/reserve-app` の中にある → Root Directory に `Desktop/アプリ/reserve-app` を指定
- ビルドログで **Failed** になっていないか確認
- 環境変数が設定されているか確認し、**Redeploy** を実行
