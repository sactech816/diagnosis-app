import React, { useState, useEffect } from 'react';
import { Play, Edit3, Trash2, ThumbsUp, ExternalLink, Mail, Lock, Loader2, Briefcase, GraduationCap, Sparkles as SparklesIcon, LayoutGrid } from 'lucide-react';
import Header from './Header';
import SEO from './SEO';
import { supabase } from '../lib/supabase';

const Portal = ({ quizzes, isLoading, onPlay, onCreate, user, setShowAuth, onLogout, setPage, onEdit, onDelete, isAdmin }) => {
  useEffect(() => { document.title = "無料AI診断クイズメーカー | 集客・販促・教育・占いに効くクイズ作成ツール"; }, []);
  const [filterMode, setFilterMode] = useState('all'); // all, diagnosis, test, fortune

  const handleLike = async (e, quiz) => {
      e.stopPropagation();
      if(!supabase) return;
      const btn = e.currentTarget;
      const countSpan = btn.querySelector('span');
      if(btn.classList.contains('liked')) return;
      try {
        await supabase.rpc('increment_likes', { row_id: quiz.id });
        const current = parseInt(countSpan.textContent || '0');
        countSpan.textContent = current + 1;
        btn.classList.add('liked', 'text-pink-500');
      } catch(err) { console.error(err); }
  };

  // フィルタリング処理
  const filteredQuizzes = quizzes.filter(q => {
      if (filterMode === 'all') return true;
      // diagnosis(ビジネス), test(教育), fortune(占い)
      return q.mode === filterMode;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <SEO title="無料AI診断メーカー | 集客・教育・占いのクイズ作成" description="ビジネス診断、学習テスト、占いコンテンツをAIが自動生成。登録不要、無料で今すぐ作成できます。" />
      <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-800 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 relative z-10 leading-tight">
            あらゆる<span className="text-yellow-300">「診断・検定・占い」</span>を<br/>AIで一瞬にして作成
        </h1>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto relative z-10">
            集客・教育・エンタメ。目的を選んで、あとはAIにおまかせ。<br/>
            LINE連携やSNSシェアに最適なコンテンツが無料で手に入ります。
        </p>
        <button onClick={onCreate} className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold shadow-xl hover:bg-gray-100 hover:scale-105 transition-all flex items-center gap-2 mx-auto relative z-10">
            <Edit3 size={20} /> 無料で作成する
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 border-b border-gray-200 pb-4">
              <button onClick={()=>setFilterMode('all')} className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-colors ${filterMode==='all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                  <LayoutGrid size={16}/> すべて
              </button>
              <button onClick={()=>setFilterMode('diagnosis')} className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-colors ${filterMode==='diagnosis' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                  <Briefcase size={16}/> ビジネス診断
              </button>
              <button onClick={()=>setFilterMode('test')} className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-colors ${filterMode==='test' ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                  <GraduationCap size={16}/> 学習・検定
              </button>
              <button onClick={()=>setFilterMode('fortune')} className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-colors ${filterMode==='fortune' ? 'bg-purple-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                  <SparklesIcon size={16}/> 占い
              </button>
          </div>
      </div>

      {/* List */}
      <div id="quiz-list" className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
            <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-indigo-600" size={40}/></div>
        ) : (
         <div className="grid md:grid-cols-3 gap-8">
            {filteredQuizzes.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-gray-400">まだコンテンツがありません。</div>
            ) : (
                filteredQuizzes.map((quiz) => (
                <div key={quiz.id} onClick={()=>onPlay(quiz)} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col h-full group overflow-hidden border border-gray-100 relative">
                    {/* Admin Menu */}
                    {isAdmin && (
                        <div className="absolute top-2 right-2 z-20 flex gap-1">
                            <button onClick={(e)=>{e.stopPropagation(); onEdit(quiz);}} className="bg-white/90 p-2 rounded-full shadow hover:text-blue-600"><Edit3 size={16}/></button>
                            <button onClick={(e)=>{e.stopPropagation(); onDelete(quiz.id);}} className="bg-white/90 p-2 rounded-full shadow hover:text-red-600"><Trash2 size={16}/></button>
                        </div>
                    )}
                    {/* Thumbnail */}
                    <div className={`h-40 w-full overflow-hidden relative ${quiz.color || 'bg-indigo-600'}`}>
                        {quiz.image_url && <img src={quiz.image_url} alt={quiz.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>}
                        <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                            {quiz.mode === 'test' && <GraduationCap size={12}/>}
                            {quiz.mode === 'fortune' && <SparklesIcon size={12}/>}
                            {(!quiz.mode || quiz.mode === 'diagnosis') && <Briefcase size={12}/>}
                            {quiz.category || 'その他'}
                        </span>
                    </div>
                    {/* Content */}
                    <div className="p-6 flex-grow flex flex-col">
                        <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 text-gray-900">{quiz.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-3 flex-grow mb-4">{quiz.description}</p>
                        <div className="flex items-center justify-between border-t pt-4 mt-auto">
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg flex items-center gap-1">
                                <Play size={12}/> スタート
                            </span>
                            <div className="flex gap-3 text-gray-400 text-xs font-bold items-center">
                                <span className="flex items-center gap-1"><Play size={12}/> {quiz.views_count||0}</span>
                                <button onClick={(e)=>handleLike(e, quiz)} className="flex items-center gap-1 hover:text-pink-500 transition-colors group/like">
                                    <ThumbsUp size={14} className="group-hover/like:scale-125 transition-transform"/>
                                    <span>{quiz.likes_count || 0}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                ))
            )}
         </div>
        )}
      </div>
      <footer className="bg-white border-t py-12 text-center text-sm text-gray-400">
          <div className="mb-6 flex justify-center gap-6">
              <button onClick={()=>setPage('faq')} className="hover:text-indigo-600 font-bold">よくある質問</button>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSd8euNVubqlITrCF2_W7VVBjLd2mVxzOIcJ67pNnk3GPLnT_A/viewform" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 font-bold flex items-center gap-1"><Mail size={14}/> お問い合わせ</a>
          </div>
          <p className="mb-4">&copy; 2025 Shindan Quiz Maker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Portal;