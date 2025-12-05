import React, { useState } from 'react';
import { Sparkles, User, LayoutDashboard, TrendingUp, Menu, X, LogOut, HelpCircle, FileText, Lightbulb } from 'lucide-react';

const Header = ({ setPage, user, onLogout, setShowAuth }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNav = (page) => {
        setPage(page);
        setIsMenuOpen(false);
    };

    return (
        <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="font-bold text-xl flex items-center gap-2 text-indigo-700 cursor-pointer" onClick={()=>handleNav('portal')}>
                    <Sparkles className="text-pink-500"/> 診断クイズメーカー
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-4 text-sm font-bold text-gray-600">
                    <button onClick={()=>handleNav('logic')} className="hover:text-orange-500 flex items-center gap-1"><Lightbulb size={16}/> 作り方のコツ</button>
                    <button onClick={()=>handleNav('effective')} className="hover:text-indigo-600 flex items-center gap-1"><TrendingUp size={16}/> 活用法</button>
                    <button onClick={()=>handleNav('faq')} className="hover:text-indigo-600">よくある質問</button>
                    {user ? (
                        <button onClick={()=>handleNav('dashboard')} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-indigo-100 transition-colors">
                            <LayoutDashboard size={16}/> マイページ
                        </button>
                    ) : (
                        <button onClick={()=>setShowAuth(true)} className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2">
                            <User size={16}/> ログイン
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-gray-600 p-2" onClick={()=>setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={28}/> : <Menu size={28}/>}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t absolute w-full left-0 top-16 shadow-xl py-4 px-6 flex flex-col gap-4 animate-fade-in z-50">
                    <button onClick={()=>handleNav('logic')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-orange-600 font-bold"><Lightbulb size={20}/> 売れる診断の作り方</button>
                    <button onClick={()=>handleNav('effective')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-700 font-bold"><TrendingUp size={20}/> 効果的な活用法</button>
                    <button onClick={()=>handleNav('howto')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-700 font-bold"><FileText size={20}/> 作り方・規約</button>
                    <button onClick={()=>handleNav('faq')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-700 font-bold"><HelpCircle size={20}/> よくある質問</button>
                    
                    {user ? (
                        <>
                            <button onClick={()=>handleNav('dashboard')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-indigo-700 font-bold"><LayoutDashboard size={20}/> マイページ</button>
                            <button onClick={()=>{onLogout(); setIsMenuOpen(false);}} className="flex items-center gap-3 py-3 text-red-600 font-bold"><LogOut size={20}/> ログアウト</button>
                        </>
                    ) : (
                        <button onClick={()=>{setShowAuth(true); setIsMenuOpen(false);}} className="bg-black text-white w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2">
                            <User size={20}/> ログイン / 新規登録
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Header;