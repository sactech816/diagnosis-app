-- ============================================
-- purchases テーブルのスキーマとRLSポリシー
-- ============================================
-- 
-- このファイルは、決済成功後の購入履歴を記録するための
-- purchasesテーブルを作成し、適切なRLSポリシーを設定します。
--
-- 実行方法:
-- 1. Supabaseダッシュボードを開く
-- 2. SQL Editorを開く
-- 3. このファイルの内容をコピー＆ペースト
-- 4. 「Run」をクリック
-- ============================================

-- 1. purchasesテーブルを作成（既に存在する場合はスキップ）
CREATE TABLE IF NOT EXISTS public.purchases (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id BIGINT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    stripe_session_id TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_quiz_id ON public.purchases(quiz_id);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session_id ON public.purchases(stripe_session_id);

-- 3. RLS（Row Level Security）を有効化
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- 4. 既存のポリシーを削除（再実行時のエラー防止）
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Service role can insert purchases" ON public.purchases;

-- 5. ユーザーは自分の購入履歴のみ閲覧可能
CREATE POLICY "Users can view their own purchases"
ON public.purchases
FOR SELECT
USING (auth.uid() = user_id);

-- 6. サービスロール（バックエンドAPI）は購入履歴を挿入可能
-- 注意: この設定により、/api/verify エンドポイントが
-- SUPABASE_SERVICE_ROLE_KEY を使用してデータを挿入できます
CREATE POLICY "Service role can insert purchases"
ON public.purchases
FOR INSERT
WITH CHECK (true);

-- 7. 確認用クエリ（オプション）
-- 以下のクエリを実行して、テーブルとポリシーが正しく作成されたか確認できます
-- SELECT * FROM public.purchases LIMIT 10;
-- SELECT * FROM pg_policies WHERE tablename = 'purchases';

-- ============================================
-- 完了！
-- ============================================
-- 
-- 次のステップ:
-- 1. Vercelの環境変数に SUPABASE_SERVICE_ROLE_KEY が設定されているか確認
-- 2. 決済をテストして、purchasesテーブルにデータが挿入されるか確認
-- 3. ダッシュボードで購入履歴が正しく表示されるか確認
-- ============================================




