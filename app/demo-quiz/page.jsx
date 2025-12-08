"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import QuizPlayer from '../../components/QuizPlayer';
import { Loader2, RefreshCw, Home } from 'lucide-react';

const DemoQuizPage = () => {
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // テンプレートクイズをランダムに取得
  const fetchRandomTemplateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error('データベース接続エラー');
      }

      // テンプレートクイズを全件取得（is_template = true のクイズ）
      // もしis_templateカラムがない場合は、特定のユーザーIDや条件で絞り込む
      const { data, error: fetchError } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('クイズ取得エラー:', fetchError);
        throw new Error('クイズの取得に失敗しました');
      }

      if (!data || data.length === 0) {
        throw new Error('デモクイズが見つかりませんでした');
      }

      // ランダムに1つ選択
      const randomIndex = Math.floor(Math.random() * data.length);
      const selectedQuiz = data[randomIndex];
      
      setQuiz(selectedQuiz);
    } catch (err) {
      console.error('デモクイズ読み込みエラー:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomTemplateQuiz();
  }, []);

  const handleBack = () => {
    router.push('/');
  };

  const handleRetry = () => {
    fetchRandomTemplateQuiz();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-gray-600 font-bold">デモクイズを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4">
            <button 
              onClick={handleRetry}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> 再読み込み
            </button>
            <button 
              onClick={handleBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Home size={18} /> トップへ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-gray-600 mb-6">デモクイズが見つかりませんでした</p>
          <button 
            onClick={handleBack}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Home size={18} /> トップへ戻る
          </button>
        </div>
      </div>
    );
  }

  return <QuizPlayer quiz={quiz} onBack={handleBack} />;
};

export default DemoQuizPage;
