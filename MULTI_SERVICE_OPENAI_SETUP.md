# 複数サービスでのOpenAI APIキー管理ガイド

## 📋 概要

診断クイズメーカーとプロフィールLPメーカーの2つのサービスで、OpenAI APIキーを管理する方法を説明します。

---

## 🎯 推奨アプローチ：サービスごとにキーを分ける

### メリット

1. **コスト管理が明確**
   - OpenAI Platformで各サービスの使用量を個別に確認できる
   - 予算管理がしやすい

2. **セキュリティ向上**
   - 片方のキーが漏洩しても、もう片方は安全
   - サービスごとに異なるキーローテーション周期を設定可能

3. **使用量制限の分離**
   - 片方のサービスで大量使用しても、もう片方に影響しない
   - レート制限（Rate Limit）を個別に管理

4. **監視・アラート**
   - サービスごとに異常な使用パターンを検知しやすい

---

## 🔧 実装手順

### ステップ1: OpenAI Platformで2つのキーを発行

1. https://platform.openai.com/api-keys にアクセス

2. **診断クイズメーカー用のキーを作成**
   - 「Create new secret key」をクリック
   - Name: `shindan-quiz-maker-production`
   - キーをコピー

3. **プロフィールLPメーカー用のキーを作成**
   - 「Create new secret key」をクリック
   - Name: `profile-lp-maker-production`
   - キーをコピー

### ステップ2: 環境変数を設定

#### Vercel（本番環境）

1. Vercelダッシュボードにアクセス
2. Settings → Environment Variables
3. 以下の変数を追加：

```
OPENAI_API_KEY_QUIZ=sk-proj-診断クイズ用キー
OPENAI_API_KEY_PROFILE=sk-proj-プロフィール用キー
OPENAI_API_KEY=sk-proj-診断クイズ用キー（後方互換性のため）
```

#### ローカル環境（.env.local）

```env
# 診断クイズメーカー用
OPENAI_API_KEY_QUIZ=sk-proj-診断クイズ用キー

# プロフィールLPメーカー用
OPENAI_API_KEY_PROFILE=sk-proj-プロフィール用キー

# デフォルト（既存コードの後方互換性のため）
OPENAI_API_KEY=sk-proj-診断クイズ用キー
```

### ステップ3: コードを修正

#### 診断クイズメーカー用API（既存）

`app/api/generate-quiz/route.js`:

```javascript
export async function POST(request) {
  // 診断クイズ専用のキーを優先、なければデフォルトを使用
  const apiKey = process.env.OPENAI_API_KEY_QUIZ || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI APIキーが設定されていません' },
      { status: 500 }
    );
  }
  
  // ... 既存のコード
}
```

#### プロフィールLPメーカー用API（新規）

`app/api/generate-profile/route.js`:

```javascript
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { theme, targetAudience } = await request.json();

    // プロフィールLP専用のキーを優先、なければデフォルトを使用
    const apiKey = process.env.OPENAI_API_KEY_PROFILE || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      );
    }

    if (!theme) {
      return NextResponse.json(
        { error: 'テーマが指定されていません' },
        { status: 400 }
      );
    }

    // プロフィールLP用のプロンプト
    const prompt = `テーマ「${theme}」、ターゲット「${targetAudience}」のプロフィールLPを作成して。
    以下の要素を含めてください：
    - キャッチコピー
    - 自己紹介文
    - 強み・特徴（3つ）
    - 提供サービス
    - お客様の声
    - CTA（行動喚起）
    
    出力はJSON形式のみ: {
      catchphrase: string,
      introduction: string,
      strengths: [{title: string, description: string}],
      services: [{title: string, description: string}],
      testimonials: [{name: string, comment: string}],
      cta: {title: string, description: string}
    }`;

    // OpenAI API呼び出し
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'OpenAI APIリクエストが失敗しました', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
    const json = JSON.parse(jsonStr);

    return NextResponse.json({
      success: true,
      data: json
    });

  } catch (error) {
    console.error('プロフィールLP生成エラー:', error);
    return NextResponse.json(
      { error: 'AI生成中にエラーが発生しました', details: error.message },
      { status: 500 }
    );
  }
}
```

---

## 📊 使用量モニタリング

### OpenAI Platformでの確認方法

1. https://platform.openai.com/usage にアクセス

2. **キーごとの使用量を確認**
   - 上部のフィルターで各APIキーを選択
   - 使用量グラフとコストを確認

3. **アラート設定**
   - Settings → Billing → Usage limits
   - 月間使用量の上限を設定（例: $50）
   - 閾値に達したらメール通知

### 推奨モニタリング頻度

- **日次**: 異常な使用量がないか確認
- **週次**: サービスごとのコスト比較
- **月次**: 予算との比較、キーローテーション検討

---

## 🔄 代替案：同じキーを使用する場合

コスト管理やセキュリティよりもシンプルさを優先する場合：

### 環境変数（シンプル版）

```env
# 両サービス共通
OPENAI_API_KEY=sk-proj-共通のキー
```

### コード（変更不要）

既存のコードをそのまま使用できます。

### 使用量の区別方法

OpenAI APIのリクエストに`user`パラメータを追加して区別：

```javascript
// 診断クイズメーカー
body: JSON.stringify({
  model: "gpt-3.5-turbo",
  messages: [...],
  user: "quiz-maker"  // サービス識別子
})

// プロフィールLPメーカー
body: JSON.stringify({
  model: "gpt-3.5-turbo",
  messages: [...],
  user: "profile-maker"  // サービス識別子
})
```

**注意**: OpenAI Platformでは`user`パラメータでの使用量集計は標準機能ではないため、完全な分離は難しいです。

---

## 🛡️ セキュリティベストプラクティス

### 1. キーローテーション

| サービス | ローテーション周期 | 理由 |
|---------|-----------------|------|
| 診断クイズメーカー | 3ヶ月ごと | 高頻度使用のため |
| プロフィールLPメーカー | 6ヶ月ごと | 使用頻度に応じて |

### 2. 使用量制限

各キーに月間使用量の上限を設定：

```
診断クイズメーカー: $30/月
プロフィールLPメーカー: $20/月
合計: $50/月
```

### 3. エラーハンドリング

APIキーが無効になった場合の対応：

```javascript
if (!response.ok) {
  if (response.status === 401) {
    // APIキーが無効
    console.error('OpenAI APIキーが無効です。キーを確認してください。');
    // 管理者に通知（メール、Slack等）
  }
  // ... エラー処理
}
```

---

## 📋 チェックリスト

### 初期設定

- [ ] OpenAI Platformで2つのAPIキーを発行
- [ ] Vercelに環境変数を設定
- [ ] ローカルの.env.localを更新
- [ ] コードを修正（キーの優先順位を設定）
- [ ] 両サービスで動作確認

### 運用

- [ ] 使用量モニタリングを週次で実施
- [ ] 月間コストを予算と比較
- [ ] 3〜6ヶ月ごとにキーローテーション
- [ ] 異常な使用パターンがないか確認

---

## ❓ FAQ

### Q1: 既存のコードを変更せずに、キーだけ分けられますか？

A: はい、可能です。環境変数を以下のように設定すれば、コード変更は不要です：

```env
# プロフィールLPメーカー用のVercelプロジェクト
OPENAI_API_KEY=sk-proj-プロフィール用キー

# 診断クイズメーカー用のVercelプロジェクト
OPENAI_API_KEY=sk-proj-クイズ用キー
```

ただし、この場合は**Vercelプロジェクトを分ける必要があります**。

### Q2: 同じキーを使っていて、片方のサービスで大量使用した場合は？

A: OpenAIのレート制限（Rate Limit）に達すると、**両方のサービスで一時的に使用できなくなります**。これを防ぐには、キーを分けることを推奨します。

### Q3: コスト削減のために、モデルを変更できますか？

A: はい、可能です。`gpt-3.5-turbo`の代わりに以下のモデルも検討できます：

| モデル | コスト | 用途 |
|--------|--------|------|
| gpt-3.5-turbo | 標準 | バランス型 |
| gpt-4o-mini | 低コスト | シンプルな生成 |
| gpt-4 | 高コスト | 高品質な生成 |

---

## 📞 サポート

問題が発生した場合：

1. **OpenAI サポート**: https://help.openai.com/
2. **Vercel サポート**: https://vercel.com/support
3. **プロジェクトのドキュメント**: `OPENAI_SECURITY_FIX.md`

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2025-12-11 | 初版作成 |


