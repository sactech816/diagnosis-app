"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * パスワードリセット確認ページの内部コンポーネント
 * useSearchParams()を使用するため、Suspenseでラップする必要がある
 */
function AuthConfirmContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const redirectTo = searchParams.get('redirect_to');

        console.log('🔐 /auth/confirm: パラメータ確認', {
            tokenHash: tokenHash ? '***' : null,
            type,
            redirectTo
        });

        // token_hashとtypeが存在する場合、ルートページにリダイレクト
        // ルートページでパスワードリセット処理を行う
        if (tokenHash && type === 'recovery') {
            console.log('✅ /auth/confirm: ルートページにリダイレクトします');
            
            // クエリパラメータを保持したままルートページにリダイレクト
            const params = new URLSearchParams();
            params.set('token_hash', tokenHash);
            params.set('type', type);
            if (redirectTo) {
                params.set('redirect_to', redirectTo);
            }
            
            // ルートページにリダイレクト
            router.replace(`/?${params.toString()}`);
        } else {
            console.error('❌ /auth/confirm: 必要なパラメータが不足しています');
            // パラメータが不足している場合は、エラーメッセージを表示してルートページにリダイレクト
            alert('パスワードリセットリンクが無効です。\n\n新しいパスワードリセットメールをリクエストしてください。');
            router.replace('/');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-indigo-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-bold">パスワードリセット処理中...</p>
            <p className="text-sm text-gray-600 mt-2">少々お待ちください</p>
        </div>
    );
}

/**
 * パスワードリセット確認ページ
 * 
 * Supabaseからのパスワードリセットリンク（PKCE形式）を処理します。
 * URL形式: /auth/confirm?token_hash=...&type=recovery&redirect_to=...
 */
export default function AuthConfirmPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-indigo-600">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="font-bold">読み込み中...</p>
            </div>
        }>
            <AuthConfirmContent />
        </Suspense>
    );
}

