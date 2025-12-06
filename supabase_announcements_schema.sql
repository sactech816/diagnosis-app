-- お知らせテーブルの作成
-- SupabaseのSQL Editorで実行してください

CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link_url TEXT, -- オプション: リンク先URL
    link_text TEXT, -- オプション: リンクテキスト（例: "詳細はこちら"）
    is_active BOOLEAN DEFAULT true, -- 表示/非表示の切り替え
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスの作成（最新のお知らせ取得を高速化）
CREATE INDEX IF NOT EXISTS idx_announcements_active_created ON announcements(is_active, created_at DESC);

-- RLS (Row Level Security) の設定
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがお知らせを閲覧可能（is_active=trueのもののみ）
CREATE POLICY "Anyone can view active announcements"
    ON announcements FOR SELECT
    USING (is_active = true);

-- 管理者のみが作成・更新・削除可能
-- 注意: 管理者のemailは lib/constants.js の ADMIN_EMAIL と一致させる必要があります
-- この例では 'info@kei-sho.co.jp' を想定していますが、実際のメールアドレスに変更してください

-- 管理者の判定はアプリケーション側で行うため、ここでは認証済みユーザー全員に権限を付与
-- 実際の管理者チェックはアプリケーション側（Dashboardコンポーネント）で実装します
CREATE POLICY "Authenticated users can manage announcements"
    ON announcements FOR ALL
    USING (auth.role() = 'authenticated');

-- updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

