"use client";

import React, { useState, useEffect, useRef } from 'react';

// 【必須】npm install @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';

import { 
  Play, Edit3, CreditCard, MessageSquare, CheckCircle, ChevronRight, 
  Trash2, ArrowLeft, Save, RefreshCw, Loader2, Bot, Trophy, 
  Home, ThumbsUp, ExternalLink, MessageCircle, Lock, Share2, Copy,
  Sparkles, X, Crown, Globe, LogIn, LogOut, User, Key
} from 'lucide-react';

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// クライアント作成
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// --- Logic: Result Calculation ---
const calculateResult = (answers, results) => {
  const scores = { A: 0, B: 0, C: 0 };
  Object.values(answers).forEach(option => {
    if (option.score) {
      Object.entries(option.score).forEach(([type, point]) => {
        scores[type] = (scores[type] || 0) + (parseInt(point, 10) || 0);
      });
    }
  });
  let maxType = 'A';
  let maxScore = -1;
  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxType = type;
    }
  });
  return results.find(r => r.type === maxType) || results[0];
};

// --- Components ---

// 1. Auth Modal
const AuthModal = ({ isOpen, onClose, setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    if (!isOpen) return null;

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        
        if (!supabase) {
            setMsg('Supabase設定が見つかりません');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = isLogin 
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password });

            if (error) throw error;

            if (isLogin) {
                if (data.user) {
                    setUser(data.user);
                    onClose();
                }
            } else {
                setMsg('確認メールを送信しました。メール内のリンクをクリックしてください。');
            }
        } catch (error) {
            setMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{isLogin ? 'ログイン' : '新規登録'}</h2>
                
                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">メールアドレス</label>
                        <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" placeholder="your@email.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">パスワード</label>
                        <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" placeholder="6文字以上" minLength={6} />
                    </div>
                    
                    {msg && <p className="text-sm text-red-500 text-center bg-red-50 p-2 rounded">{msg}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        {loading ? <Loader2 className="animate-spin mx-auto"/> : (isLogin ? 'ログイン' : '登録する')}
                    </button>
                </form>
                
                <div className="mt-6 text-center border-t pt-4">
                    <button onClick={() => {setIsLogin(!isLogin); setMsg('');}} className="text-sm text-blue-600 hover:underline font-medium">
                        {isLogin ? 'アカウントをお持ちでない方はこちら' : 'すでにアカウントをお持ちの方はこちら'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. Portal (Top Page)
const Portal = ({ quizzes, isLoading, onPlay, onCreate, user, setShowAuth, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-800 text-white pt-24 pb-32 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white rounded-full blur-3xl"></div>
        </div>

        {/* User Menu */}
        <div className="absolute top-6 right-6 z-20">
            {user ? (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white border border-white/30">
                        <User size={16} />
                    </div>
                    <span className="text-sm font-bold text-white max-w-[120px] truncate">{user.email}</span>
                    <div className="h-4 w-px bg-white/30 mx-1"></div>
                    <button onClick={onLogout} className="text-white/80 hover:text-white transition-colors" title="ログアウト">
                        <LogOut size={18} />
                    </button>
                </div>
            ) : (
                <button onClick={() => setShowAuth(true)} className="flex items-center gap-2 bg-white text-blue-900 px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-50 hover:scale-105 transition-all">
                    <LogIn size={18} /> ログイン
                </button>
            )}
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1 rounded-full text-xs font-bold mb-6 text-blue-100">
            <Sparkles size={12}/> AI診断作成プラットフォーム
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-sm">
            顧客の心を掴む<br/>診断コンテンツを、今すぐ。
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            プログラミング不要。AIがあなたの代わりに診断を作成。<br/>
            LINE登録や商品購入への誘導もスムーズに。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => document.getElementById('quiz-list')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold shadow-xl hover:bg-indigo-50 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <Play size={20} className="fill-current" />
              公開中の診断を見る
            </button>
            <button 
              onClick={onCreate}
              className="bg-blue-600 border border-blue-400 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
            >
              <Edit3 size={20} />
              無料で作成する
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div id="quiz-list" className="max-w-6xl mx-auto px-6 -mt-20 pb-20 relative z-10">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32 bg-white/90 backdrop-blur rounded-3xl shadow-lg border border-white/50">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-gray-900 font-bold">データを読み込んでいます...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-lg border border-gray-100">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4 text-gray-400"><Edit3 size={32}/></div>
            <p className="text-gray-900 font-bold mb-2 text-xl">まだ診断がありません</p>
            <p className="text-gray-600">「無料で作成する」から最初のコンテンツを作りましょう。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden border border-gray-100 group">
                <div className={`h-40 ${quiz.color || 'bg-gray-500'} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {quiz.category || '未分類'}
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white bg-black/30 backdrop-blur px-2 py-1 rounded-full text-xs font-bold">
                    <ThumbsUp size={12} /> {quiz.likes_count || 0}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                  <p className="text-gray-800 text-sm mb-6 flex-grow leading-relaxed line-clamp-3 font-medium">
                    {quiz.description}
                  </p>
                  <button 
                    onClick={() => onPlay(quiz)}
                    className="w-full bg-gray-50 hover:bg-indigo-600 text-gray-900 hover:text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-200 hover:border-indigo-600 group-hover:shadow-md"
                  >
                    <Play size={18} className="group-hover:fill-current"/>
                    診断する
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Quiz Player Components

const ResultView = ({ quiz, result, onRetry, onBack }) => {
  const [likes, setLikes] = useState(quiz.likes_count || 0);
  const [hasLiked, setHasLiked] = useState(false);

  // いいね機能
  const handleLike = async () => {
    if (hasLiked) return;
    setLikes(l => l + 1); // 画面上ですぐに反映
    setHasLiked(true);
    
    // 裏でDB更新
    if (supabase) {
        try {
            await supabase.from('quizzes').update({ likes_count: likes + 1 }).eq('id', quiz.id);
        } catch (error) {
            console.error('Like error:', error);
        }
    }
  };
  
  const settings = quiz.settings || {};

  return (
    <div className="max-w-xl mx-auto w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-fade-in my-8">
        <div className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white p-10 text-center relative">
            <Trophy className="mx-auto mb-4 text-yellow-300 drop-shadow-lg" size={64} />
            <p className="text-indigo-100 font-bold mb-2 tracking-widest text-sm uppercase">Diagnosis Result</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">{result.title}</h2>
        </div>
        <div className="p-8 md:p-10">
            <div className="prose prose-lg text-gray-900 leading-relaxed mb-10 whitespace-pre-wrap font-medium">
                {result.description}
            </div>
            
            {/* Business Links */}
            {settings.lp_url && (
                <div className="mb-6 transform transition-transform hover:scale-[1.02]">
                    <a href={settings.lp_url} target="_blank" rel="noopener noreferrer" className="block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-center font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2">
                        <ExternalLink size={20} /> {settings.lp_text || "詳細を見る"}
                    </a>
                </div>
            )}
            {settings.line_url && (
                <div className="bg-[#06C755]/5 border border-[#06C755]/30 rounded-2xl p-6 text-center mb-8">
                    <p className="text-[#06C755] font-bold text-sm mb-3">{settings.line_text || "公式LINEで限定情報をゲット！"}</p>
                    <a href={settings.line_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#06C755] hover:bg-[#05b54c] text-white font-bold py-3 px-10 rounded-full shadow-md transition-colors"><MessageCircle size={20} /> 友だち追加</a>
                </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${hasLiked ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-900 hover:bg-pink-50 hover:text-pink-500'}`}><ThumbsUp size={18} className={hasLiked ? 'fill-current' : ''} /> <span className="text-sm">{likes}</span></button>
                <div className="flex gap-3">
                    <button onClick={onRetry} className="text-gray-500 hover:text-indigo-600 font-bold text-sm flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-50"><RefreshCw size={16} /> 再診断</button>
                    <button onClick={onBack} className="text-gray-500 hover:text-indigo-600 font-bold text-sm flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-50"><Home size={16} /> TOP</button>
                </div>
            </div>
        </div>
    </div>
  );
};

const QuizCardLayout = ({ quiz, currentStep, onAnswer }) => {
  let questions = quiz.questions;
  if (typeof questions === 'string') { try { questions = JSON.parse(questions); } catch (e) { questions = []; } }
  const question = questions ? questions[currentStep] : null;
  
  return (
    <div className="max-w-md mx-auto w-full">
      <div className="mb-8 px-2">
        <div className="flex justify-between text-xs text-gray-600 mb-2 font-bold tracking-wider">
          <span>QUESTION {currentStep + 1} / {questions.length}</span>
          <span>{Math.round(((currentStep)/questions.length)*100)}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${((currentStep)/questions.length)*100}%` }}></div></div>
      </div>
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative min-h-[400px] flex flex-col justify-center animate-fade-in">
        <h3 className="text-xl font-bold text-gray-900 mb-8 text-center leading-relaxed">{question?.text}</h3>
        <div className="space-y-4">
          {question?.options.map((opt, idx) => (
            <button key={idx} onClick={() => onAnswer(opt)} className="w-full p-5 text-left border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-gray-900 font-bold transition-all duration-200 flex items-center justify-between group shadow-sm">
              <span className="group-hover:text-blue-700 text-lg">{opt.label}</span>
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-500 flex-shrink-0"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const QuizChatLayout = ({ quiz, currentStep, onAnswer }) => {
  // チャットUIの実装
  return <QuizCardLayout quiz={quiz} currentStep={currentStep} onAnswer={onAnswer} />;
};

const QuizPlayer = ({ quiz, onBack }) => {
  const [layout, setLayout] = useState('card'); 
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  
  const questions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;
  const results = typeof quiz.results === 'string' ? JSON.parse(quiz.results) : quiz.results;

  const handleAnswer = (option) => {
    const newAnswers = { ...answers, [currentStep]: option };
    setAnswers(newAnswers);
    if (currentStep + 1 < questions.length) { setCurrentStep(currentStep + 1); } else { setResult(calculateResult(newAnswers, results)); }
  };

  if (result) { return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><ResultView quiz={quiz} result={result} onRetry={() => {setResult(null); setCurrentStep(0); setAnswers({});}} onBack={onBack} /></div>; }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-md flex justify-between items-center mb-4 px-4">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 flex items-center gap-1 font-bold text-sm"><ArrowLeft size={16}/> 戻る</button>
          <div className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 border shadow-sm truncate max-w-[200px]">{quiz.title}</div>
      </div>
      <QuizCardLayout quiz={{...quiz, questions}} currentStep={currentStep} onAnswer={handleAnswer} />
    </div>
  );
};

// 3. Editor
const Editor = ({ onBack, onSave, onDelete, user, onLoginRequest }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  
  // AI Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [aiTheme, setAiTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Billing Modal
  const [showBillingModal, setShowBillingModal] = useState(false);

  const [editForm, setEditForm] = useState({
      title: "新規ビジネス診断",
      description: "診断の説明文を入力してください...",
      category: "Business",
      color: "bg-indigo-600",
      settings: { lp_url: "", lp_text: "", line_url: "", line_text: "" },
      questions: Array(5).fill(null).map((_, i) => ({ text: `質問${i+1}`, options: Array(4).fill(null).map((_, j) => ({ label: `選択肢${j+1}`, score: { A: j===0?3:0, B: j===1?3:0, C: j===2?3:0 } })) })),
      results: [ { type: "A", title: "タイプA", description: "結果説明..." }, { type: "B", title: "タイプB", description: "結果説明..." }, { type: "C", title: "タイプC", description: "結果説明..." } ]
  });

  const handlePublish = () => {
      const url = `${window.location.origin}?id=${savedId}`;
      navigator.clipboard.writeText(url);
      alert(`公開URLをコピーしました！\n${url}`);
  };

  const handleAiGenerate = async () => {
      // APIキーは環境変数から読み込む
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if(!apiKey) return alert('環境変数にOpenAI APIキーが設定されていません');
      if(!aiTheme) return alert('テーマを入力してください');

      setIsGenerating(true);
      try {
          const prompt = `
            テーマ「${aiTheme}」の診断クイズを作成。JSONのみ出力。
            {
              "title": "...", "description": "...",
              "questions": [{"text": "...", "options": [{"label": "...", "score": {"A":3,"B":0,"C":0}}...]}...],
              "results": [{"type": "A", "title": "...", "description": "..."}, ...]
            }
            質問は5つ、各4択。結果はA,B,Cの3タイプ。
          `;
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
              body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] })
          });
          const data = await res.json();
          const jsonStr = data.choices[0].message.content.match(/\{[\s\S]*\}/)[0];
          const aiData = JSON.parse(jsonStr);
          setEditForm(prev => ({
              ...prev,
              title: aiData.title || prev.title,
              description: aiData.description || prev.description,
              questions: aiData.questions || prev.questions,
              results: aiData.results || prev.results
          }));
          setShowAiModal(false);
          alert('AI生成完了！');
      } catch(e) { alert('生成エラー: ' + e.message); } finally { setIsGenerating(false); }
  };

  const Input = ({ label, val, onChange, placeholder, className }) => ( <div className="mb-4"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label><input type="text" value={val} onChange={onChange} className={`w-full border border-gray-300 rounded-lg p-2.5 font-bold text-gray-900 outline-none focus:border-indigo-500 focus:bg-indigo-50 transition-colors ${className}`} placeholder={placeholder} /></div> );
  const Textarea = ({ label, val, onChange }) => ( <div className="mb-4"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label><textarea rows={3} value={val} onChange={onChange} className="w-full border border-gray-300 rounded-lg p-2.5 font-medium text-gray-900 outline-none focus:border-indigo-500 focus:bg-indigo-50 transition-colors" /></div> );

  // ビジネス連携タブのロック判定：ログインしていればロック解除
  const isBusinessLocked = !user;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-3"><button onClick={onBack} className="text-gray-500 hover:text-gray-900"><ArrowLeft /></button><h2 className="font-bold text-xl text-gray-900">エディタ</h2></div>
            <div className="flex gap-2">
                {savedId && <button onClick={handlePublish} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm"><Share2 size={18}/> <span className="hidden sm:inline">URLコピー</span></button>}
                <button onClick={async ()=>{setIsSaving(true); const id=await onSave(editForm, savedId); if(id){setSavedId(id); sessionStorage.setItem('lastCreatedQuizId',id);} setIsSaving(false);}} disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-md">{isSaving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} 保存</button>
            </div>
        </div>

        <div className="flex flex-grow overflow-hidden">
            <div className="w-56 bg-white border-r flex flex-col py-4">
                {[ {id: 'basic', label: '基本設定', icon: Edit3}, {id: 'questions', label: '質問設定', icon: MessageSquare}, {id: 'results', label: '結果パターン', icon: Trophy}, {id: 'business', label: 'ビジネス連携', icon: CreditCard, lock: isBusinessLocked} ].map(tab => (
                    <button key={tab.id} onClick={() => tab.lock ? setShowBillingModal(true) : setActiveTab(tab.id)} className={`px-4 py-3 text-left font-bold flex items-center justify-between group transition-colors ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-2"><tab.icon size={18} /> {tab.label}</div>
                        {tab.lock && <Lock size={14} className="text-gray-300 group-hover:text-orange-400"/>}
                    </button>
                ))}
                <div className="mt-auto p-4 border-t">
                    {user ? (
                        <button onClick={()=>setShowAiModal(true)} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow hover:opacity-90 transition-all"><Sparkles size={18} /> AIで自動生成</button>
                    ) : (
                        <button onClick={onLoginRequest} className="w-full bg-gray-100 text-gray-400 p-3 rounded-xl font-bold text-sm flex flex-col items-center gap-1 cursor-not-allowed border border-gray-200"><div className="flex items-center gap-1"><Lock size={14}/> AI機能</div><span className="text-[10px]">ログイン必須</span></button>
                    )}
                </div>
            </div>

            <div className="flex-grow p-8 overflow-y-auto bg-gray-50">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    {activeTab === 'basic' && <div className="animate-fade-in"><h3 className="text-xl font-bold mb-6 pb-2 border-b text-gray-800">基本情報</h3><Input label="診断タイトル" val={editForm.title} onChange={e=>setEditForm({...editForm, title:e.target.value})} /><Textarea label="説明文" val={editForm.description} onChange={e=>setEditForm({...editForm, description:e.target.value})} /><Input label="カテゴリ" val={editForm.category} onChange={e=>setEditForm({...editForm, category:e.target.value})} /></div>}
                    
                    {activeTab === 'questions' && (
                        <div className="animate-fade-in space-y-8">
                            <h3 className="text-xl font-bold mb-6 pb-2 border-b text-gray-800">質問設定 (全5問固定)</h3>
                            {editForm.questions.map((q, qIdx) => (
                                <div key={qIdx} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="font-bold text-indigo-600 mb-2">Q{qIdx+1}</div>
                                    <Input label="質問文" val={q.text} onChange={e => { const newQ = [...editForm.questions]; newQ[qIdx].text = e.target.value; setEditForm({...editForm, questions: newQ}); }} />
                                    <div className="space-y-3 mt-4">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="bg-white p-3 rounded border border-gray-200 flex flex-wrap gap-4 items-center">
                                                <div className="flex-grow min-w-[200px]"><label className="text-xs text-gray-400 font-bold mb-1 block">選択肢 {oIdx+1}</label><input type="text" value={opt.label} className="w-full font-bold border-b border-gray-300 focus:border-indigo-500 outline-none text-gray-900 pb-1" onChange={e => { const newQ = [...editForm.questions]; newQ[qIdx].options[oIdx].label = e.target.value; setEditForm({...editForm, questions: newQ}); }} /></div>
                                                <div className="flex gap-2 bg-gray-50 p-1 rounded">{['A','B','C'].map(type => (<div key={type} className="flex flex-col items-center"><span className="text-[10px] text-gray-500 font-bold">{type}</span><input type="number" className="w-10 border border-gray-300 rounded text-center font-mono text-gray-900 font-bold h-8" value={opt.score?.[type] || 0} onChange={e => { const newQ = [...editForm.questions]; if(!newQ[qIdx].options[oIdx].score) newQ[qIdx].options[oIdx].score = {}; newQ[qIdx].options[oIdx].score[type] = parseInt(e.target.value) || 0; setEditForm({...editForm, questions: newQ}); }} /></div>))}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'results' && (
                        <div className="animate-fade-in space-y-6">
                            <h3 className="text-xl font-bold mb-6 pb-2 border-b text-gray-800">結果パターン (A/B/C)</h3>
                            {editForm.results.map((res, rIdx) => (
                                <div key={rIdx} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3"><span className="bg-gray-800 text-white font-bold px-3 py-1 rounded text-sm">Type {res.type}</span></div>
                                    <Input label="結果タイトル" val={res.title} onChange={e => { const newR = [...editForm.results]; newR[rIdx].title = e.target.value; setEditForm({...editForm, results: newR}); }} />
                                    <Textarea label="詳細説明" val={res.description} onChange={e => { const newR = [...editForm.results]; newR[rIdx].description = e.target.value; setEditForm({...editForm, results: newR}); }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'business' && (
                        <div className="animate-fade-in space-y-6">
                            <h3 className="text-xl font-bold mb-6 pb-2 border-b text-gray-800">ビジネス設定</h3>
                            <Input label="商品LPリンク URL" val={editForm.settings.lp_url} onChange={e => setEditForm({...editForm, settings: {...editForm.settings, lp_url: e.target.value}})} />
                            <Input label="LPボタン文言" val={editForm.settings.lp_text} onChange={e => setEditForm({...editForm, settings: {...editForm.settings, lp_text: e.target.value}})} />
                            <hr />
                            <Input label="公式LINE URL" val={editForm.settings.line_url} onChange={e => setEditForm({...editForm, settings: {...editForm.settings, line_url: e.target.value}})} />
                            <Input label="LINE誘導文言" val={editForm.settings.line_text} onChange={e => setEditForm({...editForm, settings: {...editForm.settings, line_text: e.target.value}})} />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* AI Modal */}
        {showAiModal && (
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
                    <button onClick={()=>setShowAiModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-900"><Sparkles className="text-purple-500"/> AIオート生成</h3>
                    <div className="space-y-4">
                        <div className="bg-purple-50 text-purple-900 text-xs p-3 rounded font-bold">
                            システムに設定されたAPIキーを使用します。
                        </div>
                        {/* APIキー入力欄を削除しました */}
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">テーマ</label><textarea className="w-full border rounded-lg p-2 font-bold text-gray-900" rows={3} placeholder="例：30代独身男性向けの婚活診断" value={aiTheme} onChange={e=>setAiTheme(e.target.value)} /></div>
                        <button onClick={handleAiGenerate} disabled={isGenerating} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50">{isGenerating ? <Loader2 className="animate-spin mx-auto"/> : '生成する'}</button>
                    </div>
                </div>
            </div>
        )}

        {/* Billing Modal */}
        {showBillingModal && (
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-6 text-white text-center">
                        <Crown size={48} className="mx-auto mb-2 text-yellow-200" />
                        <h3 className="text-2xl font-extrabold">会員限定機能</h3>
                    </div>
                    <div className="p-8 text-center">
                        <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                            「ビジネス連携機能」を利用するには、無料会員登録が必要です。<br/>
                            ログインして、LINE登録や商品ページへスムーズに誘導しましょう！
                        </p>
                        <div className="flex gap-3">
                            <button onClick={()=>setShowBillingModal(false)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300">閉じる</button>
                            <button onClick={()=>{setShowBillingModal(false); onLoginRequest();}} className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg">ログイン / 登録</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

// 4. App Root
const App = () => {
  const [view, setView] = useState('portal'); 
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  // URL Routing Check
  useEffect(() => {
    const handleRouting = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id && supabase) {
         setIsLoading(true);
         const { data, error } = await supabase.from('quizzes').select('*').eq('id', id).single();
         if (data && !error) {
             setSelectedQuiz(data);
             setView('quiz');
         }
         setIsLoading(false);
      }
    };
    handleRouting();
  }, []);

  // Auth Check
  useEffect(() => {
      if (supabase) {
          supabase.auth.getSession().then(({ data: { session } }) => {
              setUser(session?.user ?? null);
          });
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
              setUser(session?.user ?? null);
          });
          return () => subscription.unsubscribe();
      }
  }, []);

  // Fetch
  const fetchQuizzes = async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('quizzes').select('*').order('id', { ascending: true });
      if (error) throw error;
      setQuizzes(data || []);
    } catch(e) { console.error(e); } finally { setIsLoading(false); }
  };
  useEffect(() => { fetchQuizzes(); }, []);

  // Save
  const handleSave = async (quizData, id) => {
    if (!supabase) return null;
    try {
      const payload = {
        title: quizData.title,
        description: quizData.description,
        category: quizData.category,
        questions: quizData.questions,
        results: quizData.results,
        settings: quizData.settings
      };
      
      const { data, error } = id 
        ? await supabase.from('quizzes').update(payload).eq('id', id).select()
        : await supabase.from('quizzes').insert([payload]).select();

      if (error) throw error;
      
      alert("保存しました！");
      fetchQuizzes();
      return data[0]?.id;
    } catch(e) { alert("保存エラー: " + e.message); return null; }
  };

  return (
    <div>
      <AuthModal isOpen={!!showAuth} onClose={()=>setShowAuth(false)} setUser={setUser} />
      
      {view === 'portal' && <Portal quizzes={quizzes} isLoading={isLoading} user={user} setShowAuth={setShowAuth} onLogout={()=>supabase.auth.signOut()} onPlay={(q)=>{setSelectedQuiz(q); setView('quiz');}} onCreate={()=>setView('editor')} />}
      {view === 'quiz' && <QuizPlayer quiz={selectedQuiz} onBack={()=>{setView('portal'); setSelectedQuiz(null);}} />}
      {view === 'editor' && <Editor user={user} onBack={()=>setView('portal')} onSave={handleSave} onDelete={()=>{}} onLoginRequest={()=>setShowAuth(true)} />}
    </div>
  );
};

export default App;