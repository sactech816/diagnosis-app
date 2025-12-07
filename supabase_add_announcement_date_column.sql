-- 既存のannouncementsテーブルにannouncement_dateカラムを追加
-- SupabaseのSQL Editorで実行してください

-- カラムが存在しない場合のみ追加
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS announcement_date DATE;

-- 確認用クエリ（オプション）
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'announcements' AND column_name = 'announcement_date';
