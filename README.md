# 診断クイズメーカー

AIが自動で診断・検定・占いを作成。集客や教育に使えるクイズ作成ツール。

## 環境変数の設定

### 必要な環境変数

プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、以下の環境変数を設定してください。

#### 管理者メールアドレス

管理者のメールアドレスを設定します。複数の管理者を設定する場合は、カンマ区切りで指定できます。

```env
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

**設定方法**:
1. プロジェクトのルートディレクトリに `.env.local` ファイルを作成（既に存在する場合は編集）
2. 上記の形式で管理者メールアドレスを設定
3. 開発サーバーを再起動

**設定場所**:
- 環境変数は `lib/constants.js` の `getAdminEmails()` 関数で読み込まれます
- このメールアドレスでログインしたユーザーは、すべての診断クイズを編集・削除できるようになります
- お知らせの作成・編集・削除も管理者のみ可能です

**Vercelでの設定**:
1. Vercelのダッシュボードでプロジェクトを開く
2. Settings → Environment Variables を開く
3. `NEXT_PUBLIC_ADMIN_EMAILS` を追加
4. 値を設定（例: `admin@example.com,admin2@example.com`）
5. 環境（Production, Preview, Development）を選択
6. Save をクリック
7. 再デプロイを実行

#### その他の環境変数（必要に応じて）

```env
# サイトURL（OGP用）
NEXT_PUBLIC_SITE_URL=https://shindan-quiz.makers.tokyo

# Supabase設定（既に設定済みの場合はそのまま）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe設定（決済機能を使用する場合）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# OpenAI設定（AI生成機能を使用する場合）
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.