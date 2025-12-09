# Supabaseパスワードリセット設定ガイド

## 問題の原因

エラー `{"code":400,"error_code":"validation_failed","msg":"Verify requires a verification type"}` が発生するのは、Supabaseのメールテンプレートが古い形式を使用しているためです。

メールのリンクが以下の形式になっている場合、このエラーが発生します：

```
https://PROJECT_REF.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=...
```

## 解決方法

Supabaseのメールテンプレートを更新して、正しいリダイレクト形式を使用する必要があります。

---

## 手順1: Supabaseダッシュボードにログイン

1. https://app.supabase.com にアクセス
2. プロジェクトを選択（`nrypzitmxcvimvriqnss`）

---

## 手順2: メールテンプレートを確認

1. 左サイドバーから **Authentication** を選択
2. **Email Templates** タブを選択
3. **Magic Link** のテンプレートを選択

---

## 手順3: URL Configuration を確認

1. 左サイドバーから **Authentication** → **URL Configuration** を選択
2. 以下の設定を確認：

### Site URL
```
https://shindan-quiz.makers.tokyo
```

### Redirect URLs
以下のURLを追加：
```
https://shindan-quiz.makers.tokyo
https://shindan-quiz.makers.tokyo/**
http://localhost:3000
http://localhost:3000/**
```

---

## 手順4: メールテンプレートの形式を確認

**Change Email** または **Reset Password** テンプレートを確認してください。

### 現在の形式（問題あり）

もし、メールテンプレートが以下のようになっている場合、これが問題です：

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">
  Reset Password
</a>
```

または

```html
<a href="{{ .ConfirmationURL }}">
  Reset Password
</a>
```

### 推奨される形式

Supabase v2では、以下の形式を使用してください：

```html
<a href="{{ .SiteURL }}#access_token={{ .Token }}&type=recovery">
  Reset Password
</a>
```

ただし、**最も推奨される方法**は、Supabaseのデフォルトテンプレートを使用することです。

---

## 手順5: デフォルトテンプレートに戻す

カスタムテンプレートを使用している場合は、デフォルトに戻すことを推奨します：

1. **Email Templates** で **Reset Password** を選択
2. 右上の **Reset to default** ボタンをクリック
3. **Save** をクリック

---

## 手順6: アプリ側の設定を確認

### リダイレクトURLの設定

`components/AuthModal.jsx` の `handlePasswordReset` 関数で、リダイレクトURLを確認：

```javascript
const redirectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}` 
    : undefined;

const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
});
```

これは既に正しく設定されています。

---

## 代替案: PKCE Flow を使用

Supabase v2では、PKCE（Proof Key for Code Exchange）フローを使用することが推奨されています。

### Supabaseクライアントの設定

`lib/supabase.js` と `lib/supabaseClient.js` で、以下の設定を追加：

```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // PKCEフローを有効化
  }
});
```

---

## テスト方法

設定を変更した後、以下の手順でテストしてください：

1. **パスワードリセットメールを送信**
   - 新しいメールアドレスでテスト（以前のリンクはキャッシュされている可能性があるため）

2. **メールを確認**
   - メールが届くまで数分待つ

3. **リンクをコピー**
   - メールの「Reset Password」ボタンを右クリック
   - 「リンクをコピー」を選択
   - テキストエディタに貼り付けて、URLの形式を確認

4. **URLの形式を確認**
   - 正しい形式（ハッシュフラグメント）:
     ```
     https://shindan-quiz.makers.tokyo#access_token=...&type=recovery
     ```
   - 古い形式（verify エンドポイント）:
     ```
     https://PROJECT_REF.supabase.co/auth/v1/verify?token=...&type=recovery
     ```

5. **ブラウザで開く**
   - リンクを開発中のブラウザのアドレスバーに貼り付け
   - Enterキーを押す

6. **コンソールを確認**
   - F12キーでコンソールを開く
   - ログを確認

---

## トラブルシューティング

### 問題1: 依然として古い形式のURLが送信される

**原因:**
- メールテンプレートのキャッシュ
- Supabaseの設定が反映されていない

**解決方法:**
1. Supabaseダッシュボードで設定を再確認
2. 24時間待つ（設定の反映に時間がかかる場合がある）
3. 新しいメールアドレスでテスト

---

### 問題2: リンクをクリックしても何も起こらない

**原因:**
- Site URLが正しく設定されていない
- Redirect URLsに必要なURLが追加されていない

**解決方法:**
1. Site URL を確認: `https://shindan-quiz.makers.tokyo`
2. Redirect URLs に以下を追加:
   - `https://shindan-quiz.makers.tokyo`
   - `https://shindan-quiz.makers.tokyo/**`
   - `http://localhost:3000` （開発環境用）
   - `http://localhost:3000/**` （開発環境用）

---

### 問題3: エラーメッセージが表示される

現在のアプリは、エラーが発生した場合に詳細なメッセージを表示するようになっています：

```
パスワードリセットリンクが無効または期限切れです。

エラー: [エラーメッセージ]

新しいパスワードリセットメールをリクエストしてください。
それでも解決しない場合は support@makers.tokyo にお問い合わせください
```

---

## まとめ

### 必須の設定

1. ✅ **Site URL**: `https://shindan-quiz.makers.tokyo`
2. ✅ **Redirect URLs**: 
   - `https://shindan-quiz.makers.tokyo`
   - `https://shindan-quiz.makers.tokyo/**`
   - `http://localhost:3000` （開発環境用）
   - `http://localhost:3000/**` （開発環境用）
3. ✅ **Email Templates**: デフォルトテンプレートを使用

### アプリ側の設定

- ✅ `detectSessionInUrl: true` （既に設定済み）
- ✅ `redirectTo` パラメータ （既に設定済み）
- ✅ エラーハンドリング （既に実装済み）
- ✅ `verifyOtp` による手動検証 （既に実装済み）

---

## 次のステップ

1. **Supabaseダッシュボードで設定を確認**
2. **新しいパスワードリセットメールを送信**
3. **メールのリンク形式を確認**
4. **正しい形式であれば、リンクをコピーしてブラウザで開く**
5. **コンソールログを確認してデバッグ**

それでも解決しない場合は、以下の情報を support@makers.tokyo にお送りください：
- メールのリンクの完全なURL（トークン部分は隠してOK）
- ブラウザのコンソールログ
- 発生したエラーメッセージ

---

**作成日**: 2025年12月9日  
**バージョン**: 1.0


