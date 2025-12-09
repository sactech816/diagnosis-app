# パスワードリセットエラーの修正

## 問題

パスワードリセットメールのリンクをブラウザに貼り付けると、以下のエラーが発生：

```json
{
  "code": 400,
  "error_code": "validation_failed",
  "msg": "Verify requires a verification type"
}
```

## 原因

Supabaseのパスワードリセットメールには、`verify`エンドポイントへの直接リンクが含まれています：

```
https://[project-id].supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=https://shindan-quiz.makers.tokyo
```

このURLをブラウザに直接貼り付けると、Supabaseの`verify`エンドポイントが呼び出されますが、アプリ側で適切に処理できていませんでした。

## 修正内容

### 1. `verifyOtp`メソッドの実装

クエリパラメータにトークンがある場合、`verifyOtp`メソッドを使用してトークンを検証します。

```javascript
// クエリパラメータにトークンがある場合は、verifyOtpで検証
if (token && type === 'recovery') {
    console.log('🔑 クエリパラメータのトークンを検証します');
    try {
        const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery',
        });
        
        if (error) {
            // エラー処理
            alert('パスワードリセットリンクが無効または期限切れです...');
            return;
        }
        
        if (data?.session?.user) {
            // セッション確立成功、パスワード変更画面を表示
            setUser(data.session.user);
            setShowPasswordReset(true);
            setShowAuth(true);
            return;
        }
    } catch (e) {
        // エラー処理
    }
}
```

### 2. エラーハンドリングの強化

- より詳細なエラーメッセージを表示
- サポートメールアドレス（`support@makers.tokyo`）を案内
- タイムアウト処理を追加（5秒）

### 3. サポートメールアドレスの修正

`components/AuthModal.jsx` のサポートメールアドレスを修正：

```javascript
サポート: support@makers.tokyo
```

## 修正されたファイル

1. ✅ `app/page.jsx` - `verifyOtp`の実装、エラーハンドリング強化
2. ✅ `components/AuthModal.jsx` - サポートメールアドレス修正

## テスト方法

### 手順

1. **パスワードリセットメールを送信**
   - ログイン画面で「パスワードを忘れた方」をクリック
   - メールアドレスを入力して「リセットメールを送信」

2. **メールを確認**
   - メールアプリでパスワードリセットメールを開く
   - 「Reset Password」ボタンを**右クリック**
   - 「リンクをコピー」を選択

3. **開発中のブラウザでリンクを開く**
   - 開発中のブラウザ（localhost:3000が開いているブラウザ）に戻る
   - アドレスバーにリンクを**貼り付け**
   - Enterキーを押す

4. **ブラウザのコンソール（F12）を開いて確認**

### 期待される動作

#### コンソールログ

```
🔍 初期化: URL詳細チェック
  fullUrl: "http://localhost:3000/?token=...&type=recovery&redirect_to=..."
  pathname: "/"
  search: "?token=...&type=recovery&redirect_to=..."
  hash: ""
  token: "***"
  type: "recovery"
  redirectTo: "https://shindan-quiz.makers.tokyo"
  isRecovery: true

🔐 パスワードリセットモードを検出しました
🔐 パスワードリセットリンクを検出しました: { ... }
🔑 クエリパラメータのトークンを検証します
📊 verifyOtp結果: { hasSession: true, hasUser: true, error: null }
✅ トークン検証成功、パスワード変更画面を表示
```

#### 画面の動作

1. トップページが表示される
2. **パスワード変更画面（モーダル）が自動的に表示される**
3. 「新しいパスワードを設定」というタイトルが表示される
4. 新しいパスワードを入力できる

### エラー時の動作

#### ケース1: トークンが無効または期限切れ

```
❌ トークン検証エラー: { message: "Token has expired or is invalid" }
```

アラート表示:
```
パスワードリセットリンクが無効または期限切れです。

エラー: Token has expired or is invalid

新しいパスワードリセットメールをリクエストしてください。
それでも解決しない場合は support@makers.tokyo にお問い合わせください
```

#### ケース2: ネットワークエラー

```
❌ verifyOtpエラー: { message: "Network request failed" }
```

アラート表示:
```
パスワードリセット処理中にエラーが発生しました。

エラー: Network request failed

新しいパスワードリセットメールをリクエストしてください。
それでも解決しない場合は support@makers.tokyo にお問い合わせください
```

## トラブルシューティング

### 問題1: まだ同じエラーが発生する

**確認項目:**

1. **コードが最新か確認**
   - ブラウザをリロード（Ctrl + F5 でハードリロード）
   - 開発サーバーを再起動

2. **コンソールログを確認**
   - 「🔑 クエリパラメータのトークンを検証します」と表示されているか？
   - `verifyOtp結果` が表示されているか？

3. **トークンの有効期限**
   - パスワードリセットトークンは通常1時間で期限切れ
   - 新しいパスワードリセットメールをリクエスト

### 問題2: パスワード変更画面が表示されない

**確認項目:**

1. **コンソールログを確認**
   ```
   ✅ トークン検証成功、パスワード変更画面を表示
   ```
   このログが表示されているか？

2. **ブラウザの開発者ツールでDOM確認**
   - Elements タブで `<div class="fixed inset-0 bg-black/60">` が存在するか

3. **ブラウザのポップアップブロック**
   - ポップアップブロッカーを無効化

### 問題3: Supabaseのエラーが発生

**エラー例:**
```
Error: Invalid token
Error: Token has expired
```

**解決方法:**

1. **新しいパスワードリセットメールをリクエスト**
2. **Supabaseの設定確認**
   - Supabaseダッシュボード → Settings → Auth
   - Site URL: `https://shindan-quiz.makers.tokyo`
   - Redirect URLs: `https://shindan-quiz.makers.tokyo` が含まれているか

## 本番環境での動作

ローカル環境でテストした後、本番環境でも必ずテストしてください。

### 本番環境でのテスト手順

1. **本番環境にデプロイ**
   ```bash
   git add .
   git commit -m "パスワードリセット機能の修正"
   git push
   ```

2. **本番環境でパスワードリセットをテスト**
   - 実際のメールアドレスでテスト
   - メールのリンクを直接クリック
   - パスワード変更画面が表示されることを確認

3. **Supabaseの設定確認**
   - Site URL が正しいか確認
   - Redirect URLs に本番URLが含まれているか確認

## まとめ

### 修正内容

1. ✅ `verifyOtp`メソッドを実装してトークンを検証
2. ✅ エラーハンドリングを強化（詳細なエラーメッセージ、タイムアウト処理）
3. ✅ サポートメールアドレスを `support@makers.tokyo` に修正
4. ✅ コンソールログを改善（絵文字アイコン付き）

### 期待される効果

- ✅ パスワードリセットメールのリンクを貼り付けてもエラーが発生しない
- ✅ パスワード変更画面が確実に表示される
- ✅ エラー時に適切なメッセージが表示される
- ✅ サポートへの問い合わせ方法が明確

### 重要な注意事項

- **ローカル環境でのテストは限界がある**
  - メールリンクを手動でコピー＆貼り付けが必要
  - 本番環境では通常通りリンクをクリックするだけでOK

- **トークンの有効期限**
  - パスワードリセットトークンは通常1時間で期限切れ
  - 期限切れの場合は新しいパスワードリセットメールをリクエスト

---

**作成日**: 2025年12月9日  
**バージョン**: 1.0

