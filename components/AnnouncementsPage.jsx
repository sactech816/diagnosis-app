import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { supabase } from '../lib/supabase';

const AnnouncementsPage = ({ onBack, isAdmin, setPage, user, onLogout, setShowAuth }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "お知らせ | 診断クイズメーカー";
        window.scrollTo(0, 0);
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setAnnouncements(data || []);
        } catch (e) {
            console.error('お知らせの取得エラー:', e);
            alert('お知らせの取得に失敗しました: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            
            <div className="flex-grow">
                <div className="max-w-4xl mx-auto py-12 px-4">
                    <button 
                        onClick={onBack} 
                        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-bold mb-8 transition-colors"
                    >
                        <ArrowLeft size={20} /> トップに戻る
                    </button>

                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">お知らせ</h1>
                    <p className="text-gray-600 mb-8">最新の情報やお知らせをお届けします</p>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <p className="mt-4 text-gray-500">読み込み中...</p>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                            <p className="text-gray-500 font-bold">現在、お知らせはありません</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {announcements.map((announcement) => (
                                <div 
                                    key={announcement.id} 
                                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h2 className="text-xl font-bold text-gray-900">{announcement.title}</h2>
                                        <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap ml-4">
                                            <Calendar size={14} />
                                            {new Date(announcement.created_at).toLocaleDateString('ja-JP', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    
                                    <div className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                                        {announcement.content}
                                    </div>

                                    {announcement.link_url && (
                                        <a 
                                            href={announcement.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors"
                                        >
                                            {announcement.link_text || '詳細はこちら'}
                                            <ExternalLink size={16} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer setPage={setPage} onCreate={()=>setPage('editor')} user={user} setShowAuth={setShowAuth} />
        </div>
    );
};

export default AnnouncementsPage;

