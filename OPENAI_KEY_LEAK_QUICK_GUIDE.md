# 🚨 OpenAI APIキー漏洩 - 緊急対応クイックガイド

## ⚡ 5分でできる緊急対応

### ステップ1: APIキーを無効化（1分）

1. https://platform.openai.com/api-keys を開く
2. 漏洩したキーを見つけて「Revoke」をクリック
3. 新しいキーを発行して**コピー**

### ステップ2: Vercelの環境変数を更新（2分）

1. https://vercel.com/dashboard を開く
2. プロジェクト選択 → Settings → Environment Variables
3. **削除**: `NEXT_PUBLIC_OPENAI_API_KEY`
4. **追加**: 
   - Name: `OPENAI_API_KEY`
   - Value: 新しいキー（ステップ1でコピーしたもの）
5. **複数サービスを運用している場合**:
   - `OPENAI_API_KEY_QUIZ`（診断クイズメーカー用）
   - `OPENAI_API_KEY_PROFILE`（プロフィールLPメーカー用）
   - 詳細は `MULTI_SERVICE_OPENAI_SETUP.md` を参照
6. Save → Deployments → 最新を「Redeploy」

### ステップ3: ローカル環境を更新（1分）

`.env.local` ファイルを編集：

```env
# この行を削除または変更
# NEXT_PUBLIC_OPENAI_API_KEY=古いキー

# この行を追加
OPENAI_API_KEY=新しいキー
```

### ステップ4: 動作確認（1分）

1. 本番サイトの `/editor` ページを開く
2. AI生成機能をテスト
3. 正常に動作すればOK！

---

## ✅ 完了チェックリスト

- [ ] OpenAIで古いキーを削除
- [ ] OpenAIで新しいキーを発行
- [ ] Vercelで環境変数を更新（NEXT_PUBLIC_なし）
- [ ] Vercelで再デプロイ
- [ ] ローカルの.env.localを更新
- [ ] 本番環境で動作確認

---

## 📖 詳細情報

詳しい説明は `OPENAI_SECURITY_FIX.md` を参照してください。

---

## 🔍 セキュリティ確認

ブラウザのコンソール（F12）で以下を実行：

```javascript
console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY)
```

結果が `undefined` ならOK（APIキーが見えない状態）

---

## ❓ トラブル時

- エラーが出る → Vercelで再デプロイしたか確認
- 動かない → 環境変数名が `OPENAI_API_KEY`（NEXT_PUBLIC_**なし**）か確認

