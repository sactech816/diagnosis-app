-- ============================================
-- 購入履歴のデバッグ用SQLクエリ
-- ============================================
-- Supabaseダッシュボードの SQL Editor で実行してください

-- 1. すべての購入履歴を表示
SELECT 
    p.id,
    p.user_id,
    p.quiz_id,
    p.stripe_session_id,
    p.amount,
    p.created_at,
    q.title as quiz_title
FROM purchases p
LEFT JOIN quizzes q ON p.quiz_id = q.id
ORDER BY p.created_at DESC
LIMIT 20;

-- 2. ユーザーごとの購入件数
SELECT 
    user_id,
    COUNT(*) as purchase_count,
    SUM(amount) as total_amount
FROM purchases
GROUP BY user_id
ORDER BY purchase_count DESC;

-- 3. 最近の購入履歴（詳細）
SELECT 
    p.*,
    q.title as quiz_title,
    q.user_id as quiz_owner_id
FROM purchases p
LEFT JOIN quizzes q ON p.quiz_id = q.id
WHERE p.created_at > NOW() - INTERVAL '24 hours'
ORDER BY p.created_at DESC;

-- 4. 特定のユーザーの購入履歴を確認（user_idを置き換えてください）
-- SELECT * FROM purchases WHERE user_id = 'YOUR_USER_ID_HERE';

-- 5. RLSポリシーの確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'purchases';

-- 6. テーブルの権限確認
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'purchases';

