import React, { useState, useEffect } from 'react';
import { User, LayoutDashboard, LogOut, Loader2, Play, ExternalLink, Edit3, Trash2, Trophy, MessageCircle, Layout, Table, BarChart2, Download, ShoppingCart, CheckCircle, Code, Users, Lock, Copy, Bell, Plus, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from './Header';
import Footer from './Footer';
import { supabase } from '../lib/supabase';
import { generateQuizHTML } from '../lib/htmlGenerator';
import { generateSlug } from '../lib/utils';

// ★修正: isAdmin を受け取るように変更
const Dashboard = ({ user, onEdit, onDelete, setPage, onLogout, isAdmin }) => {
    useEffect(() => { 
        document.title = "マイページ | 診断クイズメーカー"; 
        window.scrollTo(0, 0);
    }, []);
    const [myQuizzes, setMyQuizzes] = useState([]);
    const [purchases, setPurchases] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [processingId, setProcessingId] = useState(null);
    
    // お知らせ管理用のステート（管理者のみ）
    const [announcements, setAnnouncements] = useState([]);
    const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [announcementForm, setAnnouncementForm] = useState({
        title: '',
        content: '',
        link_url: '',
        link_text: '',
        is_active: true,
        announcement_date: ''
    });

    const fetchMyQuizzes = async () => {
        if(!user) return;
        // 管理者の場合はすべてのクイズを取得、それ以外は自分のクイズのみ
        const query = isAdmin 
            ? supabase.from('quizzes').select('*').order('created_at', { ascending: false })
            : supabase.from('quizzes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        
        const { data: quizzes } = await query;
        setMyQuizzes(quizzes || []);
    };

    // 削除ハンドラをラップして、削除後にリストを再取得
    const handleDeleteWithRefresh = async (id) => {
        try {
            await onDelete(id);
            // 削除後にリストを再取得（少し待ってから実行）
            setTimeout(async () => {
                await fetchMyQuizzes();
            }, 100);
        } catch (error) {
            console.error('削除エラー:', error);
            // エラーが発生してもリストを再取得（削除が部分的に成功した可能性があるため）
            await fetchMyQuizzes();
        }
    };

    useEffect(() => {
        const init = async () => {
            if(!user) return;
            await fetchMyQuizzes();

            const { data: bought } = await supabase.from('purchases').select('quiz_id').eq('user_id', user.id);
            setPurchases(bought?.map(p => p.quiz_id) || []);

            const params = new URLSearchParams(window.location.search);
            if (params.get('payment') === 'success' && params.get('session_id')) {
                const quizId = params.get('quiz_id');
                await verifyPayment(params.get('session_id'), quizId);
                window.history.replaceState(null, '', window.location.pathname);
            }

            // 管理者の場合、お知らせを取得
            if (isAdmin) {
                await fetchAnnouncements();
            }

            setLoading(false);
        };
        init();
    }, [user, isAdmin]);

    const verifyPayment = async (sessionId, quizId) => {
        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, quizId, userId: user.id }),
            });
            if (res.ok) {
                alert('寄付ありがとうございます！Pro機能（HTML・埋め込み・リスト）が開放されました。');
                setPurchases(prev => [...prev, parseInt(quizId)]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handlePurchase = async (quiz) => {
        const inputPrice = window.prompt(`「${quiz.title}」のPro機能を開放します。\n\n応援・寄付金額を入力してください（500円〜50,000円）。`, "1000");
        if (inputPrice === null) return;
        const price = parseInt(inputPrice, 10);
        if (isNaN(price) || price < 500 || price > 50000) {
            alert("金額は 500円以上、50,000円以下 の半角数字で入力してください。");
            return;
        }

        setProcessingId(quiz.id);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId: quiz.id,
                    quizTitle: quiz.title,
                    userId: user.id,
                    email: user.email,
                    price: price 
                }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('決済URLの取得に失敗しました');
            }
        } catch (e) {
            alert('エラー: ' + e.message);
            setProcessingId(null);
        }
    };

    const handleDownload = (quiz) => {
        const htmlContent = generateQuizHTML(quiz);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${quiz.title || 'quiz'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleEmbed = (quiz, isUnlocked) => {
        if (!isUnlocked) return alert("この機能を利用するには、寄付（購入）によるロック解除が必要です。");
        const url = `${window.location.origin}?id=${quiz.slug || quiz.id}`;
        const code = `<iframe src="${url}" width="100%" height="600" style="border:none; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
        navigator.clipboard.writeText(code);
        alert('埋め込みコードをコピーしました！\n\nWordPressなどの「カスタムHTML」ブロックに貼り付けてください。');
    };

    const handleDownloadLeads = async (quiz, isUnlocked) => {
        if (!isUnlocked) return alert("この機能を利用するには、寄付（購入）によるロック解除が必要です。");
        const { data, error } = await supabase.from('quiz_leads').select('email, created_at').eq('quiz_id', quiz.id);
        if(error || !data || data.length === 0) return alert('まだ登録されたメールアドレスはありません。');
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Email,Registered At\n"
            + data.map(row => `${row.email},${new Date(row.created_at).toLocaleString()}`).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `leads_${quiz.title}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const handleDuplicate = async (quiz) => {
        if(!confirm(`「${quiz.title}」を複製しますか？`)) return;
        try {
            const newSlug = generateSlug();
            const { error } = await supabase.from('quizzes').insert([{
                user_id: user.id,
                title: `${quiz.title} のコピー`,
                description: quiz.description,
                questions: quiz.questions,
                results: quiz.results,
                category: quiz.category,
                mode: quiz.mode,
                layout: quiz.layout,
                color: quiz.color,
                image_url: quiz.image_url,
                collect_email: quiz.collect_email,
                slug: newSlug
            }]);
            
            if(error) throw error;
            alert('複製しました！');
            await fetchMyQuizzes();
        } catch(e) {
            alert('複製エラー: ' + e.message);
        }
    };

    // お知らせ関連の関数（管理者のみ）
    const fetchAnnouncements = async () => {
        if (!supabase || !isAdmin) return;
        try {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setAnnouncements(data || []);
        } catch (e) {
            console.error('お知らせの取得エラー:', e);
            alert('お知らせの取得に失敗しました: ' + e.message);
        }
    };

    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        if (!supabase || !isAdmin) return;
        
        try {
            const payload = {
                title: announcementForm.title,
                content: announcementForm.content,
                link_url: announcementForm.link_url || null,
                link_text: announcementForm.link_text || null,
                is_active: announcementForm.is_active,
                announcement_date: announcementForm.announcement_date || null
            };

            if (editingAnnouncement) {
                const { error } = await supabase
                    .from('announcements')
                    .update(payload)
                    .eq('id', editingAnnouncement.id);
                if (error) throw error;
                alert('お知らせを更新しました');
            } else {
                const { error } = await supabase
                    .from('announcements')
                    .insert([payload]);
                if (error) throw error;
                alert('お知らせを作成しました');
            }

            setShowAnnouncementForm(false);
            setEditingAnnouncement(null);
            setAnnouncementForm({
                title: '',
                content: '',
                link_url: '',
                link_text: '',
                is_active: true,
                announcement_date: ''
            });
            await fetchAnnouncements();
        } catch (e) {
            alert('エラー: ' + e.message);
        }
    };

    const handleEditAnnouncement = (announcement) => {
        setEditingAnnouncement(announcement);
        // announcement_dateが存在する場合はそれを使用、なければcreated_atを使用
        const displayDate = announcement.announcement_date 
            ? new Date(announcement.announcement_date).toISOString().split('T')[0]
            : (announcement.created_at ? new Date(announcement.created_at).toISOString().split('T')[0] : '');
        setAnnouncementForm({
            title: announcement.title,
            content: announcement.content,
            link_url: announcement.link_url || '',
            link_text: announcement.link_text || '',
            is_active: announcement.is_active,
            announcement_date: displayDate
        });
        setShowAnnouncementForm(true);
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!confirm('本当に削除しますか？')) return;
        if (!supabase || !isAdmin) return;
        
        try {
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);
            if (error) throw error;
            alert('削除しました');
            await fetchAnnouncements();
        } catch (e) {
            alert('削除エラー: ' + e.message);
        }
    };

    const graphData = myQuizzes.map(q => ({
        name: q.title.length > 10 ? q.title.substring(0, 10)+'...' : q.title,
        views: q.views_count || 0,
        completions: q.completions_count || 0,
        clicks: q.clicks_count || 0
    }));

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} />
            <div className="max-w-6xl mx-auto py-12 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2"><LayoutDashboard/> マイページ</h1>
                    <button onClick={onLogout} className="text-gray-500 hover:text-red-500 font-bold flex items-center gap-1 text-sm"><LogOut size={16}/> ログアウト</button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600"><User size={24}/></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold">ログイン中 {isAdmin && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] ml-1">ADMIN</span>}</p>
                                    <p className="text-sm font-bold text-gray-900 break-all">{user?.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-2xl font-extrabold text-indigo-600">{myQuizzes.length}</div>
                                    <div className="text-xs text-gray-500 font-bold">作成数</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="text-2xl font-extrabold text-green-600">
                                        {myQuizzes.reduce((acc, q) => acc + (q.views_count||0), 0)}
                                    </div>
                                    <div className="text-xs text-gray-500 font-bold">総PV数</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[350px]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Trophy size={18}/> アクセス解析</h3>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button onClick={()=>setViewMode('graph')} className={`p-1.5 rounded ${viewMode==='graph'?'bg-white shadow text-indigo-600':'text-gray-400'}`}><BarChart2 size={16}/></button>
                                    <button onClick={()=>setViewMode('table')} className={`p-1.5 rounded ${viewMode==='table'?'bg-white shadow text-indigo-600':'text-gray-400'}`}><Table size={16}/></button>
                                </div>
                            </div>
                            {myQuizzes.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">データがありません</div>
                            ) : viewMode === 'graph' ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={graphData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{fontSize: 10}} height={50} interval={0} angle={-30} textAnchor="end"/>
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="views" name="閲覧数" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="completions" name="完了数" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="clicks" name="クリック" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 bg-gray-50">タイトル</th>
                                                <th className="px-4 py-3 text-right bg-gray-50">閲覧数</th>
                                                <th className="px-4 py-3 text-right bg-gray-50">完了数</th>
                                                <th className="px-4 py-3 text-right bg-gray-50">完了率</th>
                                                <th className="px-4 py-3 text-right bg-gray-50">クリック</th>
                                                <th className="px-4 py-3 text-right bg-gray-50">CTR</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myQuizzes.map(q => {
                                                const rate = q.views_count > 0 ? Math.round((q.completions_count||0)/q.views_count*100) : 0;
                                                const ctr = q.completions_count > 0 ? Math.round((q.clicks_count||0)/q.completions_count*100) : 0;
                                                return (
                                                    <tr key={q.id} className="border-b hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[150px]">{q.title}</td>
                                                        <td className="px-4 py-3 text-right">{q.views_count||0}</td>
                                                        <td className="px-4 py-3 text-right">{q.completions_count||0}</td>
                                                        <td className="px-4 py-3 text-right text-orange-600 font-bold">{rate}%</td>
                                                        <td className="px-4 py-3 text-right">{q.clicks_count||0}</td>
                                                        <td className="px-4 py-3 text-right text-green-600 font-bold">{ctr}%</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 管理者向けお知らせ管理セクション */}
                {isAdmin && (
                    <div className="mt-12">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black border-l-4 border-red-600 pl-4 flex items-center gap-2">
                                <Bell size={20} className="text-red-600"/> お知らせ管理
                                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
                            </h2>
                            <button 
                                onClick={() => {
                                    setEditingAnnouncement(null);
                                    setAnnouncementForm({
                                        title: '',
                                        content: '',
                                        link_url: '',
                                        link_text: '',
                                        is_active: true,
                                        announcement_date: ''
                                    });
                                    setShowAnnouncementForm(true);
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Plus size={16}/> 新規作成
                            </button>
                        </div>

                        {showAnnouncementForm && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900">
                                        {editingAnnouncement ? 'お知らせを編集' : '新規お知らせを作成'}
                                    </h3>
                                    <button 
                                        onClick={() => {
                                            setShowAnnouncementForm(false);
                                            setEditingAnnouncement(null);
                                            setAnnouncementForm({
                                                title: '',
                                                content: '',
                                                link_url: '',
                                                link_text: '',
                                                is_active: true,
                                                announcement_date: ''
                                            });
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={20}/>
                                    </button>
                                </div>
                                <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">タイトル *</label>
                                        <input
                                            type="text"
                                            required
                                            value={announcementForm.title}
                                            onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})}
                                            className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                                            placeholder="お知らせのタイトル"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">内容 *</label>
                                        <textarea
                                            required
                                            value={announcementForm.content}
                                            onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})}
                                            className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900 h-32"
                                            placeholder="お知らせの内容"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">リンクURL（オプション）</label>
                                            <input
                                                type="url"
                                                value={announcementForm.link_url}
                                                onChange={e => setAnnouncementForm({...announcementForm, link_url: e.target.value})}
                                                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">リンクテキスト（オプション）</label>
                                            <input
                                                type="text"
                                                value={announcementForm.link_text}
                                                onChange={e => setAnnouncementForm({...announcementForm, link_text: e.target.value})}
                                                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                                                placeholder="詳細はこちら"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">表示日付</label>
                                            <input
                                                type="date"
                                                value={announcementForm.announcement_date}
                                                onChange={e => setAnnouncementForm({...announcementForm, announcement_date: e.target.value})}
                                                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">空欄の場合は作成日時が表示されます</p>
                                        </div>
                                        <div className="flex items-center gap-2 pt-8">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={announcementForm.is_active}
                                                onChange={e => setAnnouncementForm({...announcementForm, is_active: e.target.checked})}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                                            />
                                            <label htmlFor="is_active" className="text-sm font-bold text-gray-700">表示する</label>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            {editingAnnouncement ? '更新する' : '作成する'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAnnouncementForm(false);
                                                setEditingAnnouncement(null);
                                                setAnnouncementForm({
                                                    title: '',
                                                    content: '',
                                                    link_url: '',
                                                    link_text: '',
                                                    is_active: true
                                                });
                                            }}
                                            className="px-6 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            キャンセル
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            {announcements.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    お知らせがありません
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">タイトル</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">状態</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">作成日</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {announcements.map(announcement => (
                                                <tr key={announcement.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{announcement.title}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                            announcement.is_active 
                                                                ? 'bg-green-100 text-green-700' 
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {announcement.is_active ? '表示中' : '非表示'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 text-xs">
                                                        {announcement.announcement_date 
                                                            ? new Date(announcement.announcement_date).toLocaleDateString('ja-JP')
                                                            : new Date(announcement.created_at).toLocaleDateString('ja-JP')
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEditAnnouncement(announcement)}
                                                                className="text-indigo-600 hover:text-indigo-700 font-bold text-xs"
                                                            >
                                                                編集
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                                className="text-red-600 hover:text-red-700 font-bold text-xs"
                                                            >
                                                                削除
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-12">
                    <h2 className="text-xl font-bold text-black mb-4 border-l-4 border-indigo-600 pl-4 flex items-center gap-2">
                        {isAdmin ? '全診断リスト（管理者）' : '作成した診断リスト'}
                        {isAdmin && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>}
                    </h2>
                    {loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-indigo-600"/></div> : (
                        myQuizzes.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-4">まだ診断を作成していません。</p>
                                <button onClick={()=>setPage('editor')} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700">新規作成する</button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myQuizzes.map(quiz => {
                                    // ★修正: 購入済み または 管理者 ならアンロック
                                    const isUnlocked = purchases.includes(quiz.id) || isAdmin;
                                    
                                    return (
                                    <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative group">
                                        <div className={`h-32 w-full overflow-hidden relative ${quiz.color || 'bg-indigo-600'}`}>
                                            {quiz.image_url && <img src={quiz.image_url} alt={quiz.title} className="w-full h-full object-cover"/>}
                                            <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                                                {quiz.layout === 'chat' ? <><MessageCircle size={10}/> Chat</> : <><Layout size={10}/> Card</>}
                                            </span>
                                            {quiz.collect_email && (
                                                <span className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                                                    <Users size={10}/> Leads
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg mb-2 line-clamp-1 text-black">{quiz.title}</h3>
                                            <div className="flex gap-4 text-xs text-gray-500 font-bold mb-2">
                                                <span className="flex items-center gap-1"><Play size={12}/> {quiz.views_count||0}</span>
                                                <span className="flex items-center gap-1"><ExternalLink size={12}/> {quiz.clicks_count||0}</span>
                                            </div>
                                            
                                            {/* URL表示とコピー */}
                                            <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={`${window.location.origin}?id=${quiz.slug || quiz.id}`}
                                                        readOnly
                                                        className="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 truncate"
                                                    />
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(`${window.location.origin}?id=${quiz.slug || quiz.id}`);
                                                            alert('URLをコピーしました！');
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-700 p-1"
                                                    >
                                                        <Copy size={14}/>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2 mb-2">
                                                <button onClick={()=>onEdit(quiz)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1"><Edit3 size={14}/> 編集</button>
                                                <button onClick={()=>handleDuplicate(quiz)} className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1"><Copy size={14}/> 複製</button>
                                            </div>

                                            <button onClick={()=>handleEmbed(quiz, isUnlocked)} className={`w-full mb-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${isUnlocked ? 'bg-blue-50 hover:bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {isUnlocked ? <Code size={14}/> : <Lock size={14}/>} 埋め込み
                                            </button>

                                            {quiz.collect_email && (
                                                <button onClick={()=>handleDownloadLeads(quiz, isUnlocked)} className={`w-full mb-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${isUnlocked ? 'bg-green-50 hover:bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                    {isUnlocked ? <Download size={14}/> : <Lock size={14}/>} アドレス帳(CSV)
                                                </button>
                                            )}

                                            <div className="flex gap-2 mb-2">
                                                <button onClick={()=>handleDeleteWithRefresh(quiz.id)} className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1"><Trash2 size={14}/> 削除</button>
                                            </div>
                                            
                                            {isUnlocked ? (
                                                <button onClick={()=>handleDownload(quiz)} className="w-full bg-green-500 text-white py-2 rounded-lg font-bold text-xs hover:bg-green-600 flex items-center justify-center gap-1 animate-pulse">
                                                    <CheckCircle size={14}/> HTMLダウンロード
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={()=>handlePurchase(quiz)} disabled={processingId === quiz.id} className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold text-xs hover:bg-orange-600 flex items-center justify-center gap-1">
                                                        {processingId === quiz.id ? <Loader2 className="animate-spin" size={14}/> : <ShoppingCart size={14}/>}
                                                        機能開放 / 寄付
                                                    </button>
                                                    <p className="text-[10px] text-gray-500 text-center mt-1">※機能を開放するにはアカウント登録が必要です。</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>
            </div>
            <Footer setPage={setPage} onCreate={()=>setPage('editor')} user={user} setShowAuth={()=>{}} />
        </div>
    );
};

export default Dashboard;
