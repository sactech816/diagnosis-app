import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Briefcase, GraduationCap, Sparkles, TrendingUp, Share2, Search, Megaphone } from 'lucide-react';
import Header from './Header';
import SEO from './SEO';

// --- Effective Use Page (New!) ---
export const EffectiveUsePage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { document.title = "効果的な使い方・メリット | 診断クイズメーカー"; }, []);
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            
            {/* Hero */}
            <div className="bg-indigo-900 text-white py-16 px-6 text-center">
                <h1 className="text-3xl font-extrabold mb-4">作って終わりじゃない！<br/>診断クイズの<span className="text-yellow-300">効果的な活用法</span></h1>
                <p className="text-indigo-200 max-w-xl mx-auto">
                    作成した診断コンテンツは、拡散させて初めて価値を発揮します。<br/>
                    SEO対策からAI検索まで、ポータル掲載のメリットを最大限に活かす方法をご紹介します。
                </p>
            </div>

            <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600 mb-4"><ArrowLeft size={16}/> 戻る</button>

                {/* Section 1: SNS */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-shrink-0 bg-blue-100 p-6 rounded-full text-blue-600">
                        <Share2 size={40}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">1. SNSで拡散して「認知」を広げる</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            診断結果は「自分語り」ができる最高のコンテンツです。ユーザーは面白い結果が出ると、思わずシェアしたくなります。
                        </p>
                        <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 font-bold">
                            💡 ポイント：X（Twitter）やInstagramのストーリーズにURLを貼るだけで、あなたのフォロワーが勝手に拡散してくれます。
                        </div>
                    </div>
                </section>

                {/* Section 2: SEO & AI */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-shrink-0 bg-purple-100 p-6 rounded-full text-purple-600">
                        <Search size={40}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">2. ポータル掲載で「SEO & AI対策」</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            このポータルサイトはGoogle検索やAI（ChatGPTなど）に認識されやすい構造で作られています。あなたの診断が掲載されるだけで、あなたのビジネス名やリンクがウェブ上の「信頼できる情報源」として蓄積されます。
                        </p>
                        <div className="bg-purple-50 p-4 rounded-xl text-sm text-purple-800 font-bold">
                            💡 ポイント：結果ページにあなたのLPや公式サイトへのリンクを設定することで、被リンク効果（SEO）も期待できます。
                        </div>
                    </div>
                </section>

                {/* Section 3: Business */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-shrink-0 bg-green-100 p-6 rounded-full text-green-600">
                        <Megaphone size={40}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">3. 自然な流れで「リスト獲得」</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            いきなり商品を売るのではなく、「診断結果のアドバイス」としてLINE公式アカウントやメルマガへ誘導することで、登録率が劇的にアップします。
                        </p>
                        <div className="bg-green-50 p-4 rounded-xl text-sm text-green-800 font-bold">
                            💡 ポイント：結果ページのボタンに「LINEで詳しい解説を見る」と設定するのが鉄板の成功パターンです。
                        </div>
                    </div>
                </section>

                <div className="text-center pt-8">
                    <button onClick={()=>setPage('portal')} className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105">
                        さっそく診断を作ってみる
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- FAQ Page ---
export const FaqPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { document.title = "よくある質問 | 診断クイズメーカー"; }, []);
    const [openIndex, setOpenIndex] = useState(null);
    const faqs = [
        { category: "一般・全般", q: "無料で使えますか？", a: "はい、現在はβ版としてすべての機能を無料で公開しています。" },
        { category: "一般・全般", q: "商用利用は可能ですか？", a: "可能です。作成したコンテンツは、ご自身のビジネス（LINE誘導、集客）や教育現場で自由にご活用ください。" },
        { category: "作成機能", q: "どんな種類のクイズが作れますか？", a: "①「ビジネス診断（点数加算型）」、②「学習・検定（正解数判定型）」、③「占い（ランダム結果型）」の3種類を作成可能です。" },
        { category: "作成機能", q: "チャット風のデザインとは？", a: "LINEのような会話形式で進行するUIです。スマホでの閲覧時に、まるでチャットをしているような感覚で診断を楽しめます。" },
        { category: "操作・作成", q: "作った診断を修正したいのですが", a: "ログインして作成した場合、右上の「マイページ」から編集・削除が可能です。" },
    ];
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="max-w-3xl mx-auto py-12 px-4">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">よくある質問</h1>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full px-6 py-4 text-left font-bold text-gray-800 flex justify-between items-center hover:bg-gray-50">
                                <span className="flex items-center gap-3"><span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">{faq.category}</span>{faq.q}</span>
                                {openIndex === i ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                            </button>
                            {openIndex === i && <div className="px-6 py-4 bg-gray-50 text-gray-600 text-sm leading-relaxed border-t border-gray-100">{faq.a}</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Price Page ---
export const PricePage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { document.title = "料金プラン | 診断クイズメーカー"; }, []);
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600 mx-auto"><ArrowLeft size={16}/> トップへ戻る</button>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">料金プラン</h1>
                    <p className="text-gray-600 mb-12">現在はベータ版のため、基本機能はすべて無料でご利用いただけます。</p>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-indigo-500 relative transform scale-105 z-10">
                            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold">BETA FREE</span>
                            <h3 className="text-2xl font-bold mb-2 text-gray-900">Standard</h3>
                            <div className="text-4xl font-extrabold mb-4 text-gray-900">¥0<span className="text-sm font-medium text-gray-500">/月</span></div>
                            <ul className="space-y-3 mb-8 text-sm text-gray-600">
                                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/>診断作成数 無制限</li>
                                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/>AI自動生成機能</li>
                                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/>簡易アクセス解析</li>
                            </ul>
                            <button className="w-full py-3 rounded-lg font-bold bg-indigo-600 text-white">現在のプラン</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HowTo Page ---
export const HowToPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { document.title = "使い方・規約 | 診断クイズメーカー"; }, []);
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="py-12 px-4 max-w-3xl mx-auto">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">診断クイズの作り方</h1>
                <div className="space-y-8 text-gray-800 leading-relaxed">
                    
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Briefcase className="text-indigo-600"/> 1. ビジネス診断の作り方</h2>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <p className="mb-2 text-sm font-bold text-indigo-800">例：「あなたのリーダータイプ診断」</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                <li><strong>配点方式:</strong> 選択肢ごとにA, B, Cの「点数」を割り振ります。</li>
                                <li><strong>結果判定:</strong> 最終的に最も点数が高かったタイプの結果が表示されます。</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><GraduationCap className="text-orange-500"/> 2. 学習・検定の作り方</h2>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <p className="mb-2 text-sm font-bold text-orange-800">例：「中学歴史マスター検定」</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                <li><strong>正解設定:</strong> 正解の選択肢にチェックを入れます。</li>
                                <li><strong>結果判定:</strong> 正解数に応じて「高得点」「中得点」「低得点」の結果が表示されます。</li>
                                <li><strong>演出:</strong> 回答時に「正解！」などのフィードバックが出ます。</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Sparkles className="text-purple-600"/> 3. 占いの作り方</h2>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <p className="mb-2 text-sm font-bold text-purple-800">例：「今日のラッキーアイテム占い」</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                <li><strong>ランダム:</strong> 質問への回答に関わらず、結果はランダムに選ばれます。</li>
                                <li><strong>手軽さ:</strong> 複雑なロジックなしで、おみくじのようなコンテンツが作れます。</li>
                            </ul>
                        </div>
                    </section>

                    <div className="border-t pt-8 mt-8">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">利用規約・免責事項</h2>
                        <ul className="list-disc pl-5 space-y-3 text-sm text-gray-600">
                            <li><strong>ツール本体について:</strong> 本書購入者様のみご利用可能です。</li>
                            <li><strong>作成したコンテンツの利用:</strong> 個人・商用を問わず自由にご利用いただけます。フッターのコピーライト表記は削除しないでください。</li>
                            <li><strong>免責事項:</strong> 本ツールの利用によって生じたいかなる損害についても、提供者は一切の責任を負いません。</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Quiz Logic Page (New!) ---
export const QuizLogicPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { document.title = "バズる診断の作り方 | 診断クイズメーカー"; }, []);
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            
            <div className="bg-orange-500 text-white py-16 px-6 text-center">
                <h1 className="text-3xl font-extrabold mb-4">思わずシェアしたくなる！<br/><span className="text-yellow-200">「売れる診断」</span>の鉄板ロジック</h1>
                <p className="text-orange-100 max-w-xl mx-auto">
                    診断クイズは「適当」に作っても効果が出ません。<br/>
                    人が動く心理トリガーを押さえた構成の作り方を伝授します。
                </p>
            </div>

            <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-500 font-bold hover:text-orange-600 mb-4"><ArrowLeft size={16}/> 戻る</button>

                {/* Logic 1: Target */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Target size={32}/></div>
                        <h2 className="text-2xl font-bold text-gray-900">1. 「誰の・どんな不安」を解消するか決める</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        人は「自分のこと」にしか興味がありません。「あなたの○○度診断」よりも、「【起業で失敗したくない人へ】あなたの社長適性診断」のように、<strong>ターゲットとベネフィット（不安解消）</strong>を明確にしましょう。
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                        <p className="font-bold text-gray-500">❌ 悪い例</p>
                        <p className="text-gray-800">・マーケティング診断</p>
                        <p className="font-bold text-gray-500 mt-3">⭕ 良い例</p>
                        <p className="text-gray-800 font-bold">・集客に疲れた個人事業主のための「自動化レベル」診断</p>
                    </div>
                </section>

                {/* Logic 2: Barnum Effect */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-pink-100 p-3 rounded-full text-pink-600"><Heart size={32}/></div>
                        <h2 className="text-2xl font-bold text-gray-900">2. 「バーナム効果」で信頼させる</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        誰にでも当てはまることを「自分のことだ！」と思わせる心理テクニックです。結果ページでは、断定的な表現ではなく、<strong>「一見○○ですが、実は××な一面も持っています」</strong>という多面的な褒め方をすると、納得感とシェア率が高まります。
                    </p>
                </section>

                {/* Logic 3: CTA */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-green-100 p-3 rounded-full text-green-600"><Megaphone size={32}/></div>
                        <h2 className="text-2xl font-bold text-gray-900">3. 最後に「次のアクション」を提示する</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        診断結果を見て「へー、面白かった」で終わらせてはいけません。<br/>
                        診断結果の問題点を解決するための<strong>「具体的な解決策（商品・LINE登録）」</strong>をボタンとして設置しましょう。診断で信頼関係ができているので、クリック率が高くなります。
                    </p>
                </section>

                <div className="text-center pt-8">
                    <button onClick={()=>setPage('editor')} className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all transform hover:scale-105">
                        このロジックで作成する
                    </button>
                </div>
            </div>
        </div>
    );
};