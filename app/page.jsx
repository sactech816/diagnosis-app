"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Play, Edit3, CreditCard, MessageSquare, CheckCircle, ChevronRight, 
  Trash2, ArrowLeft, Save, RefreshCw, Loader2, Bot, Trophy, 
  Home, ThumbsUp, ExternalLink, MessageCircle, Lock, Share2, Copy,
  Sparkles, X, Crown, Globe, LogIn, LogOut, User, Key, LayoutDashboard, HelpCircle, BookOpen
} from 'lucide-react';

// --- Supabase Config ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// --- Logic ---
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
    if (!isOpen) return null;
    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const { data, error } = isLogin 
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password });
            if (error) throw error;
            if (isLogin && data.user) { setUser(data.user); onClose(); }
            else alert('確認メールを送信しました。');
        } catch (e) { alert(e.message); } finally { setLoading(false); }
    };
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
                <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'ログイン' : '新規登録'}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border p-2 rounded" placeholder="Email" />
                    <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-2 rounded" placeholder="Password" />
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded">{loading ? '...' : (isLogin ? 'ログイン' : '登録')}</button>
                </form>
                <button onClick={()=>setIsLogin(!isLogin)} className="w-full text-center mt-4 text-sm text-blue-600 underline">{isLogin ? '新規登録へ' : 'ログインへ'}</button>
            </div>
        </div>
    );
};

// 2. Pages
const PricePage = ({ onBack }) => (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-gray-600 font-bold hover:text-blue-600"><ArrowLeft/> トップへ戻る</button>
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">料金プラン</h1>
            <p className="text-gray-600 mb-12">あなたのビジネス規模に合わせた最適なプランをお選びください。</p>
            <div className="grid md:grid-cols-3 gap-8">
                {[ {name:"Free", price:"¥0", feat:["クイズ作成数: 3つまで","基本テンプレート"]}, {name:"Pro", price:"¥2,980", feat:["作成数無制限","広告非表示","アクセス解析"], rec:true}, {name:"Business", price:"¥9,800", feat:["Pro全機能","独自ドメイン","チーム管理"]} ].map((plan,i)=>(
                    <div key={i} className={`bg-white rounded-2xl p-8 shadow-xl border-2 ${plan.rec?'border-blue-500 relative':'border-transparent'}`}>
                        {plan.rec && <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">RECOMMENDED</span>}
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <div className="text-4xl font-extrabold mb-4">{plan.price}<span className="text-sm font-medium text-gray-500">/月</span></div>
                        <ul className="text-left space-y-3 mb-8">{plan.feat.map((f,j)=><li key={j} className="flex gap-2 text-sm"><CheckCircle size={16} className="text-green-500"/>{f}</li>)}</ul>
                        <button className={`w-full py-3 rounded-lg font-bold ${plan.rec?'bg-blue-600 text-white':'bg-gray-100'}`}>選択する</button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const HowToPage = ({ onBack }) => (
    <div className="min-h-screen bg-white py-12 px-4 font-sans">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-gray-600 font-bold hover:text-blue-600 max-w-4xl mx-auto"><ArrowLeft/> トップへ戻る</button>
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">売れる診断クイズの作り方</h1>
            <div className="space-y-12">
                <section><h2 className="text-xl font-bold text-blue-700 mb-4">1. ゴールを決める</h2><p className="text-gray-700">「誰に」「どうなって欲しいか」を明確にします。</p></section>
                <section><h2 className="text-xl font-bold text-blue-700 mb-4">2. 結果パターンから作る</h2><p className="text-gray-700">まずは読ませたい「診断結果（A, B, Cタイプ）」と、そこからの誘導（LINE登録など）を考えます。</p></section>
                <section><h2 className="text-xl font-bold text-blue-700 mb-4">3. 質問で振り分ける</h2><p className="text-gray-700">結果パターンに導くための質問を作ります。AIアシスタントを使えば簡単です。</p></section>
            </div>
        </div>
    </div>
);

// 3. Portal
const Portal = ({ quizzes, isLoading, onPlay, onCreate, user, setShowAuth, onLogout, setPage }) => {
  const handleLike = async (e, quiz) => {
      e.stopPropagation();
      if(!supabase) return;
      await supabase.rpc('increment_likes', { row_id: quiz.id });
      // 簡易的にUI更新（リロードなしで+1）
      e.currentTarget.querySelector('span').textContent = (quiz.likes_count || 0) + 1;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <div className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="font-bold text-xl flex items-center gap-2 text-indigo-700 cursor-pointer" onClick={()=>setPage('portal')}><Sparkles className="text-pink-500"/> 診断メーカー</div>
              <div className="flex items-center gap-4 text-sm font-bold text-gray-600">
                  <button onClick={()=>setPage('price')} className="hover:text-indigo-600">料金プラン</button>
                  <button onClick={()=>setPage('howto')} className="hover:text-indigo-600">作り方</button>
                  {user ? (
                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                          <User size={14}/> <span className="truncate max-w-[100px]">{user.email}</span>
                          <button onClick={onLogout} title="ログアウト"><LogOut size={14}/></button>
                      </div>
                  ) : (
                      <button onClick={()=>setShowAuth(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700">ログイン</button>
                  )}
              </div>
          </div>
      </div>
      <div className="bg-gradient-to-br from-indigo-900 to-blue-800 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">ビジネスを加速させる<br/>診断コンテンツ</h1>
        <p className="text-lg text-blue-100 mb-8">集客・販促・顧客分析。AIがあなたの代わりに作成します。</p>
        <button onClick={onCreate} className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold shadow-xl hover:bg-gray-50 flex items-center gap-2 mx-auto"><Edit3 /> 無料で作成する</button>
      </div>
      <div id="quiz-list" className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 border-l-4 border-indigo-600 pl-4">人気の診断</h2>
        {isLoading ? <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-indigo-600"/></div> : 
         <div className="grid md:grid-cols-3 gap-8">
            {quizzes.map((quiz) => (
              <div key={quiz.id} onClick={()=>onPlay(quiz)} className="bg-white rounded-2xl shadow hover:shadow-xl transition-all cursor-pointer flex flex-col h-full group overflow-hidden border border-gray-100">
                <div className={`h-40 ${quiz.color || 'bg-gray-500'} relative`}>
                    <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold">{quiz.category}</span>
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white bg-black/30 px-2 py-1 rounded-full text-xs"><ThumbsUp size={12} /> {quiz.likes_count || 0}</div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 flex-grow mb-4">{quiz.description}</p>
                  <div className="flex items-center justify-between border-t pt-4">
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg">診断する</span>
                      <button onClick={(e)=>handleLike(e, quiz)} className="text-gray-400 hover:text-pink-500 p-1"><ThumbsUp size={18}/></button>
                  </div>
                </div>
              </div>
            ))}
         </div>
        }
      </div>
      <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm"><p>&copy; 2025 Diagnosis Maker. All rights reserved.</p></footer>
    </div>
  );
};

// 4. Result View
const ResultView = ({ quiz, result, onRetry, onBack }) => {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden my-8 animate-fade-in border border-gray-100">
        <div className="bg-indigo-700 text-white p-10 text-center">
            <Trophy className="mx-auto mb-4 text-yellow-300" size={56} />
            <h2 className="text-3xl font-extrabold mt-2">{result.title}</h2>
        </div>
        <div className="p-10">
            <div className="prose text-gray-800 leading-relaxed whitespace-pre-wrap mb-10">{result.description}</div>
            
            {/* 結果ごとのリンク表示 */}
            {result.link_url && (
                <div className="mb-6">
                    <a href={result.link_url} target="_blank" rel="noopener noreferrer" className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-105">
                        <ExternalLink size={20}/> {result.link_text || "詳しく見る"}
                    </a>
                </div>
            )}

            <div className="flex gap-4 border-t pt-6">
                <button onClick={onRetry} className="flex-1 py-3 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 flex justify-center gap-2"><RefreshCw size={18}/> 再診断</button>
                <button onClick={onBack} className="flex-1 py-3 rounded-lg bg-gray-800 font-bold text-white hover:bg-gray-900 flex justify-center gap-2"><Home size={18}/> TOP</button>
            </div>
        </div>
    </div>
  );
};

// 5. Quiz Player (Card Only)
const QuizPlayer = ({ quiz, onBack }) => {
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
  
  const question = questions[currentStep];
  const progress = Math.round(((currentStep)/questions.length)*100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-md mb-4 px-4"><button onClick={onBack} className="text-gray-500 font-bold flex items-center gap-1"><ArrowLeft size={16}/> 戻る</button></div>
      <div className="max-w-md mx-auto w-full px-4">
        <div className="mb-6 flex justify-between text-xs font-bold text-gray-500"><span>Q{currentStep+1}/{questions.length}</span><span>{progress}%</span></div>
        <div className="h-2 bg-gray-200 rounded-full mb-8 overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-300" style={{width:`${progress}%`}}></div></div>
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">{question.text}</h3>
            <div className="space-y-4">
                {question.options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleAnswer(opt)} className="w-full p-5 text-left border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-gray-900 font-bold transition-all flex justify-between group">
                        <span>{opt.label}</span><div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-blue-500"></div>
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

// 6. Editor
const Editor = ({ onBack, onSave, user }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTheme, setAiTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

  const [form, setForm] = useState({
      title: "新規診断", description: "説明...", category: "Business", color: "bg-indigo-600",
      questions: Array(5).fill(null).map((_,i)=>({text:`質問${i+1}`, options: Array(4).fill(null).map((_,j)=>({label:`選択肢${j+1}`, score:{A:j===0?3:0, B:j===1?3:0, C:j===2?3:0}}))})),
      results: [ {type:"A", title:"タイプA", description:"...", link_url:"", link_text:""}, {type:"B", title:"タイプB", description:"...", link_url:"", link_text:""}, {type:"C", title:"タイプC", description:"...", link_url:"", link_text:""} ]
  });

  const handlePublish = () => { navigator.clipboard.writeText(`${window.location.origin}?id=${savedId}`); alert(`URLコピー完了`); };

  const handleAiGenerate = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if(!apiKey) return alert('APIキー未設定');
      if(!aiTheme) return alert('テーマを入力してください');
      setIsGenerating(true);
      try {
          const prompt = `テーマ「${aiTheme}」の診断作成。JSONのみ。title,description,questions(5問4択,各score{A,B,C}),results(3つ,type,title,description). リンク情報は不要。`;
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
              body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] })
          });
          const data = await res.json();
          const json = JSON.parse(data.choices[0].message.content.match(/\{[\s\S]*\}/)[0]);
          setForm(prev => ({ ...prev, ...json, results: json.results.map(r=>({...r, link_url:"", link_text:""})) })); 
          setShowAiModal(false); alert('生成完了');
      } catch(e) { alert(e.message); } finally { setIsGenerating(false); }
  };

  const Input = ({label, val, onChange, ph}) => (<div className="mb-4"><label className="text-xs font-bold text-gray-500 block mb-1">{label}</label><input className="w-full border p-2 rounded font-bold" value={val||''} onChange={e=>onChange(e.target.value)} placeholder={ph}/></div>);
  const Textarea = ({label, val, onChange}) => (<div className="mb-4"><label className="text-xs font-bold text-gray-500 block mb-1">{label}</label><textarea className="w-full border p-2 rounded" rows={3} value={val} onChange={e=>onChange(e.target.value)}/></div>);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex justify-between sticky top-0 z-50">
            <div className="flex items-center gap-2"><button onClick={onBack}><ArrowLeft/></button><h2 className="font-bold">エディタ</h2></div>
            <div className="flex gap-2">
                {savedId && <button onClick={handlePublish} className="bg-white border px-4 py-2 rounded font-bold flex gap-2"><Share2 size={18}/> URL</button>}
                <button onClick={async ()=>{setIsSaving(true); const id=await onSave(form, savedId); if(id) setSavedId(id); setIsSaving(false);}} disabled={isSaving} className="bg-blue-600 text-white px-6 py-2 rounded font-bold flex gap-2">{isSaving?<Loader2 className="animate-spin"/>:<Save/>} 保存</button>
            </div>
        </div>
        <div className="flex flex-grow overflow-hidden">
            <div className="w-48 bg-white border-r py-4 flex flex-col">
                {['basic','questions','results'].map(id=><button key={id} onClick={()=>setActiveTab(id)} className={`px-4 py-3 text-left font-bold capitalize ${activeTab===id?'text-blue-600 border-r-4 border-blue-600':'text-gray-500'}`}>{id}</button>)}
                <button onClick={()=>setShowLockModal(true)} className="px-4 py-3 text-left font-bold text-gray-400 flex items-center justify-between">分析 <Lock size={14}/></button>
                <div className="mt-auto p-4"><button onClick={()=>setShowAiModal(true)} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1 shadow"><Sparkles size={16}/> AI生成</button></div>
            </div>
            <div className="flex-grow p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
                    {activeTab === 'basic' && <div><h3 className="font-bold text-xl mb-6 border-b pb-2">基本情報</h3><Input label="タイトル" val={form.title} onChange={v=>setForm({...form, title:v})} /><Textarea label="説明文" val={form.description} onChange={v=>setForm({...form, description:v})} /><Input label="カテゴリ" val={form.category} onChange={v=>setForm({...form, category:v})} /></div>}
                    {activeTab === 'questions' && <div className="space-y-8"><h3 className="font-bold text-xl mb-6 border-b pb-2">質問 (5問)</h3>{form.questions.map((q, i)=>(<div key={i} className="bg-gray-50 p-4 rounded border"><Input label={`質問 ${i+1}`} val={q.text} onChange={v=>{const n=[...form.questions];n[i].text=v;setForm({...form, questions:n})}} />{q.options.map((o, j)=>(<div key={j} className="flex gap-2 mb-2 items-center"><input className="flex-grow border p-1 rounded" value={o.label} onChange={e=>{const n=[...form.questions];n[i].options[j].label=e.target.value;setForm({...form, questions:n})}} />{['A','B','C'].map(t=><div key={t} className="flex flex-col items-center"><span className="text-[10px]">{t}</span><input type="number" className="w-8 border text-center" value={o.score[t]} onChange={e=>{const n=[...form.questions];n[i].options[j].score[t]=e.target.value;setForm({...form, questions:n})}} /></div>)}</div>))}</div>))}</div>}
                    {activeTab === 'results' && <div className="space-y-8"><h3 className="font-bold text-xl mb-6 border-b pb-2">結果パターン</h3>{form.results.map((r, i)=>(<div key={i} className="bg-gray-50 p-4 rounded border"><div className="flex items-center gap-2 mb-2"><span className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-bold">Type {r.type}</span></div><Input label="タイトル" val={r.title} onChange={v=>{const n=[...form.results];n[i].title=v;setForm({...form, results:n})}} /><Textarea label="説明文" val={r.description} onChange={v=>{const n=[...form.results];n[i].description=v;setForm({...form, results:n})}}/><div className="bg-blue-50 p-3 rounded border border-blue-200 mt-2"><p className="text-xs font-bold text-blue-600 mb-2 flex gap-1"><CreditCard size={12}/> ビジネス連携</p><div className="grid grid-cols-2 gap-4"><Input label="URL (LP/LINE)" val={r.link_url} onChange={v=>{const n=[...form.results];n[i].link_url=v;setForm({...form, results:n})}} ph="https://..." /><Input label="ボタン文言" val={r.link_text} onChange={v=>{const n=[...form.results];n[i].link_text=v;setForm({...form, results:n})}} ph="詳細はこちら" /></div></div></div>))}</div>}
                </div>
            </div>
        </div>
        {showAiModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"><div className="bg-white p-8 rounded-xl w-96 relative"><button onClick={()=>setShowAiModal(false)} className="absolute top-2 right-2"><X/></button><h3 className="font-bold text-xl mb-4 flex gap-2"><Sparkles/> AI自動生成</h3><textarea className="w-full border p-2 rounded mb-4" rows={4} placeholder="テーマを入力..." value={aiTheme} onChange={e=>setAiTheme(e.target.value)} /><button onClick={handleAiGenerate} disabled={isGenerating} className="w-full bg-purple-600 text-white py-2 rounded font-bold">{isGenerating?'生成中...':'生成する'}</button></div></div>}
        {showLockModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"><div className="bg-white p-8 rounded-xl text-center"><Crown size={48} className="mx-auto text-yellow-400 mb-4"/><h3 className="font-bold text-xl mb-2">Proプラン限定</h3><p className="text-gray-500 mb-4">アクセス解析機能はProプランで利用可能です。</p><button onClick={()=>setShowLockModal(false)} className="bg-gray-200 px-6 py-2 rounded font-bold">閉じる</button></div></div>}
    </div>
  );
};

// 7. App Root
const App = () => {
  const [view, setView] = useState('portal'); 
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
      const init = async () => {
          const params = new URLSearchParams(window.location.search);
          const id = params.get('id');
          if(id && supabase) {
              const {data} = await supabase.from('quizzes').select('*').eq('id',id).single();
              if(data) { setSelectedQuiz(data); setView('quiz'); }
          }
          if(supabase) {
              supabase.auth.getSession().then(({data:{session}})=>setUser(session?.user||null));
              const {data} = await supabase.from('quizzes').select('*').order('id',{ascending:true});
              setQuizzes(data||[]);
              setIsLoading(false);
          }
      };
      init();
  }, []);

  const handleSave = async (form, id) => {
      if(!supabase) return;
      try {
          const payload = {
              title: form.title, description: form.description, category: form.category, color: form.color,
              questions: form.questions, results: form.results, user_id: user?.id
          };
          const {data, error} = id 
            ? await supabase.from('quizzes').update(payload).eq('id',id).select() 
            : await supabase.from('quizzes').insert([payload]).select();
          if(error) throw error;
          alert('保存しました');
          const {data:newData} = await supabase.from('quizzes').select('*').order('id',{ascending:true});
          setQuizzes(newData||[]);
          return data[0].id;
      } catch(e) { alert(e.message); }
  };

  return (
    <div>
        <AuthModal isOpen={showAuth} onClose={()=>setShowAuth(false)} setUser={setUser} />
        {view === 'portal' && <Portal quizzes={quizzes} isLoading={isLoading} user={user} setShowAuth={setShowAuth} onLogout={()=>supabase.auth.signOut()} onPlay={(q)=>{setSelectedQuiz(q); setView('quiz');}} onCreate={()=>setView('editor')} setPage={setView} />}
        {view === 'price' && <PricePage onBack={()=>setView('portal')} />}
        {view === 'howto' && <HowToPage onBack={()=>setView('portal')} />}
        {view === 'quiz' && <QuizPlayer quiz={selectedQuiz} onBack={()=>{setView('portal'); setSelectedQuiz(null);}} />}
        {view === 'editor' && <Editor user={user} onBack={()=>setView('portal')} onSave={handleSave} />}
    </div>
  );
};

export default App;