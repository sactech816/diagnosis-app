# OpenAI APIキー漏洩対応ガイド

## 📅 作成日: 2025年12月11日

## 🚨 緊急対応手順

### 1. APIキーの即座の無効化（最優先）

OpenAIから漏洩警告を受けた場合、**最優先で以下を実施**してください：

1. **OpenAI Platform にアクセス**
   ```
   https://platform.openai.com/api-keys
   ```

2. **漏洩したキーを削除**
   - 警告メールに記載されているキー名を確認
   - 該当するAPIキーの「Revoke」ボタンをクリック
   - ⚠️ この操作により不正利用を即座に防止

3. **新しいAPIキーを発行**
   - 「Create new secret key」をクリック
   - 名前: `my-diagnosis-app-production-YYYY-MM`（例）
   - 生成されたキーを安全にコピー

---

## 🔧 修正内容（実施済み）

### 問題点
以前のコードでは `NEXT_PUBLIC_OPENAI_API_KEY` を使用していました。
Next.jsの `NEXT_PUBLIC_` プレフィックスは、環境変数を**クライアント側（ブラウザ）に公開**してしまいます。

```javascript
// ❌ 旧コード（セキュリティリスク）
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: { "Authorization": `Bearer ${apiKey}` }
});
```

この場合、ブラウザの開発者ツールでAPIキーが見えてしまいます。

### 修正内容

#### 1. バックエンドAPIルートの作成
新しいファイル: `app/api/generate-quiz/route.js`

```javascript
// ✅ 新コード（セキュア）
// サーバーサイドでのみAPIキーを使用
const apiKey = process.env.OPENAI_API_KEY; // NEXT_PUBLIC_なし
```

#### 2. クライアントコードの修正
ファイル: `components/Editor.jsx`

```javascript
// ✅ 新コード
// 自社のバックエンドAPIを経由
const res = await fetch("/api/generate-quiz", {
    method: "POST",
    body: JSON.stringify({ theme: aiTheme, mode: form.mode })
});
```

---

## 🔐 環境変数の更新手順

### A. Vercel（本番環境）

1. **Vercelダッシュボードにアクセス**
   ```
   https://vercel.com/dashboard
   ```

2. **プロジェクトを選択**
   - `my-diagnosis-app` を選択

3. **環境変数を更新**
   - Settings → Environment Variables
   - **古い変数を削除**: `NEXT_PUBLIC_OPENAI_API_KEY`
   - **新しい変数を追加**:
     - Name: `OPENAI_API_KEY`（NEXT_PUBLIC_なし）
     - Value: 新しく発行したAPIキー
     - Environment: Production, Preview, Development すべて選択
   - 「Save」をクリック

4. **再デプロイ**
   - Deployments タブに移動
   - 最新のデプロイメントの「...」メニュー → 「Redeploy」
   - ⚠️ この操作で新しい環境変数が反映されます

### B. ローカル環境

`.env.local` ファイルを編集：

```env
# ❌ 削除（または変更）
# NEXT_PUBLIC_OPENAI_API_KEY=sk-...

# ✅ 新しい設定
OPENAI_API_KEY=sk-proj-新しいキー
```

**注意**: `.env.local` は `.gitignore` に含まれているため、Gitにコミットされません。

---

## 🧪 動作確認手順

### 1. ローカルでテスト

```bash
# 開発サーバーを起動
npm run dev
```

1. ブラウザで `http://localhost:3000/editor` を開く
2. 「AI生成」ボタンをクリック
3. テーマを入力して生成実行
4. 正常に動作すればOK

### 2. 本番環境でテスト

1. Vercelの再デプロイ完了を確認
2. 本番URL（例: `https://your-app.vercel.app/editor`）にアクセス
3. AI生成機能をテスト

### 3. セキュリティ確認

**ブラウザの開発者ツールで確認**：
1. F12キーで開発者ツールを開く
2. Console タブで以下を実行：
   ```javascript
   console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY)
   ```
3. 結果が `undefined` であればOK（APIキーが見えない）

---

## 📋 チェックリスト

実施完了したらチェックを入れてください：

- [ ] OpenAI Platformで古いAPIキーを削除（Revoke）
- [ ] OpenAI Platformで新しいAPIキーを発行
- [ ] Vercelで `NEXT_PUBLIC_OPENAI_API_KEY` を削除
- [ ] Vercelで `OPENAI_API_KEY` を追加
- [ ] Vercelで再デプロイ実行
- [ ] ローカルの `.env.local` を更新
- [ ] ローカルで動作確認
- [ ] 本番環境で動作確認
- [ ] ブラウザ開発者ツールでAPIキーが見えないことを確認

---

## 🛡️ セキュリティベストプラクティス

### Next.jsの環境変数ルール

| プレフィックス | 公開範囲 | 用途 |
|--------------|---------|------|
| `NEXT_PUBLIC_` | クライアント側に公開 | 公開APIキー（Supabase Anon Key等） |
| なし | サーバーサイドのみ | 秘密鍵、APIキー |

### 安全な環境変数の例

```env
# ✅ クライアント側で使用しても安全（公開されている）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...（公開キー）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...（公開キー）

# ✅ サーバーサイドのみで使用（秘密）
OPENAI_API_KEY=sk-proj-...
STRIPE_SECRET_KEY=sk_live_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...（管理者キー）
```

### APIキー漏洩を防ぐためのチェックポイント

1. **環境変数名を確認**
   - 秘密情報に `NEXT_PUBLIC_` を使わない

2. **コードレビュー**
   - APIキーをハードコードしていないか確認
   - `.env.local` がGitignoreされているか確認

3. **定期的なキーローテーション**
   - 3〜6ヶ月ごとにAPIキーを更新
   - 古いキーは即座に削除

4. **使用量モニタリング**
   - OpenAI Platformで使用量を定期的に確認
   - 異常な使用量があれば即座に調査

---

## 🔍 トラブルシューティング

### エラー: "OpenAI APIキーが設定されていません"

**原因**: 環境変数が正しく設定されていない

**解決方法**:
1. Vercelの環境変数を確認
2. 変数名が `OPENAI_API_KEY`（NEXT_PUBLIC_なし）であることを確認
3. 再デプロイを実行

### エラー: "API request failed"

**原因**: APIキーが無効、または使用量制限

**解決方法**:
1. OpenAI Platformでキーが有効か確認
2. 使用量制限に達していないか確認
3. 請求情報が正しく設定されているか確認

### ローカルで動作するが本番で動作しない

**原因**: Vercelの環境変数が反映されていない

**解決方法**:
1. Vercelで環境変数を再確認
2. 必ず再デプロイを実行
3. デプロイログでエラーがないか確認

---

## 📞 サポート

問題が解決しない場合：

1. **OpenAI サポート**
   - https://help.openai.com/

2. **Vercel サポート**
   - https://vercel.com/support

3. **プロジェクトのIssue**
   - GitHubリポジトリのIssueを作成

---

## 📚 関連ドキュメント

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2025-12-11 | 初版作成、セキュリティ修正実施 |

