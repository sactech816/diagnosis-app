# パスワードリセットの緊急対応ガイド

## 現在のエラー

```json
{"code":400,"error_code":"validation_failed","msg":"Verify requires a verification type"}
```

このエラーは、**Supabaseのメールリンクが直接 `verify` エンドポイントを呼び出している**ために発生しています。

---

## 即座の対処方法（アプリ側）

アプリ側では既に以下の対処を実装済みです：

### 1. クエリパラメータのトークンを自動検証

`app/page.jsx` で、`token` と `type` がクエリパラメータにある場合、`verifyOtp` を使用して検証します。

### 2. エラーメッセージの表示

エラーが発生した場合、ユーザーに分かりやすいメッセージを表示します。

### 3. サポート連絡先の表示

`support@makers.tokyo` が表示されるようになっています。

---

## 根本的な解決方法（Supabase設定）

このエラーを根本的に解決するには、**Supabaseダッシュボードで設定を変更する必要があります**。

### 手順

1. **Supabaseダッシュボードにログイン**
   - https://app.supabase.com
   - プロジェクト: `nrypzitmxcvimvriqnss`

2. **Authentication → URL Configuration**
   - **Site URL**: `https://shindan-quiz.makers.tokyo`
   - **Redirect URLs**: 以下を追加
     ```
     https://shindan-quiz.makers.tokyo
     https://shindan-quiz.makers.tokyo/**
     http://localhost:3000
     http://localhost:3000/**
     ```

3. **Authentication → Email Templates**
   - **Reset Password** テンプレートを選択
   - 右上の **"Reset to default"** ボタンをクリック
   - **Save** をクリック

4. **新しいパスワードリセットメールを送信**
   - 古いメールのリンクは使用しない
   - 新しいメールのリンクをテスト

---

## 暫定的な回避策（ユーザー向け）

Supabaseの設定を変更するまでの間、以下の回避策を使用できます：

### 方法1: 管理者に直接連絡

パスワードをリセットしたいユーザーは、以下に直接連絡してください：

**サポート: support@makers.tokyo**

管理者が手動でパスワードをリセットします。

### 方法2: 新しいアカウントを作成

一時的に新しいメールアドレスで新しいアカウントを作成し、後で統合します。

---

## デバッグ情報

### 正常なパスワードリセットリンクの形式

✅ **正しい形式**（ハッシュフラグメント）:
```
https://shindan-quiz.makers.tokyo#access_token=eyJ...&type=recovery&refresh_token=...
```

❌ **問題のある形式**（verify エンドポイント）:
```
https://nrypzitmxcvimvriqnss.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=...
```

### 問題の原因

Supabaseのメールテンプレートが古い形式 (`{{ .ConfirmationURL }}`) を使用している場合、`verify` エンドポイントを直接呼び出します。

この形式では、アプリ側で処理する前にSupabaseのエンドポイントがエラーを返すため、アプリ側での対処が困難です。

---

## テスト用のコマンド

ブラウザのコンソール（F12）で以下を実行して、現在のSupabaseクライアントの設定を確認できます：

```javascript
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase settings:', supabase.auth.settings);
```

---

## 推奨されるアクション

### 優先度1: Supabaseの設定を変更（必須）

上記の手順に従って、Supabaseダッシュボードで設定を変更してください。

### 優先度2: ユーザーへの案内

パスワードリセット機能が一時的に利用できない場合、以下のメッセージをユーザーに表示：

```
現在、パスワードリセット機能のメンテナンス中です。

パスワードをリセットしたい場合は、以下のサポートまでご連絡ください：
support@makers.tokyo

ご不便をおかけして申し訳ございません。
```

### 優先度3: アプリのエラーメッセージを改善（既に実装済み）

現在のアプリは既に以下を実装しています：
- ✅ 詳細なエラーメッセージ
- ✅ サポート連絡先の表示
- ✅ ユーザーへの明確な案内

---

## まとめ

1. **根本原因**: Supabaseのメールテンプレートが古い形式を使用
2. **即座の対処**: アプリ側で既に実装済み
3. **根本的な解決**: Supabaseダッシュボードで設定変更が必要
4. **暫定的な回避策**: サポートへの直接連絡

Supabaseの設定を変更するまで、ユーザーには直接サポート（support@makers.tokyo）に連絡するよう案内してください。

---

**重要**: この問題は、ローカル環境だけでなく本番環境でも発生します。Supabaseの設定変更が必須です。

**作成日**: 2025年12月9日  
**バージョン**: 1.0


