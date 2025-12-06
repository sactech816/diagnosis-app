import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AuthModal = ({ isOpen, onClose, setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isResetMode, setIsResetMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    
    if (!isOpen) return null;
    
    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const { data, error } = isLogin 
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
                  });
            
            if (error) throw error;

            if (isLogin && data.user) { 
                setUser(data.user); onClose(); 
            } else if (!isLogin && data.user) {
                if (!data.session) alert('確認メールを送信しました。メール内のリンクをクリックして認証を完了させてください。');
                else { setUser(data.user); onClose(); }
            }
        } catch (e) { alert(e.message); } finally { setLoading(false); }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!email) {
            alert('メールアドレスを入力してください。');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: typeof window !== 'undefined' ? `${window.location.origin}?reset=true` : undefined,
            });
            if (error) throw error;
            setResetSent(true);
        } catch (e) {
            alert('エラー: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    // パスワードリセットモード
    if (isResetMode) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                    <button onClick={() => { setIsResetMode(false); setResetSent(false); setEmail(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-900">パスワードリセット</h2>
                    {resetSent ? (
                        <div className="text-center space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800 font-bold">
                                    パスワードリセット用のメールを送信しました。<br/>
                                    メール内のリンクをクリックして、新しいパスワードを設定してください。
                                </p>
                            </div>
                            <button 
                                onClick={() => { setIsResetMode(false); setResetSent(false); setEmail(''); }}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                ログイン画面に戻る
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <p className="text-sm text-gray-600 mb-4">
                                登録済みのメールアドレスを入力してください。<br/>
                                パスワードリセット用のリンクを送信します。
                            </p>
                            <input 
                                type="email" 
                                required 
                                value={email} 
                                onChange={e=>setEmail(e.target.value)} 
                                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900" 
                                placeholder="Email" 
                            />
                            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                                {loading ? '送信中...' : 'リセットメールを送信'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setIsResetMode(false); setEmail(''); }} 
                                className="w-full text-center text-sm text-gray-600 font-bold underline"
                            >
                                ログイン画面に戻る
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
                <h2 className="text-xl font-bold mb-6 text-center text-gray-900">{isLogin ? 'ログイン' : '新規登録'}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900" placeholder="Email" />
                    <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900" placeholder="Password" />
                    {isLogin && (
                        <button 
                            type="button"
                            onClick={() => setIsResetMode(true)} 
                            className="w-full text-right text-xs text-indigo-600 font-bold underline"
                        >
                            パスワードを忘れた方
                        </button>
                    )}
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                        {loading ? '処理中...' : (isLogin ? 'ログイン' : '登録する')}
                    </button>
                </form>
                <button onClick={()=>setIsLogin(!isLogin)} className="w-full text-center mt-4 text-sm text-indigo-600 font-bold underline">
                    {isLogin ? 'アカウントをお持ちでない方はこちら' : 'すでにアカウントをお持ちの方はこちら'}
                </button>
            </div>
        </div>
    );
};

export default AuthModal;