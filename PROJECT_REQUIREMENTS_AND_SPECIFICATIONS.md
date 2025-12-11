# 診断クイズメーカー - 要件定義書・仕様書

**作成日**: 2025年12月10日  
**バージョン**: 1.0  
**プロジェクト名**: 診断クイズメーカー  
**URL**: https://shindan-quiz.makers.tokyo

---

## 📋 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [システム構成](#2-システム構成)
3. [機能要件](#3-機能要件)
4. [技術仕様](#4-技術仕様)
5. [データベース設計](#5-データベース設計)
6. [認証・権限管理](#6-認証権限管理)
7. [決済システム](#7-決済システム)
8. [UI/UX仕様](#8-uiux仕様)
9. [セキュリティ仕様](#9-セキュリティ仕様)
10. [運用・保守](#10-運用保守)

---

## 1. プロジェクト概要

### 1.1 プロダクト概要

**診断クイズメーカー**は、AIを活用してビジネス診断・学習テスト・占いなどの診断コンテンツを簡単に作成・公開できるWebアプリケーションです。

### 1.2 ターゲットユーザー

- **マーケター**: リード獲得のための診断コンテンツを作成
- **教育関係者**: 学習効果を高めるためのテストやクイズを作成
- **コンテンツクリエイター**: エンゲージメント向上のための診断コンテンツを作成
- **個人事業主・起業家**: 自己ブランディングやサービス訴求のための診断を作成

### 1.3 主要価値提案

- **AIによる自動生成**: テーマを入力するだけで、質問・選択肢・結果を自動生成
- **豊富なテンプレート**: ビジネス診断、学習テスト、占いなど複数のテンプレートを用意
- **簡単な公開**: URLを発行するだけで即座に公開可能
- **リード獲得機能**: メールアドレス収集機能でビジネス活用をサポート
- **HTMLダウンロード**: 自サーバーへのアップロードや埋め込みが可能
- **アクセス解析**: 閲覧数、完了率、CTRなどの指標を可視化

### 1.4 ビジネスモデル

- **基本機能**: 無料（診断の作成・公開・URLシェア）
- **Pro機能**: 寄付・応援制（500円〜50,000円）
  - HTMLダウンロード
  - 埋め込みコード
  - メールリスト取得（CSV）
  - 優先サポート

---

## 2. システム構成

### 2.1 技術スタック

#### フロントエンド
- **Framework**: Next.js 16.0.7（App Router）
- **Language**: React 19.2.1, TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Lucide React（アイコン）
- **Charts**: Recharts 3.5.1（アクセス解析グラフ）
- **Animation**: canvas-confetti 1.9.4（結果表示演出）

#### バックエンド
- **API**: Next.js API Routes（Serverless Functions）
- **Database**: Supabase（PostgreSQL）
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage（画像アップロード）

#### 外部サービス
- **AI**: OpenAI GPT-3.5-turbo（クイズ自動生成）
- **Payment**: Stripe Checkout（決済処理）
- **FTP**: basic-ftp 5.0.5（HTMLファイル自動転送）
- **Analytics**: Google Analytics（GA4）

#### デプロイ・ホスティング
- **Platform**: Vercel
- **Domain**: shindan-quiz.makers.tokyo
- **SSL**: 自動（Vercel提供）

### 2.2 システムアーキテクチャ

```
[クライアント（ブラウザ）]
        ↓
[Next.js App (Vercel)]
        ↓
    ┌───┴────┐
    ↓        ↓
[Supabase] [Stripe]
    ↓        ↓
[PostgreSQL] [決済処理]
```

### 2.3 主要フォルダ構成

```
my-diagnosis-app/
├── app/                      # Next.js App Router
│   ├── api/                  # APIエンドポイント
│   │   ├── checkout/         # 決済開始
│   │   ├── verify/           # 決済検証
│   │   └── upload-html/      # FTPアップロード
│   ├── page.jsx              # メインアプリケーション
│   ├── layout.tsx            # レイアウト
│   └── globals.css           # グローバルスタイル
├── components/               # Reactコンポーネント
│   ├── Portal.jsx            # トップページ
│   ├── Dashboard.jsx         # マイページ
│   ├── Editor.jsx            # クイズ作成・編集
│   ├── QuizPlayer.jsx        # クイズ実行画面
│   ├── AuthModal.jsx         # 認証モーダル
│   ├── Header.jsx            # ヘッダー
│   ├── Footer.jsx            # フッター
│   ├── AnnouncementsPage.jsx # お知らせページ
│   ├── StaticPages.jsx       # 静的ページ群
│   └── SEO.jsx               # SEOコンポーネント
├── lib/                      # ユーティリティ
│   ├── supabase.js           # Supabaseクライアント
│   ├── supabaseClient.js     # Supabaseクライアント（サーバー用）
│   ├── constants.js          # 定数・設定
│   ├── utils.js              # 汎用関数
│   └── htmlGenerator.js      # HTML生成
└── public/                   # 静的ファイル
```

---

## 3. 機能要件

### 3.1 ユーザー管理機能

#### 3.1.1 新規登録・ログイン
- **メールアドレス + パスワード**による認証
- **メール確認**：新規登録時に確認メールを送信（オプション）
- **重複メール対応**：既存メールで新規登録を試みた場合、自動ログインまたはログイン画面への誘導
- **セッション管理**：自動ログイン維持（Supabase Auth）

#### 3.1.2 パスワードリセット
- **リセットメール送信**：登録メールアドレスに送信
- **リセットリンク検証**：トークン方式（ハッシュフラグメント、クエリパラメータ、PKCE形式に対応）
- **新パスワード設定**：6文字以上
- **再送信機能**：60秒のクールダウン付き

#### 3.1.3 ユーザープロフィール
- **表示情報**：メールアドレス、作成クイズ数、総PV数
- **ログアウト**：セッションの破棄

### 3.2 クイズ作成機能（Editor）

#### 3.2.1 作成方法（3種類）
1. **テンプレートから作成**
   - ビジネス診断（起業家タイプ、SNS発信力、副業適性など）
   - 学習テスト（確定申告、英語、AIリテラシーなど）
   - 占い（推し活運勢、オーラカラー、前世占いなど）

2. **AIで自動生成**
   - テーマを入力（例: 「起業家タイプ診断」）
   - OpenAI GPT-3.5-turboで自動生成
   - 質問5つ、選択肢4つ、結果3パターンを自動作成

3. **ゼロから作成**
   - すべて手動で設定

#### 3.2.2 クイズの種類
1. **ビジネス診断**（diagnosis）
   - 性格・タイプ診断
   - スコアによる結果判定（A/B/Cタイプなど）

2. **学習テスト**（test）
   - 正解・不正解があるクイズ
   - 正解数による結果判定（高得点/中得点/低得点）

3. **占い**（fortune）
   - ランダムに結果を表示
   - スコアは無関係

#### 3.2.3 基本設定
- **タイトル**: クイズのタイトル
- **説明文**: クイズの説明
- **カテゴリ**: Business / Education / Fortune
- **デザインテーマ**: スタンダード、サイバーパンク、和風、パステル、モノトーン
- **表示レイアウト**: カード型 / チャット型
- **メイン画像**: URLまたはアップロード（Supabase Storage）
- **リード獲得機能**: メールアドレス収集のON/OFF
- **公開URL再発行**: 編集時にURLを変更するオプション

#### 3.2.4 質問作成
- **質問数**: 1〜10問
- **質問文**: 自由入力
- **選択肢**: 2〜6つ
- **スコア配分**:
  - **診断**: 各結果タイプ（A/B/C）へのポイント
  - **テスト**: 正解の選択肢を1つ指定
  - **占い**: スコア不要（ランダム表示）

#### 3.2.5 結果ページ
- **結果パターン数**: 2〜10パターン
- **各結果の設定**:
  - タイトル
  - 説明文
  - リンク先URL + ボタン文言（オプション）
  - LINE登録URL + ボタン文言（オプション）
  - QRコード画像URL + ボタン文言（オプション）

#### 3.2.6 プレビュー機能
- 作成中のクイズを確認
- 質問・選択肢・結果の表示を確認

#### 3.2.7 保存・公開
- **保存**: Supabaseに保存
- **公開URL発行**: slug（ランダム文字列）を生成
- **HTMLファイル生成**: 静的HTMLを生成し、エックスサーバに自動転送（オプション）
- **保存成功時の寄付モーダル**: 新規作成時のみ、Pro機能の案内を表示

### 3.3 クイズプレイ機能（QuizPlayer）

#### 3.3.1 表示モード
- **カード型**: 質問と選択肢をカード形式で表示
- **チャット型**: LINE風の吹き出し形式で表示

#### 3.3.2 進行フロー
1. **開始画面**: タイトル、説明文、メイン画像、スタートボタン
2. **質問画面**: 質問文、選択肢、プログレスバー
3. **メール収集画面**（オプション）: 結果表示前にメールアドレスを入力
4. **結果画面**: 結果タイトル、説明文、誘導ボタン、シェアボタン、再挑戦ボタン

#### 3.3.3 スコアリング
- **診断**: 各選択肢のスコアを合計し、最も高いタイプを判定
- **テスト**: 正解数をカウントし、得点率で結果を判定
- **占い**: ランダムに結果を選択

#### 3.3.4 結果画面の機能
- **シェアボタン**: Twitter、LINE、リンクコピー
- **誘導ボタン**: 外部リンク、LINE登録、QRコード表示
- **再挑戦ボタン**: 同じクイズをもう一度プレイ
- **紙吹雪アニメーション**: 結果表示時に演出

#### 3.3.5 アクセスログ記録
- **閲覧数（views_count）**: クイズを開いた回数
- **完了数（completions_count）**: 結果まで到達した回数
- **クリック数（clicks_count）**: 誘導ボタンをクリックした回数

### 3.4 マイページ機能（Dashboard）

#### 3.4.1 ユーザー情報
- **ログイン中のメールアドレス**
- **作成数**: 作成したクイズの総数
- **総PV数**: 全クイズの閲覧数の合計
- **管理者バッジ**: 管理者の場合は「ADMIN」バッジを表示

#### 3.4.2 アクセス解析
- **グラフ表示**: 棒グラフで閲覧数・完了数・クリック数を可視化（Recharts）
- **テーブル表示**: クイズごとの詳細データを表形式で表示
  - タイトル
  - 閲覧数
  - 完了数
  - 完了率（完了数 / 閲覧数）
  - クリック数
  - CTR（クリック数 / 完了数）

#### 3.4.3 クイズ管理
- **クイズ一覧**: カード形式で表示
- **各カードの情報**:
  - サムネイル画像
  - タイトル
  - レイアウト（カード/チャット）
  - リード獲得機能の有無
  - 閲覧数・クリック数
  - 公開URL（コピーボタン付き）
- **操作ボタン**:
  - **編集**: クイズ編集画面に遷移
  - **複製**: クイズをコピーして新規作成
  - **削除**: クイズを削除（確認ダイアログあり）
  - **埋め込み**: 埋め込みコードをコピー（Pro機能）
  - **アドレス帳**: メールアドレスをCSVダウンロード（Pro機能、リード獲得ONの場合のみ）
  - **HTMLダウンロード**: HTMLファイルをダウンロード（Pro機能）
  - **機能開放/寄付**: 決済画面に遷移（Pro機能が未開放の場合のみ）

#### 3.4.4 お知らせ管理（管理者のみ）
- **お知らせ一覧**: 全お知らせを表示
- **新規作成**: お知らせを作成
- **編集**: お知らせを編集
- **削除**: お知らせを削除
- **入力項目**:
  - タイトル
  - 内容
  - リンクURL（オプション）
  - リンクテキスト（オプション）
  - 表示日付（オプション、デフォルトは作成日時）
  - 表示/非表示の切り替え

### 3.5 お知らせ機能

#### 3.5.1 お知らせ表示
- **トップページ**: ヘッダー下に最新お知らせを表示
- **お知らせ一覧ページ**: 全お知らせをカード形式で表示
- **フィルタリング**: 表示中（is_active=true）のお知らせのみ表示
- **ソート**: 表示日付の降順（announcement_date、なければcreated_at）

#### 3.5.2 お知らせの構成
- **タイトル**: お知らせのタイトル
- **内容**: お知らせの本文
- **日付**: 表示日付
- **リンク**: 外部リンク（オプション）

### 3.6 静的ページ

#### 3.6.1 ページ一覧
- **使い方・規約**（/howto）: クイズの作成方法、利用規約
- **効果的な活用法**（/effective）: ビジネスでの活用事例
- **クイズのロジック**（/logic）: スコアリングの仕組み
- **お問い合わせ**（/contact）: サポート連絡先
- **利用規約**（/legal）: 利用規約
- **プライバシーポリシー**（/privacy）: プライバシーポリシー

### 3.7 決済機能（Pro機能開放）

#### 3.7.1 決済フロー
1. **「機能開放/寄付」ボタンをクリック**
2. **金額入力**（10円〜100,000円）
3. **Stripe Checkoutに遷移**
4. **カード情報入力**
5. **決済完了**
6. **アプリに戻る**（success_url）
7. **決済検証**（/api/verify）
8. **購入履歴をSupabaseに記録**
9. **Pro機能が開放**

#### 3.7.2 Pro機能
- **HTMLダウンロード**: HTMLファイルをダウンロード
- **埋め込みコード**: iframe埋め込みコードをコピー
- **メールリスト取得**: CSVでダウンロード（リード獲得ONの場合）
- **優先サポート**: 機能改善の優先対応

#### 3.7.3 決済検証
- **Stripeに問い合わせ**: セッションIDで決済ステータスを確認
- **重複防止**: stripe_session_idで既存レコードをチェック
- **購入履歴記録**: purchasesテーブルに挿入
- **エラーハンドリング**: 詳細なログ出力とユーザー通知

---

## 4. 技術仕様

### 4.1 フロントエンド仕様

#### 4.1.1 ルーティング
- **Next.js App Router**を使用
- **クライアントサイドルーティング**: pushState/popstateでSPA的な遷移
- **URLパラメータ**:
  - `?id=xxx`: クイズIDまたはslug
  - `?page=xxx`: レガシー互換のページ指定
  - `?payment=success&session_id=xxx&quiz_id=xxx`: 決済成功時のパラメータ

#### 4.1.2 状態管理
- **React useState**で管理
- **主要State**:
  - `view`: 現在の表示ページ（portal / quiz / editor / dashboard など）
  - `user`: ログイン中のユーザー情報
  - `selectedQuiz`: 表示中のクイズデータ
  - `editingQuiz`: 編集中のクイズデータ
  - `quizzes`: クイズ一覧
  - `showAuth`: 認証モーダルの表示/非表示
  - `showPasswordReset`: パスワードリセットモードのON/OFF

#### 4.1.3 認証状態の監視
- **Supabase Auth**の`onAuthStateChange`でリアルタイム監視
- **イベント**:
  - `SIGNED_IN`: ログイン成功
  - `PASSWORD_RECOVERY`: パスワードリセット
  - `SIGNED_OUT`: ログアウト

#### 4.1.4 スタイリング
- **Tailwind CSS 4**を使用
- **レスポンシブデザイン**: モバイル/タブレット/デスクトップ対応
- **ダークモード**: 未実装（将来対応予定）

### 4.2 バックエンド仕様

#### 4.2.1 APIエンドポイント

##### `/api/checkout` (POST)
**説明**: Stripe決済セッションを作成

**リクエスト**:
```json
{
  "quizId": 123,
  "quizTitle": "起業家タイプ診断",
  "userId": "uuid",
  "email": "user@example.com",
  "price": 1000
}
```

**レスポンス**:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

##### `/api/verify` (POST)
**説明**: Stripe決済を検証し、購入履歴を記録

**リクエスト**:
```json
{
  "sessionId": "cs_test_...",
  "quizId": 123,
  "userId": "uuid"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": { "id": 1, ... }
}
```

##### `/api/upload-html` (POST)
**説明**: HTMLファイルをエックスサーバにFTPアップロード

**リクエスト**:
```json
{
  "htmlContent": "<html>...</html>",
  "filename": "quiz-abc123.html"
}
```

**レスポンス**:
```json
{
  "success": true,
  "url": "https://your-domain.com/quizzes/quiz-abc123.html"
}
```

または

```json
{
  "skipped": true,
  "message": "環境変数が設定されていません"
}
```

#### 4.2.2 Supabaseクライアント
- **クライアント側**: `lib/supabase.js`（匿名キーを使用）
- **サーバー側**: `lib/supabaseClient.js`（サービスロールキーを使用）
- **認証設定**:
  - `autoRefreshToken: true`
  - `persistSession: true`
  - `detectSessionInUrl: true`
  - `flowType: 'pkce'`

### 4.3 環境変数

#### 4.3.1 必須
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 管理者メールアドレス（カンマ区切りで複数指定可）
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

#### 4.3.2 オプション
```env
# OpenAI（AI生成機能を使用する場合）
# ⚠️ セキュリティ重要: サーバーサイド専用（NEXT_PUBLIC_なし）
OPENAI_API_KEY=your-openai-api-key

# Stripe（決済機能を使用する場合）
STRIPE_SECRET_KEY=sk_live_... または sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... または pk_test_...

# エックスサーバ（HTMLファイル自動転送を使用する場合）
XSERVER_FTP_HOST=your-domain.xsrv.jp
XSERVER_FTP_PORT=21
XSERVER_FTP_USERNAME=your_ftp_username
XSERVER_FTP_PASSWORD=your_ftp_password
XSERVER_UPLOAD_PATH=/public_html/quizzes
XSERVER_BASE_URL=https://your-domain.com

# サイトURL（OGP用）
NEXT_PUBLIC_SITE_URL=https://shindan-quiz.makers.tokyo
```

---

## 5. データベース設計

### 5.1 テーブル一覧

#### 5.1.1 `quizzes` テーブル
**説明**: クイズデータを保存

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | BIGSERIAL | NO | - | 主キー |
| user_id | UUID | YES | - | 作成者のユーザーID |
| slug | TEXT | NO | - | 公開URL用のユニークな文字列 |
| title | TEXT | NO | - | クイズのタイトル |
| description | TEXT | YES | - | クイズの説明 |
| category | TEXT | YES | 'Business' | カテゴリ（Business/Education/Fortune） |
| color | TEXT | YES | 'bg-indigo-600' | デザインテーマのカラー |
| image_url | TEXT | YES | - | メイン画像のURL |
| layout | TEXT | YES | 'card' | レイアウト（card/chat） |
| mode | TEXT | YES | 'diagnosis' | クイズの種類（diagnosis/test/fortune） |
| collect_email | BOOLEAN | YES | false | リード獲得機能のON/OFF |
| questions | JSONB | NO | - | 質問データ（JSON配列） |
| results | JSONB | NO | - | 結果データ（JSON配列） |
| views_count | INTEGER | YES | 0 | 閲覧数 |
| completions_count | INTEGER | YES | 0 | 完了数 |
| clicks_count | INTEGER | YES | 0 | クリック数 |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**インデックス**:
- `idx_quizzes_user_id` ON user_id
- `idx_quizzes_slug` ON slug（UNIQUE）
- `idx_quizzes_created_at` ON created_at

**RLS（Row Level Security）**:
- 誰でも閲覧可能（SELECT）
- 認証済みユーザーのみ挿入可能（INSERT）
- 作成者のみ更新・削除可能（UPDATE / DELETE）

#### 5.1.2 `quiz_leads` テーブル
**説明**: クイズで収集したメールアドレスを保存

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | BIGSERIAL | NO | - | 主キー |
| quiz_id | BIGINT | NO | - | クイズID（quizzes.idへの外部キー） |
| email | TEXT | NO | - | 収集したメールアドレス |
| created_at | TIMESTAMP | NO | NOW() | 登録日時 |

**インデックス**:
- `idx_quiz_leads_quiz_id` ON quiz_id
- `idx_quiz_leads_created_at` ON created_at

**RLS**:
- クイズの作成者のみ閲覧可能（SELECT）

#### 5.1.3 `purchases` テーブル
**説明**: Pro機能の購入履歴を保存

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | BIGSERIAL | NO | - | 主キー |
| user_id | UUID | NO | - | 購入者のユーザーID |
| quiz_id | BIGINT | NO | - | 購入対象のクイズID |
| stripe_session_id | TEXT | NO | - | StripeセッションID（UNIQUE） |
| amount | INTEGER | NO | - | 決済金額（円） |
| created_at | TIMESTAMP | NO | NOW() | 購入日時 |

**インデックス**:
- `idx_purchases_user_id` ON user_id
- `idx_purchases_quiz_id` ON quiz_id
- `idx_purchases_stripe_session_id` ON stripe_session_id（UNIQUE）

**RLS**:
- ユーザー自身の購入履歴のみ閲覧可能（SELECT）
- サービスロールのみ挿入可能（INSERT）

#### 5.1.4 `announcements` テーブル
**説明**: お知らせを保存

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | BIGSERIAL | NO | - | 主キー |
| title | TEXT | NO | - | タイトル |
| content | TEXT | NO | - | 内容 |
| link_url | TEXT | YES | - | リンク先URL |
| link_text | TEXT | YES | - | リンクテキスト |
| is_active | BOOLEAN | YES | true | 表示/非表示 |
| announcement_date | DATE | YES | - | 表示日付（NULLの場合はcreated_atを使用） |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**インデックス**:
- `idx_announcements_created_at` ON created_at
- `idx_announcements_is_active` ON is_active

**RLS**:
- 誰でも閲覧可能（SELECT）
- 管理者のみ挿入・更新・削除可能（INSERT / UPDATE / DELETE）

### 5.2 JSONB構造

#### 5.2.1 `questions` フィールド
```json
[
  {
    "text": "質問文",
    "options": [
      {
        "label": "選択肢1",
        "score": {
          "A": 3,
          "B": 0,
          "C": 0
        }
      },
      {
        "label": "選択肢2",
        "score": {
          "A": 0,
          "B": 3,
          "C": 0
        }
      }
    ]
  }
]
```

#### 5.2.2 `results` フィールド
```json
[
  {
    "type": "A",
    "title": "結果Aのタイトル",
    "description": "結果Aの説明",
    "link_url": "https://example.com",
    "link_text": "詳細を見る",
    "line_url": "https://line.me/...",
    "line_text": "LINEで相談する",
    "qr_url": "https://example.com/qr.png",
    "qr_text": "QRコードを表示"
  }
]
```

---

## 6. 認証・権限管理

### 6.1 認証フロー

#### 6.1.1 新規登録
1. メールアドレス + パスワードを入力
2. `supabase.auth.signUp()`を実行
3. 確認メールを送信（Supabaseの設定による）
4. メールのリンクをクリックして認証完了
5. 自動ログイン

#### 6.1.2 ログイン
1. メールアドレス + パスワードを入力
2. `supabase.auth.signInWithPassword()`を実行
3. セッション確立
4. マイページにリダイレクト

#### 6.1.3 パスワードリセット
1. メールアドレスを入力
2. `supabase.auth.resetPasswordForEmail()`を実行
3. リセットメールを受信
4. メールのリンクをクリック
5. トークンを検証（verifyOtp、ハッシュフラグメント、またはPKCE）
6. セッション確立
7. 新しいパスワードを入力
8. `supabase.auth.updateUser({ password })`を実行
9. パスワード変更完了

#### 6.1.4 重複メール対応
- 既存メールで新規登録を試みた場合:
  1. エラーメッセージを検出（`already registered`、ステータス422など）
  2. パスワードが正しいか確認（`signInWithPassword`を試行）
  3. 正しい場合: 自動ログイン
  4. 間違っている場合: ログイン画面に誘導

### 6.2 権限管理

#### 6.2.1 管理者権限
- **判定**: `NEXT_PUBLIC_ADMIN_EMAILS`環境変数に含まれるメールアドレス
- **権限**:
  - すべてのクイズを編集・削除可能
  - お知らせの作成・編集・削除が可能
  - マイページで全クイズを表示（「全診断リスト（管理者）」）
  - Pro機能が無条件で開放

#### 6.2.2 一般ユーザー権限
- **権限**:
  - 自分が作成したクイズのみ編集・削除可能
  - Pro機能は決済後に開放

#### 6.2.3 未ログインユーザー
- **権限**:
  - クイズの閲覧・プレイのみ可能
  - クイズの作成・編集・削除は不可（ログインが必要）

---

## 7. 決済システム

### 7.1 決済フロー詳細

#### 7.1.1 決済開始（`/api/checkout`）
1. クライアントから以下のデータを送信:
   - `quizId`: 購入対象のクイズID
   - `quizTitle`: クイズのタイトル
   - `userId`: ユーザーID
   - `email`: メールアドレス
   - `price`: 金額（10〜100,000円）

2. サーバー側の処理:
   - 金額の妥当性チェック（10円〜100,000円）
   - Stripe Checkout Sessionを作成
   - `success_url`: `/?payment=success&session_id={CHECKOUT_SESSION_ID}&quiz_id={quizId}&redirect=dashboard`
   - `cancel_url`: `/?payment=cancel&redirect=dashboard`
   - メタデータに`userId`と`quizId`を含める

3. クライアントに`session.url`を返す

4. クライアントは`session.url`にリダイレクト

#### 7.1.2 決済実行（Stripe）
1. Stripeのチェックアウト画面でカード情報を入力
2. 決済を実行
3. 成功時は`success_url`にリダイレクト
4. キャンセル時は`cancel_url`にリダイレクト

#### 7.1.3 決済検証（`/api/verify`）
1. クライアントから以下のデータを送信:
   - `sessionId`: StripeセッションID
   - `quizId`: クイズID
   - `userId`: ユーザーID

2. サーバー側の処理:
   - Stripeに問い合わせて決済ステータスを確認（`stripe.checkout.sessions.retrieve`）
   - `payment_status === 'paid'`を確認
   - 重複チェック（`stripe_session_id`で既存レコードを検索）
   - Supabaseの`purchases`テーブルに挿入（サービスロールキーを使用）
   - 挿入成功したレコードを返す

3. クライアント側の処理:
   - URLパラメータをクリア
   - 購入履歴を再取得
   - Pro機能が開放されたことを確認
   - 成功メッセージを表示

### 7.2 決済エラーハンドリング

#### 7.2.1 決済未完了
- Stripeの`payment_status`が`paid`でない場合
- エラーメッセージ: 「決済未完了」
- ユーザーに再試行を促す

#### 7.2.2 重複挿入
- 同じ`stripe_session_id`で既にレコードが存在する場合
- 成功レスポンスを返す（エラーにしない）
- メッセージ: 「Already recorded」

#### 7.2.3 ネットワークエラー
- Stripe APIへの接続エラー
- エラーメッセージ: 「決済の確認に失敗しました」
- ユーザーにページ再読み込みを促す

### 7.3 決済テスト

#### 7.3.1 テストモード
- Stripeテストモードを使用
- テストカード番号: `4242 4242 4242 4242`
- 有効期限: 未来の日付
- CVC: 任意の3桁

#### 7.3.2 本番モード
- Stripeライブキーを使用
- 実際のカードで決済をテスト

---

## 8. UI/UX仕様

### 8.1 デザインコンセプト

- **シンプル**: 直感的で使いやすいUI
- **モダン**: 洗練されたデザイン
- **レスポンシブ**: モバイル・タブレット・デスクトップに対応
- **アクセシビリティ**: 色覚異常にも配慮した配色

### 8.2 カラーパレット

#### 8.2.1 プライマリカラー
- **Indigo**: `#4F46E5`（メインカラー）
- **Purple**: `#9333EA`（アクセント）

#### 8.2.2 セマンティックカラー
- **Success**: `#10B981`（緑）
- **Warning**: `#F59E0B`（オレンジ）
- **Error**: `#EF4444`（赤）
- **Info**: `#3B82F6`（青）

#### 8.2.3 グレースケール
- **Gray-50**: `#F9FAFB`
- **Gray-100**: `#F3F4F6`
- **Gray-200**: `#E5E7EB`
- **Gray-300**: `#D1D5DB`
- **Gray-500**: `#6B7280`
- **Gray-700**: `#374151`
- **Gray-900**: `#111827`

### 8.3 タイポグラフィ

- **フォントファミリー**: システムフォント（-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif）
- **フォントサイズ**:
  - `text-xs`: 12px
  - `text-sm`: 14px
  - `text-base`: 16px
  - `text-lg`: 18px
  - `text-xl`: 20px
  - `text-2xl`: 24px
  - `text-3xl`: 30px

### 8.4 レイアウト

#### 8.4.1 ブレークポイント
- **Mobile**: 〜640px
- **Tablet**: 641px〜1024px
- **Desktop**: 1025px〜

#### 8.4.2 コンテナ幅
- **最大幅**: 1280px（max-w-6xl）
- **パディング**: 16px（px-4）

### 8.5 コンポーネント設計

#### 8.5.1 ボタン
- **Primary**: 背景Indigo、白文字、ホバーで濃くなる
- **Secondary**: 背景Gray-100、グレー文字、ホバーで濃くなる
- **Danger**: 背景Red、白文字、ホバーで濃くなる
- **サイズ**: sm / md / lg

#### 8.5.2 カード
- **基本**: 白背景、境界線、角丸（rounded-xl）、影（shadow-sm）
- **ホバー**: 影を強く（shadow-md）

#### 8.5.3 モーダル
- **オーバーレイ**: 黒50%透明、背景ぼかし
- **コンテンツ**: 白背景、角丸、影
- **閉じるボタン**: 右上に×ボタン

#### 8.5.4 フォーム
- **入力フィールド**: 境界線、角丸、フォーカスでリング表示
- **ラベル**: 太字、グレー文字
- **エラー**: 赤文字、下部に表示

---

## 9. セキュリティ仕様

### 9.1 認証セキュリティ

#### 9.1.1 パスワード要件
- **最小文字数**: 6文字
- **複雑さ**: 特に制限なし（Supabaseのデフォルト）

#### 9.1.2 セッション管理
- **自動リフレッシュ**: 有効（`autoRefreshToken: true`）
- **永続化**: 有効（`persistSession: true`）
- **有効期限**: Supabaseのデフォルト（1時間、リフレッシュトークンは1週間）

#### 9.1.3 CSRF対策
- **Supabase Auth**: CSRFトークンを自動で管理
- **API Routes**: Next.jsのCSRF保護を利用

### 9.2 データベースセキュリティ

#### 9.2.1 RLS（Row Level Security）
- すべてのテーブルでRLSを有効化
- ポリシーで厳密にアクセス制御

#### 9.2.2 サービスロールキーの管理
- **使用箇所**: `/api/verify`のみ（購入履歴の挿入）
- **環境変数**: `SUPABASE_SERVICE_ROLE_KEY`（Vercelで管理）
- **漏洩防止**: クライアント側では使用しない

### 9.3 決済セキュリティ

#### 9.3.1 Stripe Checkout
- **PCI DSS準拠**: Stripeのホストされた決済ページを使用
- **カード情報**: サーバーやクライアントに保存しない

#### 9.3.2 決済検証
- **サーバーサイドで検証**: `/api/verify`でStripe APIに問い合わせ
- **重複防止**: `stripe_session_id`のUNIQUE制約

#### 9.3.3 WebhookとEmailによる二重チェック
- **現状**: Webhookは未実装
- **将来対応**: Stripe Webhookで決済イベントを受け取り、より確実な検証を実施

### 9.4 XSS対策

- **Reactの自動エスケープ**: JSXによる自動エスケープ
- **dangerouslySetInnerHTML**: 使用しない

### 9.5 SQLインジェクション対策

- **Supabaseクライアント**: パラメータ化クエリを使用
- **RLS**: データベースレベルでアクセス制御

---

## 10. 運用・保守

### 10.1 デプロイ

#### 10.1.1 Vercel
- **自動デプロイ**: GitHubのmainブランチにpushすると自動デプロイ
- **プレビュー**: PRごとにプレビューURLを生成
- **環境変数**: Vercelダッシュボードで管理

#### 10.1.2 デプロイ手順
1. コードをコミット
2. GitHubにpush
3. Vercelが自動でビルド・デプロイ
4. デプロイ完了通知

### 10.2 モニタリング

#### 10.2.1 Google Analytics
- **イベントトラッキング**: クイズの閲覧、完了、クリックを記録
- **ユーザー分析**: ユーザー数、セッション数、PVなどを確認

#### 10.2.2 Vercel Analytics
- **パフォーマンス**: ページロード時間、Core Web Vitalsを確認
- **エラー**: ビルドエラー、ランタイムエラーを確認

#### 10.2.3 Supabase Dashboard
- **データベース**: レコード数、クエリパフォーマンスを確認
- **ストレージ**: 画像ファイルの使用量を確認
- **認証**: ユーザー数、ログイン状況を確認

### 10.3 バックアップ

#### 10.3.1 データベース
- **Supabase**: 自動バックアップ（Point-in-Time Recovery）
- **頻度**: 毎日

#### 10.3.2 コード
- **GitHub**: バージョン管理
- **ブランチ戦略**: main（本番）、develop（開発）

### 10.4 エラーハンドリング

#### 10.4.1 クライアント側
- **try-catch**: 非同期処理をtry-catchで囲む
- **アラート**: ユーザーにエラーメッセージを表示
- **コンソールログ**: 詳細なエラー情報を出力

#### 10.4.2 サーバー側
- **try-catch**: API Routeでエラーをキャッチ
- **ステータスコード**: 適切なHTTPステータスコードを返す
- **ログ**: Vercelのログに出力

### 10.5 パフォーマンス最適化

#### 10.5.1 画像最適化
- **Next.js Image**: 未使用（外部URLを直接使用）
- **将来対応**: next/imageを使用して自動最適化

#### 10.5.2 コード分割
- **Next.js**: ページごとに自動でコード分割
- **動的インポート**: 大きなコンポーネントは遅延ロード

#### 10.5.3 キャッシング
- **Vercel**: 静的ファイルは自動でキャッシュ
- **API**: キャッシュは未実装（将来対応）

### 10.6 サポート

#### 10.6.1 お問い合わせ
- **メール**: support@makers.tokyo
- **お問い合わせページ**: /contact

#### 10.6.2 よくある質問
- **FAQページ**: /faq（将来対応）

---

## 付録

### A. 用語集

- **クイズ**: 診断コンテンツ全般（診断、テスト、占い）
- **slug**: 公開URL用のユニークな文字列（例: `abc123xyz`）
- **Pro機能**: HTMLダウンロード、埋め込みコードなどの有料機能
- **リード獲得**: メールアドレス収集機能
- **RLS**: Row Level Security（行レベルセキュリティ）
- **PKCE**: Proof Key for Code Exchange（認証フロー）

### B. 外部サービス一覧

- **Supabase**: データベース、認証、ストレージ
- **Stripe**: 決済処理
- **OpenAI**: AI生成（GPT-3.5-turbo）
- **Vercel**: ホスティング、デプロイ
- **Google Analytics**: アクセス解析
- **エックスサーバ**: HTMLファイルのホスティング（オプション）

### C. 参考リンク

- **Next.js公式**: https://nextjs.org/
- **Supabase公式**: https://supabase.com/
- **Stripe公式**: https://stripe.com/
- **Tailwind CSS公式**: https://tailwindcss.com/

---

**以上**

