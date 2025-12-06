// 管理者メールアドレスを環境変数から取得（複数指定可能、カンマ区切り）
export const getAdminEmails = () => {
    if (typeof window === 'undefined') {
        // サーバー側
        return process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) || [];
    }
    // クライアント側
    return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
};

// 後方互換性のため（単一メールアドレス用）
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')[0]?.trim() || '';