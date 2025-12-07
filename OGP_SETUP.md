# OGP（Open Graph Protocol）設定について

## 実装完了内容

### 1. 基本的なメタデータ設定 ✅
`app/layout.tsx`に以下のメタデータを設定しました：

- **サイト名**: 診断クイズメーカー
- **説明**: AIが自動で診断・検定・占いを作成。集客や教育に使えるクイズ作成ツール。
- **OG画像**: `/og-image.png`（要作成）
- **言語**: 日本語（ja）

### 2. OGPタグの設定 ✅
以下のOGPタグを設定しました：

- `og:title` - サイト名
- `og:description` - サイト説明
- `og:image` - OG画像（1200x630px推奨）
- `og:url` - サイトURL
- `og:type` - website
- `og:locale` - ja_JP
- `twitter:card` - summary_large_image

## 必要な作業

### 1. OG画像の作成
`public/og-image.png` を作成してください。

**推奨サイズ**: 1200 x 630 ピクセル
**内容**: 
- サイト名「診断クイズメーカー」
- キャッチフレーズ「AIが自動で診断・検定・占いを作成」
- ブランドカラー（インディゴ・パープル系）を使用

### 2. 環境変数の設定（オプション）
`.env.local` に以下を設定できます：

```env
NEXT_PUBLIC_SITE_URL=https://shindan-quiz.makers.tokyo
```

設定しない場合は、デフォルト値（`https://shindan-quiz.makers.tokyo`）が使用されます。

## クイズ個別ページの動的OGP対応について

現在のアプリはクライアントサイドで動作しているため、クイズ個別ページ（`?id=xxx`）の動的OGP対応には**サーバーサイドレンダリング**が必要です。

LINEやSNSのクローラーは、サーバーサイドでレンダリングされたHTMLのメタタグのみを読み取ります。クライアントサイドで動的に設定されたメタタグは認識されません。

### 対応方法の選択肢

#### 案1: Next.jsの動的ルートを使用（推奨）
クイズ個別ページを `/quiz/[id]` のような動的ルートに変更し、サーバーサイドでメタデータを生成する。

#### 案2: メタタグ生成API + プレビューサービス
外部サービス（例：iframely、Link Preview API）を使用する。

#### 案3: 現状維持
トップページのみOGP対応し、クイズ個別ページは後日対応する。

## 動作確認方法

### 1. メタタグの確認
開発者ツールで`<head>`内のメタタグを確認：
```html
<meta property="og:title" content="診断クイズメーカー">
<meta property="og:description" content="...">
```

### 2. OGPプレビューツールで確認
以下のツールでURLを入力してプレビューを確認：
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LINE OGP確認ツール](https://developers.line.biz/ja/tools/ogp/)

### 3. 実際にLINE/SNSでシェア
実際のURLをLINEやSNSでシェアして、プレビューが正しく表示されるか確認。

## 注意事項

- OG画像は**絶対URL**で指定する必要があります（`https://...`で始まる）
- 画像サイズは1200x630pxが推奨されます
- 画像ファイルサイズは1MB以下を推奨
- 変更後、SNSのキャッシュをクリアする必要がある場合があります

## 次のステップ

1. OG画像を作成して `public/og-image.png` に配置
2. サイトをデプロイ
3. OGPプレビューツールで確認
4. クイズ個別ページの動的OGP対応を検討（必要に応じて）