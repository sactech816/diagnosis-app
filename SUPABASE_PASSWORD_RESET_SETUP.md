# Supabaseパスワードリセット設定ガイド

## 問題の原因

現在、以下の問題が確認されています：

### 問題1: トークンが途中で切れている

メールのリンクが以下のようになっています：

```
https://shindan-quiz.makers.tokyo#access_token=47182913&type=recovery
```

この `47182913` というトークンは**不完全**です。通常、Supabaseのアクセストークンは非常に長い文字列です（例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`）。

### 問題2: メールクライアントによるURL改行

多くのメールクライアント（特にGmail）は、長いURLを自動的に改行してしまい、リンクが途中で切れてしまいます。

### 問題3: メールテンプレートの形式

現在のSupabaseメールテンプレートが、長いトークンをURLハッシュに含める形式になっているため、メールクライアントで切れやすくなっています。

## 解決方法

Supabaseのメールテンプレートを**PKCE形式**に変更し、短いトークンハッシュを使用する形式に変更する必要があります。

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

## 手順4: メールテンプレートを**PKCE形式**に変更

**Reset Password** テンプレートを以下の形式に変更してください。

### ❌ 現在の形式（問題あり）

現在、メールのリンクが以下のようになっていると思われます：

```html
<a href="{{ .SiteURL }}#access_token={{ .Token }}&type=recovery">
  Reset Password
</a>
```

この形式は、**トークンが非常に長く**、メールクライアントで途中で切れてしまいます。

### ✅ 推奨される形式（PKCE形式）

以下の形式を使用してください：

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&redirect_to={{ .RedirectTo }}">
  パスワードをリセット
</a>
```

この形式では、**トークンハッシュ**が短くなり、メールクライアントで切れにくくなります。

### より良い方法: デフォルトテンプレートを使用

Supabaseのデフォルトテンプレートは、PKCE形式を自動的に使用します。カスタムテンプレートを使用している場合は、**デフォルトに戻す**ことを強く推奨します。

---

## 手順5: デフォルトテンプレートに戻す

カスタムテンプレートを使用している場合は、デフォルトに戻すことを推奨します：

1. **Email Templates** で **Reset Password** を選択
2. 右上の **Reset to default** ボタンをクリック
3. **Save** をクリック

---

## 手順6: アプリ側の設定を確認・修正

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

### トークンハッシュの処理を追加

現在のアプリは、ハッシュフラグメント（`#access_token=...`）形式とクエリパラメータ（`?token=...&type=recovery`）形式の両方に対応していますが、**PKCE形式**（`?token_hash=...&type=recovery`）にも対応させる必要があります。

`app/page.jsx` に以下のコードを追加します（既に部分的には対応済み）：

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
   - メールの「パスワードをリセット」ボタンを右クリック
   - 「リンクをコピー」を選択
   - テキストエディタに貼り付けて、URLの形式を確認

4. **URLの形式を確認**
   - ✅ **PKCE形式（推奨）**:
     ```
     https://shindan-quiz.makers.tokyo/auth/confirm?token_hash=abcdef123456&type=recovery&redirect_to=https://shindan-quiz.makers.tokyo
     ```
     `token_hash` が短い文字列（16-32文字程度）になっている
   
   - ⚠️ **古いハッシュフラグメント形式**:
     ```
     https://shindan-quiz.makers.tokyo#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&type=recovery
     ```
     `access_token` が非常に長い文字列（数百文字）になっている
     
   - ❌ **トークンが途中で切れている**:
     ```
     https://shindan-quiz.makers.tokyo#access_token=47182913&type=recovery
     ```
     `access_token` が短すぎる（これは完全なトークンではない）

5. **ブラウザで開く**
   - リンクを開発中のブラウザのアドレスバーに貼り付け
   - Enterキーを押す

6. **コンソールを確認**
   - F12キーでコンソールを開く
   - ログを確認
   - 正常な場合: `✅ トークン検証成功 (PKCE)、パスワード変更画面を表示` と表示される

---

## トラブルシューティング

### 問題1: トークンが途中で切れている（例: `access_token=47182913`）

**原因:**
- メールクライアント（特にGmail）が長いURLを自動的に改行している
- メールテンプレートがハッシュフラグメント形式（`#access_token=...`）を使用している

**解決方法:**
1. **Supabaseのメールテンプレートを確認**
   - `Authentication` → `Email Templates` → `Reset Password`
   - **デフォルトテンプレートに戻す**（右上の「Reset to default」ボタンをクリック）
   
2. **PKCE形式を使用する**
   - メールテンプレートで以下の形式を使用：
     ```html
     <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&redirect_to={{ .RedirectTo }}">
       パスワードをリセット
     </a>
     ```
   - または、デフォルトテンプレートを使用

3. **メールを再送信してテスト**
   - 新しいメールアドレスでテスト
   - リンクを全文コピーして、テキストエディタで確認

---

### 問題2: 依然として古い形式のURLが送信される

**原因:**
- メールテンプレートのキャッシュ
- Supabaseの設定が反映されていない

**解決方法:**
1. Supabaseダッシュボードで設定を再確認
2. 24時間待つ（設定の反映に時間がかかる場合がある）
3. 新しいメールアドレスでテスト

---

### 問題3: リンクをクリックしても何も起こらない

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

### 問題3: リンクをクリックしても何も起こらない

**原因:**
- Site URLが正しく設定されていない
- Redirect URLsに必要なURLが追加されていない

**解決方法:**
1. Site URL を確認: `https://shindan-quiz.makers.tokyo`
2. Redirect URLs に以下を追加:
   - `https://shindan-quiz.makers.tokyo`
   - `https://shindan-quiz.makers.tokyo/**`
   - `https://shindan-quiz.makers.tokyo/auth/confirm` (PKCE形式用)
   - `http://localhost:3000` （開発環境用）
   - `http://localhost:3000/**` （開発環境用）

---

### 問題4: エラーメッセージが表示される

現在のアプリは、エラーが発生した場合に詳細なメッセージを表示するようになっています：

```
パスワードリセットリンクが無効または期限切れです。

エラー: [エラーメッセージ]

新しいパスワードリセットメールをリクエストしてください。
それでも解決しない場合は support@makers.tokyo にお問い合わせください
```

**よくあるエラー:**
- `Token has expired or is invalid`: トークンの期限切れ、またはトークンが不完全
- `Invalid token`: トークンが途中で切れている
- `User not found`: メールアドレスが登録されていない

---

## まとめ

### 必須の設定

1. ✅ **Site URL**: `https://shindan-quiz.makers.tokyo`
2. ✅ **Redirect URLs**: 
   - `https://shindan-quiz.makers.tokyo`
   - `https://shindan-quiz.makers.tokyo/**`
   - `https://shindan-quiz.makers.tokyo/auth/confirm` (PKCE形式用)
   - `http://localhost:3000` （開発環境用）
   - `http://localhost:3000/**` （開発環境用）
3. ✅ **Email Templates**: **デフォルトテンプレートを使用**（PKCE形式）

### アプリ側の設定

- ✅ `detectSessionInUrl: true` （既に設定済み）
- ✅ `flowType: 'pkce'` （✨ 今回追加）
- ✅ `redirectTo` パラメータ （既に設定済み）
- ✅ エラーハンドリング （既に実装済み）
- ✅ `verifyOtp` による手動検証 （既に実装済み）
- ✅ `token_hash` パラメータの処理 （✨ 今回追加）

---

## 次のステップ（重要）

### 1. Supabaseダッシュボードで設定を確認・変更

**必須の手順:**

1. **https://app.supabase.com** にログイン
2. プロジェクトを選択（`nrypzitmxcvimvriqnss`）
3. 左サイドバーから **Authentication** → **Email Templates** を選択
4. **Reset Password** テンプレートを選択
5. **右上の「Reset to default」ボタンをクリック**（これが最も重要）
6. **Save** をクリック

### 2. Redirect URLs を追加

1. 左サイドバーから **Authentication** → **URL Configuration** を選択
2. **Redirect URLs** に以下を追加：
   - `https://shindan-quiz.makers.tokyo`
   - `https://shindan-quiz.makers.tokyo/**`
   - `https://shindan-quiz.makers.tokyo/auth/confirm`
   - `http://localhost:3000` （開発環境用）
   - `http://localhost:3000/**` （開発環境用）
3. **Save** をクリック

### 3. アプリをデプロイ

コードを変更したので、アプリを再デプロイする必要があります：

```bash
git add .
git commit -m "feat: パスワードリセットのPKCE形式に対応、token_hash処理を追加"
git push
```

### 4. 新しいパスワードリセットメールを送信してテスト

- **新しいメールアドレス**でテスト（以前のリンクはキャッシュされている可能性があるため）
- メールのリンクをテキストエディタにコピーして、形式を確認
- **正しい形式**: `https://shindan-quiz.makers.tokyo/auth/confirm?token_hash=...&type=recovery`
- **間違った形式**: `https://shindan-quiz.makers.tokyo#access_token=47182913&type=recovery` （トークンが短すぎる）

### 5. コンソールログを確認してデバッグ

ブラウザでリンクを開いたら、F12キーでコンソールを開き、以下のログを確認：

```
🔍 初期化: URL詳細チェック
🔑 PKCE形式のトークンハッシュを検証します
📊 verifyOtp結果 (PKCE)
✅ トークン検証成功 (PKCE)、パスワード変更画面を表示
```

---

## トラブルシューティング: メールリンクが途中で切れている場合の対処法

メールクライアント（特にGmail）は、長いURLを自動的に改行してしまうことがあります。

### 対処法1: リンクを右クリックしてコピー

1. メールの「パスワードをリセット」ボタンを**右クリック**
2. 「リンクをコピー」を選択
3. ブラウザのアドレスバーに貼り付け

### 対処法2: HTML形式でメールを確認

1. メールをHTML形式で表示
2. リンク全体をコピー

### 対処法3: Supabaseのメールテンプレートをデフォルトに戻す

**これが最も効果的な解決策です。**

Supabaseのデフォルトテンプレートは、PKCE形式を使用しており、トークンが短くなるため、メールクライアントで切れにくくなります。

---

## サポート

それでも解決しない場合は、以下の情報を support@makers.tokyo にお送りください：
- メールのリンクの完全なURL（トークン部分は `***` に置き換えてOK）
- ブラウザのコンソールログ（スクリーンショット）
- 発生したエラーメッセージ

---

**作成日**: 2025年12月9日  
**最終更新日**: 2025年12月9日  
**バージョン**: 2.0 - PKCE形式対応、token_hash処理追加


