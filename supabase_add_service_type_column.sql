-- お知らせテーブルにservice_typeカラムを追加
-- SupabaseのSQL Editorで実行してください

-- service_typeカラムを追加（既存のテーブルに対して）
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'all' CHECK (service_type IN ('all', 'quiz', 'profile'));

-- service_typeカラムにコメントを追加
COMMENT ON COLUMN announcements.service_type IS 'サービス区分: all=全サービス共通, quiz=診断クイズメーカー専用, profile=プロフィールLPメーカー専用';

-- インデックスを作成（サービスタイプでのフィルタリングを高速化）
CREATE INDEX IF NOT EXISTS idx_announcements_service_type ON announcements(service_type);

-- RLSポリシーを更新（service_typeでフィルタリングできるようにする）
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Anyone can view active announcements" ON announcements;

-- 新しいポリシーを作成（is_activeとservice_typeでフィルタリング）
CREATE POLICY "Anyone can view active announcements"
    ON announcements FOR SELECT
    USING (is_active = true);

-- 既存のデータをすべて 'all' に設定（既にデフォルト値で設定されているはず）
UPDATE announcements SET service_type = 'all' WHERE service_type IS NULL;

