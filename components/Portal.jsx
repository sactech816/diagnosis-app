import React, { useState } from 'react';
import { 
    Search, Zap, TrendingUp, MessageCircle, 
    Sparkles, ArrowRight, Play, CheckCircle,
    ChevronLeft, ChevronRight // ★追加: ページ送り用アイコン
} from 'lucide-react';
import Header from './Header'; 

const Portal = ({ quizzes, isLoading, user, setShowAuth, onLogout, onPlay, onCreate, setPage, isAdmin }) => {
    
    const [filter, setFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1); // ★追加: 現在のページ番号
    const ITEMS_PER_PAGE = 9; // ★追加: 1ページに表示する数（9個＝3列×3行）

    // フィルタリング
    const filteredQuizzes = filter === 'All' ? quizzes : quizzes.filter(q => q.category === filter);

    // ★追加: ページネーション計算
    const totalPages = Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE);
    const displayQuizzes = filteredQuizzes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // カテゴリ切り替え時にページをリセットする処理
    const handleFilterChange = (cat) => {
        setFilter(cat);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // ページ上部へスクロール（任意）
        const el = document.getElementById('quiz-list-top');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            {/* ヘッダー */}
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />

            <div className="flex-grow">
                {/* ヒーローセクション */}
                <div className="bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 text-white pt-20 pb-24 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <div className="inline-block bg-indigo-500/30 border border-indigo-400/30 px-4 py-1 rounded-full text-xs font-bold mb-6 animate-fade-in-up">
                            ✨ AIがあなたの診断ビジネスを加速させる
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-lg">
                            診断クイズで、<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-yellow-200">集客をもっと楽しく。</span>
                        </h1>
                        <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                            専門知識は不要。AIがあなたの代わりに高品質な診断・検定・占いを作成。<br/>
                            SNSで拡散し、自然な流れでファンを増やしましょう。
                        </p>
                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            <button onClick={onCreate} className="bg-white text-indigo-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2 transform hover:scale-105">
                                <Sparkles size={20} className="text-yellow-500"/> 今すぐ診断を作る
                            </button>
                            <button onClick={()=>setPage('effective')} className="bg-indigo-700/50 border border-indigo-400/50 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700/80 transition-all flex items-center justify-center gap-2">
                                <TrendingUp size={20}/> 活用事例を見る
                            </button>
                        </div>
                    </div>
                </div>

                {/* クイズ一覧セクション */}
                <div id="quiz-list-top" className="max-w-6xl mx-auto py-16 px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Zap className="text-yellow-500"/> 新着の診断クイズ
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">作成されたばかりのコンテンツをチェックしましょう</p>
                        </div>
                        
                        {/* タブ切り替え */}
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {['All', 'Business', 'Education', 'Fortune'].map(cat => (
                                <button 
                                    key={cat}
                                    onClick={()=>handleFilterChange(cat)}
                                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${filter===cat ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {cat === 'All' ? 'すべて' : cat === 'Business' ? 'ビジネス' : cat === 'Education' ? '学習・検定' : '占い'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid md:grid-cols-3 gap-6 animate-pulse">
                            {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>)}
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* ★修正: displayQuizzes (ページ分割後のデータ) を表示 */}
                                {displayQuizzes.length > 0 ? displayQuizzes.map(quiz => (
                                    <div key={quiz.id} onClick={()=>onPlay(quiz)} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
                                        <div className={`h-40 w-full relative overflow-hidden ${quiz.color || 'bg-indigo-600'}`}>
                                            {quiz.image_url ? (
                                                <img src={quiz.image_url} alt={quiz.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white">
                                                    <Sparkles size={48}/>
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                {quiz.layout === 'chat' ? <MessageCircle size={10}/> : <Zap size={10}/>}
                                                {quiz.layout === 'chat' ? 'CHAT' : 'CARD'}
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="mb-2 flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                                    quiz.mode === 'test' ? 'bg-orange-100 text-orange-600' : 
                                                    quiz.mode === 'fortune' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {quiz.mode === 'test' ? '検定' : quiz.mode === 'fortune' ? '占い' : '診断'}
                                                </span>
                                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <Play size={10}/> {quiz.views_count||0}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                                            <p className="text-gray-500 text-xs line-clamp-3 mb-4 leading-relaxed">{quiz.description}</p>
                                            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-bold text-indigo-600">
                                                <span>診断する</span>
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 font-bold mb-4">まだクイズがありません</p>
                                        <button onClick={onCreate} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-700">一番乗りで作る</button>
                                    </div>
                                )}
                            </div>

                            {/* ★追加: ページネーションボタン */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-6 mt-12">
                                    <button 
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="p-3 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    
                                    <div className="text-sm font-bold text-gray-500">
                                        <span className="text-indigo-600 text-lg">{currentPage}</span> / {totalPages}
                                    </div>

                                    <button 
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-3 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* フッター */}
            <footer className="bg-gray-900 text-gray-400 py-12 mt-12 border-t border-gray-800">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
                    {/* カラム1 */}
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                            <Sparkles className="text-pink-500"/> 診断クイズメーカー
                        </h2>
                        <p className="text-sm leading-relaxed mb-6 opacity-80">
                            集客・教育・エンタメに使える診断コンテンツを、<br/>
                            AIの力で誰でも簡単に作成・公開できるプラットフォーム。<br/>
                            あなたのビジネスを「診断」で加速させます。
                        </p>
                        <button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
                            無料で作成をはじめる
                        </button>
                    </div>

                    {/* カラム2 */}
                    <div>
                        <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2 inline-block">メニュー</h3>
                        <ul className="space-y-3 text-sm">
                            <li><button onClick={()=>setPage('effective')} className="hover:text-white transition-colors flex items-center gap-2">➤ 効果的な活用法</button></li>
                            <li><button onClick={()=>setPage('logic')} className="hover:text-white transition-colors flex items-center gap-2">➤ 売れる診断の作り方</button></li>
                            <li><button onClick={()=>setPage('howto')} className="hover:text-white transition-colors flex items-center gap-2">➤ 使い方・機能一覧</button></li>
                            <li><button onClick={()=>setPage('dashboard')} className="hover:text-white transition-colors flex items-center gap-2">➤ マイページ</button></li>
                        </ul>
                    </div>

                    {/* カラム3 */}
                    <div>
                        <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2 inline-block">サポート・規約</h3>
                        <ul className="space-y-3 text-sm">
                            <li><button onClick={()=>setPage('faq')} className="hover:text-white transition-colors">よくある質問</button></li>
                            <li><button onClick={()=>setPage('contact')} className="hover:text-white transition-colors">お問い合わせ</button></li>
                            <li><button onClick={()=>setPage('legal')} className="hover:text-white transition-colors">特定商取引法に基づく表記</button></li>
                            <li><button onClick={()=>setPage('privacy')} className="hover:text-white transition-colors">プライバシーポリシー</button></li>
                        </ul>
                    </div>
                </div>
                
                <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs opacity-60">
                    &copy; 2025 Shindan Quiz Maker. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Portal;