"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { supabase } from '../lib/supabase';
import { generateSlug } from '../lib/utils';
import { getAdminEmails } from '../lib/constants';
import { generateQuizHTML } from '../lib/htmlGenerator';

import AuthModal from '../components/AuthModal';
import Portal from '../components/Portal';
import Dashboard from '../components/Dashboard';
import QuizPlayer from '../components/QuizPlayer';
import Editor from '../components/Editor';
import AnnouncementsPage from '../components/AnnouncementsPage';
import { 
    FaqPage, PricePage, HowToPage, 
    EffectiveUsePage, QuizLogicPage, 
    ContactPage, LegalPage, PrivacyPage 
} from '../components/StaticPages';
import { Loader2 } from 'lucide-react';

const App = () => {
  const [view, setView] = useState('loading'); 
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // 管理者かどうかを判定（複数のメールアドレスに対応）
  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some(email => 
    user.email.toLowerCase() === email.toLowerCase()
  );

  const fetchQuizzes = async () => {
    if(!supabase) return;
    setIsLoading(true);
    const {data} = await supabase.from('quizzes').select('*').order('created_at',{ascending:false});
    setQuizzes(data||[]);
    setIsLoading(false);
  };

  useEffect(() => {
      const init = async () => {
          // URLパラメータを最初にチェック（クイズIDがある場合は優先）
          const params = new URLSearchParams(window.location.search);
          const id = params.get('id');
          
          // クイズIDがある場合は、認証処理より先にクイズを読み込む
          if (id && supabase) {
              console.log('初期化: クイズIDを検出しました:', id);
              try {
                  // slug(文字列)で検索
                  let { data, error: slugError } = await supabase.from('quizzes').select('*').eq('slug', id).single();
                  
                  // slugで見つからない場合、ID(数値)で検索（互換性のため）
                  if (!data && !isNaN(id)) {
                     const res = await supabase.from('quizzes').select('*').eq('id', id).single();
                     data = res.data;
                     if (res.error && !res.data) {
                         console.error('クイズ検索エラー:', res.error);
                     }
                  } else if (slugError && !data) {
                      const isNotFoundError = slugError.message?.includes('No rows') || slugError.code === 'PGRST116';
                      if (!isNotFoundError) {
                          console.error('slug検索エラー:', slugError);
                      }
                  }

                  if(data) { 
                      console.log('初期化: クイズを読み込みました:', data.title);
                      setSelectedQuiz(data); 
                      setView('quiz');
                      // クイズが読み込めた場合は、認証処理をスキップせずに続行
                  } else {
                      console.warn(`初期化: クイズが見つかりませんでした (id: ${id})`);
                  }
              } catch (error) {
                  console.error('初期化: クイズ読み込みエラー:', error);
              }
          }
          
          // ユーザーセッションの確認
          if(supabase) {
              // 認証状態の変更を監視（最初に設定）
              supabase.auth.onAuthStateChange((event, session) => {
                setUser(session?.user || null);
                
                // パスワードリセット後のセッション変更を検知
                const currentHash = window.location.hash;
                if (currentHash && currentHash.includes('type=recovery')) {
                    if (session?.user) {
                        // パスワード変更画面を表示
                        setShowPasswordReset(true);
                        setView('portal');
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                }
                // ログイン成功時にマイページにリダイレクト（パスワードリセット以外）
                else if (event === 'SIGNED_IN' && session?.user && !currentHash?.includes('type=recovery')) {
                    // クイズIDがある場合はリダイレクトしない
                    const params = new URLSearchParams(window.location.search);
                    const id = params.get('id');
                    if (id) {
                        // クイズIDがある場合は、クイズを表示するためリダイレクトしない
                        return;
                    }
                    // 現在のパスがルートまたはローディング状態の場合のみリダイレクト
                    const currentPath = window.location.pathname;
                    if (currentPath === '/' || currentPath === '') {
                        navigateTo('dashboard');
                    }
                }
              });
              
              // URLハッシュフラグメントをチェック（パスワードリセット用）
              const hash = window.location.hash;
              
              // パスワードリセットリンクから来た場合の処理
              if (hash && hash.includes('type=recovery')) {
                  // まずポータルページを表示
                  setView('portal');
                  
                  // Supabaseが自動的にハッシュからトークンを処理するため、
                  // getSession()を呼び出すだけでセッションが確立される
                  // 少し待ってからセッションを確認（Supabaseがハッシュを処理する時間を確保）
                  setTimeout(async () => {
                      try {
                          const {data:{session}, error} = await supabase.auth.getSession();
                          
                          if (error) {
                              console.error('パスワードリセットセッションエラー:', error);
                              alert('パスワードリセットリンクが無効または期限切れです。');
                              window.history.replaceState(null, '', window.location.pathname);
                          } else if (session?.user) {
                              // セッションが確立されている場合、パスワード変更画面を表示
                              setUser(session.user);
                              setShowPasswordReset(true);
                              // ハッシュをクリア
                              window.history.replaceState(null, '', window.location.pathname);
                          } else {
                              // セッションが確立されていない場合、onAuthStateChangeで処理される
                              console.log('セッションがまだ確立されていません。onAuthStateChangeで処理されます。');
                          }
                      } catch (e) {
                          console.error('パスワードリセット処理エラー:', e);
                          alert('パスワードリセット処理中にエラーが発生しました。');
                          window.history.replaceState(null, '', window.location.pathname);
                      }
                  }, 1000);
              } else {
                  // 通常のセッション確認
                  const {data:{session}} = await supabase.auth.getSession();
                  setUser(session?.user||null);
              }
          }

          // URLパラメータとパスのチェック（クイズIDが既に読み込まれている場合はスキップ）
          const page = params.get('page'); // レガシー互換のため残す
          const paymentStatus = params.get('payment'); // Stripeからの戻り判定
          const pathname = window.location.pathname;
          
          // クイズが既に読み込まれている場合は、ビューの設定をスキップ
          if (id && selectedQuiz) {
              console.log('初期化: クイズは既に読み込まれています');
              // ビューは既に設定されているので、そのまま続行
          }
          // 決済完了・キャンセル戻りならダッシュボードへ強制移動
          else if (paymentStatus === 'success' || paymentStatus === 'cancel') {
              setView('dashboard');
          }
          // クイズIDがあるが、まだ読み込まれていない場合（上記の処理で読み込めなかった場合）
          else if(id && supabase && !selectedQuiz) {
              console.log('初期化: クイズIDがありますが、まだ読み込まれていません。再試行します:', id);
              try {
                  // slug(文字列)で検索
                  let { data, error: slugError } = await supabase.from('quizzes').select('*').eq('slug', id).single();
                  
                  // slugで見つからない場合、ID(数値)で検索（互換性のため）
                  if (!data && !isNaN(id)) {
                     const res = await supabase.from('quizzes').select('*').eq('id', id).single();
                     data = res.data;
                     if (res.error && !res.data) {
                         console.error('クイズ検索エラー:', res.error);
                     }
                  } else if (slugError && !data) {
                      const isNotFoundError = slugError.message?.includes('No rows') || slugError.code === 'PGRST116';
                      if (!isNotFoundError) {
                          console.error('slug検索エラー:', slugError);
                      }
                  }

                  if(data) { 
                      console.log('初期化: クイズを読み込みました（再試行）:', data.title);
                      setSelectedQuiz(data); 
                      setView('quiz'); 
                  } else {
                      console.warn(`初期化: クイズが見つかりませんでした (id: ${id})`);
                      setView('portal');
                  }
              } catch (error) {
                  console.error('初期化: クイズ読み込みエラー:', error);
                  setView('portal');
              }
          }
          // レガシー互換: クエリパラメータのpage指定がある場合
          else if (page) {
              const pathToView = {
                  '/': 'portal',
                  '/howto': 'howto',
                  '/effective': 'effective',
                  '/logic': 'logic',
                  '/contact': 'contact',
                  '/legal': 'legal',
                  '/privacy': 'privacy',
                  '/faq': 'faq',
                  '/price': 'price',
                  '/announcements': 'announcements',
                  '/dashboard': 'dashboard',
                  '/editor': 'editor'
              };
              if (pathToView[`/${page}`]) {
                  setView(page);
              } else {
                  setView('portal');
              }
          }
          // パス名から判定（クイズIDがない場合のみ）
          else if (!id) {
              const pathToView = {
                  '/': 'portal',
                  '/howto': 'howto',
                  '/effective': 'effective',
                  '/logic': 'logic',
                  '/contact': 'contact',
                  '/legal': 'legal',
                  '/privacy': 'privacy',
                  '/faq': 'faq',
                  '/price': 'price',
                  '/announcements': 'announcements',
                  '/dashboard': 'dashboard',
                  '/editor': 'editor'
              };
              if (pathToView[pathname]) {
                  setView(pathToView[pathname]);
              } else {
                  setView('portal');
              }
          }
          await fetchQuizzes();
      };
      init();
  }, []);

  // URLパラメータの変更を監視（ブラウザの戻る/進むボタンや直接URL入力に対応）
  useEffect(() => {
      let isInitialMount = true;
      
      const handleLocationChange = () => {
          // 初回マウント時は最初のuseEffectで処理されるのでスキップ
          if (isInitialMount) {
              isInitialMount = false;
              return;
          }
          
          const params = new URLSearchParams(window.location.search);
          const id = params.get('id');
          const pathname = window.location.pathname;
          
          // パス名からページを判定
          const pathToView = {
              '/': 'portal',
              '/howto': 'howto',
              '/effective': 'effective',
              '/logic': 'logic',
              '/contact': 'contact',
              '/legal': 'legal',
              '/privacy': 'privacy',
              '/faq': 'faq',
              '/price': 'price',
              '/announcements': 'announcements',
              '/dashboard': 'dashboard',
              '/editor': 'editor'
          };
          
          // クイズIDがある場合は、パス名のチェックより先にクイズを読み込む
          if (id && supabase) {
              console.log('handleLocationChange: クイズIDを検出しました:', id);
              const loadQuiz = async () => {
                  try {
                      // slug(文字列)で検索
                      let { data, error: slugError } = await supabase.from('quizzes').select('*').eq('slug', id).single();
                      
                      // slugで見つからない場合、ID(数値)で検索（互換性のため）
                      if (!data && !isNaN(id)) {
                         const res = await supabase.from('quizzes').select('*').eq('id', id).single();
                         data = res.data;
                         if (res.error && !res.data) {
                             console.error('クイズ検索エラー:', res.error);
                         }
                      } else if (slugError && !data) {
                          // データがなく、エラーがある場合のみログ出力（レコードが見つからない場合は警告のみ）
                          const isNotFoundError = slugError.message?.includes('No rows') || slugError.code === 'PGRST116';
                          if (!isNotFoundError) {
                              console.error('slug検索エラー:', slugError);
                          }
                      }

                      if(data) { 
                          console.log('handleLocationChange: クイズを読み込みました:', data.title);
                          setSelectedQuiz(data); 
                          setView('quiz'); 
                      } else {
                          console.warn(`handleLocationChange: クイズが見つかりませんでした (id: ${id})`);
                          setView('portal');
                          setSelectedQuiz(null);
                      }
                  } catch (error) {
                      console.error('handleLocationChange: クイズ読み込みエラー:', error);
                      setView('portal');
                      setSelectedQuiz(null);
                  }
              };
              loadQuiz();
          }
          // パス名から判定（クイズIDがない場合のみ）
          else if (pathToView[pathname]) {
              setView(pathToView[pathname]);
              if (pathToView[pathname] !== 'quiz') {
                  setSelectedQuiz(null);
              }
          } else {
              setView('portal');
              setSelectedQuiz(null);
          }
      };

      // popstateイベント（ブラウザの戻る/進むボタン）を監視
      window.addEventListener('popstate', handleLocationChange);
      
      return () => {
          window.removeEventListener('popstate', handleLocationChange);
      };
  }, [supabase]);


  // 画面遷移ハンドラ
  const navigateTo = async (newView, params = {}) => {
      let url = '/';
      
      // 各ページに固有のパスを設定
      const pathMap = {
          'portal': '/',
          'quiz': params.id ? `/?id=${params.id}` : '/',
          'editor': '/editor',
          'dashboard': '/dashboard',
          'howto': '/howto',
          'effective': '/effective',
          'logic': '/logic',
          'contact': '/contact',
          'legal': '/legal',
          'privacy': '/privacy',
          'faq': '/faq',
          'price': '/price',
          'announcements': '/announcements'
      };
      
      url = pathMap[newView] || '/';
      
      // クイズビューの場合、クイズデータを読み込む
      if (newView === 'quiz' && params.id && supabase) {
          try {
              // slug(文字列)で検索
              let { data, error: slugError } = await supabase.from('quizzes').select('*').eq('slug', params.id).single();
              
              // slugで見つからない場合、ID(数値)で検索（互換性のため）
              if (!data && !isNaN(params.id)) {
                 const res = await supabase.from('quizzes').select('*').eq('id', params.id).single();
                 data = res.data;
                 if (res.error && !res.data) {
                     console.error('クイズ検索エラー:', res.error);
                 }
              } else if (slugError && !data) {
                  // データがなく、エラーがある場合のみログ出力（レコードが見つからない場合は警告のみ）
                  const isNotFoundError = slugError.message?.includes('No rows') || slugError.code === 'PGRST116';
                  if (!isNotFoundError) {
                      console.error('slug検索エラー:', slugError);
                  }
              }

              if(data) { 
                  setSelectedQuiz(data); 
              } else {
                  console.warn(`クイズが見つかりませんでした (id: ${params.id})`);
                  // クイズが見つからない場合はポータルに戻る
                  window.history.pushState({ view: 'portal' }, '', '/');
                  setView('portal');
                  setSelectedQuiz(null);
                  return;
              }
          } catch (error) {
              console.error('クイズ読み込みエラー:', error);
              // エラーが発生した場合はポータルに戻る
              window.history.pushState({ view: 'portal' }, '', '/');
              setView('portal');
              setSelectedQuiz(null);
              return;
          }
      } else if (newView !== 'quiz') {
          // クイズ以外のビューに遷移する場合は、selectedQuizをクリア
          setSelectedQuiz(null);
      }
      
      window.history.pushState({ view: newView, ...params }, '', url);
      setView(newView);
  };

  // 保存処理
  const handleSave = async (form, id) => {
      if(!supabase) return;
      try {
          // 編集時の権限チェック
          if (id) {
              const { data: existingQuiz, error: fetchError } = await supabase
                  .from('quizzes')
                  .select('user_id')
                  .eq('id', id)
                  .single();
              
              if (fetchError) throw fetchError;
              
              // 管理者でない場合、かつ自分のクイズでない場合は編集不可
              if (!isAdmin && existingQuiz.user_id !== user?.id) {
                  alert('この診断クイズを編集する権限がありません。');
                  return;
              }
          }

          const payload = {
              title: form.title, 
              description: form.description, 
              category: form.category, 
              color: form.color,
              questions: form.questions, 
              results: form.results, 
              user_id: id ? undefined : (user?.id || null), // 編集時はuser_idを変更しない
              layout: form.layout || 'card',
              image_url: form.image_url || null,
              mode: form.mode || 'diagnosis',
              collect_email: form.collect_email || false
          };
          
          // 新規作成時、または編集時にURL再発行フラグがtrueの場合はSlugを生成
          if (!id && !form.slug) { 
              payload.slug = generateSlug(); 
          } else if (id && form.regenerateSlug) {
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
          
          const savedQuiz = result.data[0];
          
          // HTMLを生成してエックスサーバに自動転送（オプション機能、バックグラウンド処理）
          try {
              const htmlContent = generateQuizHTML(savedQuiz);
              const filename = `${savedQuiz.slug || savedQuiz.id}.html`;
              
              const uploadResponse = await fetch('/api/upload-html', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ htmlContent, filename })
              });
              
              const uploadResult = await uploadResponse.json();
              
              if (uploadResponse.ok && uploadResult.success) {
                  // 成功時はコンソールにログ出力（ユーザーには表示しない）
                  console.log('HTMLファイルをエックスサーバにアップロードしました:', uploadResult.url);
              } else if (uploadResult.skipped) {
                  // 環境変数が設定されていない場合は、コンソールにログ出力のみ
                  console.log('エックスサーバの設定が未設定のため、HTMLアップロードをスキップしました');
              } else {
                  // アップロードに失敗した場合（接続エラーなど）、コンソールに警告出力
                  console.warn('HTMLファイルのアップロードに失敗しました:', uploadResult.error);
              }
          } catch (uploadError) {
              // アップロードエラーは保存を妨げない（ネットワークエラーなど）、コンソールにエラー出力
              console.error('HTMLアップロードエラー:', uploadError);
          }
          
          await fetchQuizzes();
          
          return savedQuiz.slug || savedQuiz.id;
          
      } catch(e) { 
          alert('保存エラー: ' + e.message); 
      }
  };

  // 削除処理
  const handleDelete = async (id) => {
      if(!confirm('本当に削除しますか？')) return;
      try {
          // 権限チェック
          const { data: existingQuiz, error: fetchError } = await supabase
              .from('quizzes')
              .select('user_id, title')
              .eq('id', id)
              .single();
          
          if (fetchError) throw fetchError;
          
          // 管理者でない場合、かつ自分のクイズでない場合は削除不可
          if (!isAdmin && existingQuiz.user_id !== user?.id) {
              alert('この診断クイズを削除する権限がありません。');
              return;
          }
          
          const { error } = await supabase.from('quizzes').delete().eq('id', id);
          if(error) throw error;
          alert('削除しました');
          await fetchQuizzes();
      } catch(e) {
          alert('削除エラー: ' + e.message);
      }
  };

  // ローディング画面
  if (view === 'loading') {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-indigo-600">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="font-bold">読み込み中...</p>
          </div>
      );
  }

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
        
        <AuthModal isOpen={showAuth} onClose={()=>setShowAuth(false)} setUser={setUser} isPasswordReset={showPasswordReset} onNavigate={(view) => navigateTo(view)} />
        
        {view === 'portal' && (
            <Portal 
                quizzes={quizzes} 
                isLoading={isLoading} 
                user={user} 
                setShowAuth={setShowAuth} 
                onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} 
                onPlay={(q)=>{ setSelectedQuiz(q); navigateTo('quiz', { id: q.slug || q.id }); }} 
                onCreate={()=>{ setEditingQuiz(null); navigateTo('editor'); }} 
                setPage={(p) => navigateTo(p)} 
                onEdit={(q)=>{ setEditingQuiz(q); navigateTo('editor'); }} 
                onDelete={handleDelete} 
                isAdmin={isAdmin}
            />
        )}
        
        {view === 'dashboard' && (
            <Dashboard 
                user={user} 
                isAdmin={isAdmin} // 管理者権限を渡す
                setPage={(p) => navigateTo(p)} 
                onLogout={async ()=>{ await supabase.auth.signOut(); navigateTo('portal');}} 
                onEdit={(q)=>{setEditingQuiz(q); navigateTo('editor');}} 
                onDelete={handleDelete} 
            />
        )}
        
        {/* 静的ページ群 */}
        {view === 'effective' && <EffectiveUsePage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'logic' && <QuizLogicPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'howto' && <HowToPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        
        {/* お知らせ */}
        {view === 'announcements' && <AnnouncementsPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        
        {/* お問い合わせ・規約関連 */}
        {view === 'contact' && <ContactPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'legal' && <LegalPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'privacy' && <PrivacyPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        
        {/* レガシー互換 */}
        {view === 'faq' && <FaqPage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        {view === 'price' && <PricePage onBack={()=>navigateTo('portal')} isAdmin={isAdmin} setPage={(p) => navigateTo(p)} user={user} onLogout={async ()=>{ await supabase.auth.signOut(); alert('ログアウトしました'); }} setShowAuth={setShowAuth} />}
        
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
                isAdmin={isAdmin}
                initialData={editingQuiz}
                setPage={(p, params) => navigateTo(p, params || {})}
                onBack={()=>{ navigateTo('portal'); setEditingQuiz(null);}} 
                onSave={handleSave}
                setShowAuth={setShowAuth}
            />
        )}
    </div>
  );
};

export default App;