"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { supabase } from '../lib/supabase';
import { generateSlug } from '../lib/utils';
// ★修正: constants.js から読み込むように変更
import { ADMIN_EMAIL } from '../lib/constants';

import AuthModal from '../components/AuthModal';
import Portal from '../components/Portal';
import Dashboard from '../components/Dashboard';
import QuizPlayer from '../components/QuizPlayer';
import Editor from '../components/Editor';
import { FaqPage, PricePage, HowToPage } from '../components/StaticPages';

const App = () => {
  const [view, setView] = useState('portal'); 
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const fetchQuizzes = async () => {
    if(!supabase) return;
    setIsLoading(true);
    const {data} = await supabase.from('quizzes').select('*').order('created_at',{ascending:false});
    setQuizzes(data||[]);
    setIsLoading(false);
  };

  useEffect(() => {
      const init = async () => {
          const params = new URLSearchParams(window.location.search);
          const id = params.get('id');
          if(id && supabase) {
              // slug(文字列)で検索
              let { data } = await supabase.from('quizzes').select('*').eq('slug', id).single();
              // なければID(数値)で検索
              if (!data && !isNaN(id)) {
                 const res = await supabase.from('quizzes').select('*').eq('id', id).single();
                 data = res.data;
              }
              if(data) { setSelectedQuiz(data); setView('quiz'); }
          }
          if(supabase) {
              supabase.auth.getSession().then(({data:{session}})=>setUser(session?.user||null));
              const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user || null);
              });
              await fetchQuizzes();
              return () => subscription.unsubscribe();
          }
      };
      init();
  }, []);

  useEffect(() => {
      const handlePopState = (event) => {
          if (event.state && event.state.view) {
              setView(event.state.view);
              if (event.state.view === 'quiz' && event.state.id) {
                  setView('portal');
                  setSelectedQuiz(null);
              }
          } else {
              setView('portal');
              setSelectedQuiz(null);
          }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newView, params = {}) => {
      let url = window.location.pathname;
      if (newView === 'quiz' && params.id) {
          url += `?id=${params.id}`;
      }
      window.history.pushState({ view: newView, ...params }, '', url);
      setView(newView);
  };

  const handleSave = async (form, id) => {
      if(!supabase) return;
      try {
          const payload = {
              title: form.title, 
              description: form.description, 
              category: form.category, 
              color: form.color,
              questions: form.questions, 
              results: form.results, 
              user_id: user?.id || null,
              layout: form.layout || 'card',
              image_url: form.image_url || null,
              mode: form.mode || 'diagnosis'
          };
          
          if (!id && !form.slug) { 
              payload.slug = generateSlug(); 
          }

          let result;
          if (id) {
             result = await supabase.from('quizzes').update(payload).eq('id',id).select(); 
          } else {
             result = await supabase.from('quizzes').insert([payload]).select();
          }
          
          if(result.error) throw result.error;
          if(!result.data || result.data.length === 0) throw new Error("更新できませんでした。");
          
          alert('保存しました！');
          await fetchQuizzes();
          
          return result.data[0].slug || result.data[0].id;
          
      } catch(e) { 
          alert('保存エラー: ' + e.message); 
      }
  };

  const handleDelete = async (id) => {
      if(!confirm('本当に削除しますか？')) return;
      try {
          const { error } = await supabase.from('quizzes').delete().eq('id', id);
          if(error) throw error;
          alert('削除しました');
          await fetchQuizzes();
      } catch(e) {
          alert('削除エラー: ' + e.message);
      }
  };

  return (
    <div>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P0E5HB1CFE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P0E5HB1CFE');
          `}
        </Script>
        
        <AuthModal isOpen={showAuth} onClose={()=>setShowAuth(false)} setUser={setUser} />
        
        {view === 'portal' && (
            <Portal 
                quizzes={quizzes} isLoading={isLoading} user={user} setShowAuth={setShowAuth} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} onPlay={(q)=>{ setSelectedQuiz(q); navigateTo('quiz', { id: q.slug || q.id }); }} onCreate={()=>{ setEditingQuiz(null); navigateTo('editor'); }} setPage={(p) => navigateTo(p)} onEdit={(q)=>{ setEditingQuiz(q); navigateTo('editor'); }} onDelete={handleDelete} isAdmin={isAdmin}
            />
        )}
        {view === 'dashboard' && <Dashboard user={user} setPage={(p) => navigateTo(p)} onLogout={async ()=>{ await supabase.auth.signOut(); navigateTo('portal');}} onEdit={(q)=>{setEditingQuiz(q); navigateTo('editor');}} onDelete={handleDelete} />}
        {view === 'faq' && <FaqPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'price' && <PricePage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'howto' && <HowToPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'quiz' && (
            <QuizPlayer 
                quiz={selectedQuiz} 
                onBack={async ()=>{ 
                    await fetchQuizzes(); 
                    navigateTo('portal'); 
                }} 
            />
        )}
        {view === 'editor' && (
            <Editor 
                user={user} 
                initialData={editingQuiz}
                setPage={(p) => navigateTo(p)}
                onBack={()=>{ navigateTo('portal'); setEditingQuiz(null);}} 
                onSave={handleSave} 
            />
        )}
    </div>
  );
};

export default App;