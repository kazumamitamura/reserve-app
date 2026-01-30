# デプロイ手順

コミットは完了しています。以下の手順で GitHub にプッシュし、Vercel にデプロイしてください。

## 1. GitHub にプッシュ

**ターミナル（PowerShell）** で reserve-app フォルダに移動し、実行:

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\reserve-app"
git push -u origin main
```

### GitHub リポジトリがまだない場合

1. [GitHub](https://github.com/new) で新しいリポジトリを作成（名前例: `reserve-app`）
2. 以下のコマンドでリモートを設定してプッシュ:

```powershell
cd "C:\Users\PC_User\Desktop\アプリ\reserve-app"
git remote add origin https://github.com/あなたのユーザー名/reserve-app.git
git push -u origin main
```

## 2. Vercel にデプロイ

1. [Vercel](https://vercel.com) にログイン
2. 「Add New」→「Project」→ GitHub の `reserve-app` を選択
3. **Root Directory** は空のまま（そのまま）
4. **Environment Variables** に追加:
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase の Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase の anon public key
5. 「Deploy」をクリック

## 3. デプロイ後の確認

- 予約機能は Vercel 上で動作確認してください
- ローカルと違い、本番環境では Supabase と Vercel の接続で動作します
