# 決済機能のトラブルシューティングガイド

## 問題: 決済は成功したが、機能が開放されない

### 症状
- Stripe決済は成功している
- しかし、ダッシュボードで「HTMLダウンロード」「埋め込み」「リスト」ボタンがアクティブにならない
- 「機能開放 / 寄付」ボタンが表示されたままになっている

### 原因と解決方法

#### 1. purchasesテーブルが存在しない、またはRLSポリシーが正しく設定されていない

**確認方法:**
1. Supabaseダッシュボードを開く
2. Table Editorで`purchases`テーブルが存在するか確認
3. SQL Editorで以下のクエリを実行:
```sql
SELECT * FROM pg_policies WHERE tablename = 'purchases';
```

**解決方法:**
`supabase_purchases_schema.sql`ファイルの内容をSupabase SQL Editorで実行してください。

#### 2. SUPABASE_SERVICE_ROLE_KEY が設定されていない

**確認方法:**
1. Vercelダッシュボードを開く
2. Settings → Environment Variables を確認
3. `SUPABASE_SERVICE_ROLE_KEY`が設定されているか確認

**解決方法:**
1. Supabaseダッシュボード → Settings → API を開く
2. `service_role`キーをコピー（**注意: このキーは秘密情報です！**）
3. Vercelの環境変数に`SUPABASE_SERVICE_ROLE_KEY`として追加
4. 再デプロイを実行

#### 3. 決済検証APIがエラーを返している

**確認方法:**
1. Vercelダッシュボード → Deployments → 最新のデプロイ → Functions を開く
2. `/api/verify`のログを確認
3. エラーメッセージを確認

**解決方法:**
- エラーログに基づいて対処
- よくあるエラー:
  - `Supabase Insert Error: new row violates row-level security policy` → RLSポリシーの問題
  - `stripe is not defined` → STRIPE_SECRET_KEYが設定されていない
  - `supabaseAdmin is not defined` → SUPABASE_SERVICE_ROLE_KEYが設定されていない

#### 4. ブラウザのコンソールエラーを確認

**確認方法:**
1. ブラウザの開発者ツールを開く（F12）
2. Consoleタブを確認
3. エラーメッセージを確認

**よくあるエラー:**
- `❌ 決済検証失敗:` → `/api/verify`がエラーを返している
- `❌ 購入履歴の取得エラー:` → RLSポリシーの問題
- `Failed to fetch` → ネットワークエラー

#### 5. 購入履歴が正しく記録されているか確認

**確認方法:**
Supabase SQL Editorで以下のクエリを実行:
```sql
SELECT * FROM public.purchases 
WHERE user_id = 'あなたのユーザーID' 
ORDER BY created_at DESC;
```

**解決方法:**
- データが存在しない → `/api/verify`が正しく動作していない
- データが存在する → フロントエンドの取得処理に問題がある

#### 6. キャッシュの問題

**解決方法:**
1. ブラウザのキャッシュをクリア
2. ページを強制リロード（Ctrl+Shift+R または Cmd+Shift+R）
3. シークレットモードで試す

#### 7. 環境変数の反映

**解決方法:**
環境変数を変更した場合は、必ず再デプロイを実行してください:
1. Vercelダッシュボード → Deployments
2. 最新のデプロイの「...」メニュー → Redeploy

## デバッグ手順

### ステップ1: ブラウザコンソールを確認
1. F12で開発者ツールを開く
2. Consoleタブを確認
3. 以下のログが表示されるか確認:
   - `🔍 決済検証開始:`
   - `✅ 決済検証レスポンス:`
   - `📋 購入履歴を更新:`

### ステップ2: Vercelのログを確認
1. Vercelダッシュボード → Deployments
2. 最新のデプロイ → Functions
3. `/api/verify`のログを確認
4. 以下のログが表示されるか確認:
   - `🔍 決済検証リクエスト:`
   - `💳 Stripe決済ステータス:`
   - `✅ 購入履歴を記録:`

### ステップ3: Supabaseのデータを確認
1. Supabaseダッシュボード → Table Editor
2. `purchases`テーブルを開く
3. 最新のレコードが存在するか確認

### ステップ4: RLSポリシーを確認
```sql
-- 自分の購入履歴が取得できるかテスト
SELECT * FROM public.purchases WHERE user_id = auth.uid();

-- ポリシーの一覧を確認
SELECT * FROM pg_policies WHERE tablename = 'purchases';
```

## よくある質問

### Q: 決済は成功したのに、アラートが表示されない
A: ブラウザのポップアップブロッカーが有効になっている可能性があります。一時的に無効にしてください。

### Q: 「機能開放 / 寄付」ボタンをクリックしても何も起こらない
A: ブラウザのコンソールを確認してください。JavaScriptエラーが発生している可能性があります。

### Q: 決済後にページが真っ白になる
A: Next.jsのビルドエラーの可能性があります。Vercelのログを確認してください。

### Q: 他のユーザーの購入履歴が見える
A: **重大なセキュリティ問題です！** RLSポリシーが正しく設定されていません。すぐに`supabase_purchases_schema.sql`を実行してください。

## サポート

問題が解決しない場合は、以下の情報を添えてお問い合わせください:
1. ブラウザのコンソールログ（スクリーンショット）
2. Vercelの`/api/verify`のログ（スクリーンショット）
3. Supabaseの`purchases`テーブルの内容（個人情報は除く）
4. 実行した手順

## チェックリスト

決済機能が正しく動作するために、以下を確認してください:

- [ ] `purchases`テーブルが存在する
- [ ] RLSポリシーが正しく設定されている
- [ ] `SUPABASE_SERVICE_ROLE_KEY`が環境変数に設定されている
- [ ] `STRIPE_SECRET_KEY`が環境変数に設定されている
- [ ] Vercelで再デプロイを実行した
- [ ] ブラウザのキャッシュをクリアした
- [ ] ブラウザのコンソールにエラーがない
- [ ] Vercelのログにエラーがない




