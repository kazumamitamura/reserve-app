# Reserve-One

個人事業主向けの予約管理システム。管理者が予約枠を作成し、顧客が予約します。

## クイックスタート

**[SETUP.md](./SETUP.md)** に、GitHub → Supabase → Vercel の5ステップをまとめています。初回はこちらを参照してください。

## 開発

```bash
npm install
npm run dev
```

`.env.local` に Supabase の URL と anon key を設定してください（`.env.local.example` をコピーして編集）。

## 主な機能

- **トップ (/):** ログイン/新規登録
- **管理画面 (/admin):** 枠の作成、予約一覧
- **顧客ダッシュボード (/dashboard):** 予約・キャンセル

## 更新時に GitHub へ push

```bash
git add .
git commit -m "更新内容"
git push
```
