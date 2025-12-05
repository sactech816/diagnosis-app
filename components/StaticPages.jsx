import React, { useState, useEffect } from 'react';
// ★修正: MessageCircle を追加しました
import { 
    ArrowLeft, CheckCircle, ChevronDown, ChevronUp, 
    Briefcase, GraduationCap, Sparkles, TrendingUp, 
    Share2, Search, Megaphone, Lightbulb, Target, Heart,
    QrCode, Users, Repeat, Smartphone, Eye, Zap, Lock, Unlock,
    Download, Code, FileText, Image as ImageIcon, BarChart2,
    Mail, Shield, Scale, ExternalLink, Smile, MessageCircle
} from 'lucide-react';
import Header from './Header';
import SEO from './SEO';

// ... (以下、中身のコードはそのままでOKですが、一番確実なのは前回のコードの先頭 import 部分だけを上記に書き換えることです)
// ※ファイル全体を貼り付けると非常に長くなるため、今回は「import部分の修正」だけで確実に直ります。
// ↓ もしコピペ用として中身が必要であれば、前回のコードの import 部分だけを上記に差し替えてご使用ください。

// ... (EffectiveUsePage, QuizLogicPage, HowToPage... などのコンポーネントは変更なし)
// --- 1. Effective Use Page ---
export const EffectiveUsePage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { document.title = "効果的な使い方・メリット | 診断クイズメーカー"; }, []);
    
    const tips = [
        { icon: Share2, color: "text-blue-600", bg: "bg-blue-100", title: "1. SNS拡散（UGC）を狙う", text: "診断結果は「自分語り」ができる最高のコンテンツです。面白い結果はX(Twitter)やInstagramでシェアされやすく、広告費をかけずに認知が広がります。" },
        { icon: Search, color: "text-purple-600", bg: "bg-purple-100", title: "2. SEO & AI検索対策", text: "このポータルに掲載されることで、あなたのビジネスへの被リンク効果が期待できます。また、構造化データによりChatGPTなどのAI検索からの流入も狙えます。" },
        { icon: Megaphone, color: "text-green-600", bg: "bg-green-100", title: "3. 自然なリスト獲得", text: "いきなり売り込むのではなく、「診断結果のアドバイスを受け取る」という名目でLINE登録やメールアドレス入力を促すことで、登録率が劇的に向上します。" },
        { icon: QrCode, color: "text-gray-800", bg: "bg-gray-100", title: "4. リアル店舗・イベントでの活用", text: "QRコードを発行してチラシや店頭に掲示しましょう。「待ち時間の暇つぶし」として診断を楽しんでもらいつつ、クーポン配布や会員登録へ誘導できます。" },
        { icon: Users, color: "text-indigo-600", bg: "bg-indigo-100", title: "5. 顧客のセグメント分析", text: "「Aタイプ（初心者）」が多ければ初心者向けセミナーを、「Bタイプ（上級者）」が多ければ個別相談を案内するなど、属性に合わせた最適なセールスが可能になります。" },
        { icon: GraduationCap, color: "text-orange-600", bg: "bg-orange-100", title: "6. 教育・社内研修ツールとして", text: "「学習モード」を使えば、楽しみながら知識定着を図るテストが作れます。お客様への啓蒙コンテンツや、社内マニュアルの理解度チェックにも最適です。" },
        { icon: Repeat, color: "text-pink-600", bg: "bg-pink-100", title: "7. リピート訪問の促進", text: "「占いモード」で「今日の運勢」や「日替わりランチ診断」を作成すれば、ユーザーが毎日サイトを訪れる習慣（リテンション）を作ることができます。" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="bg-indigo-900 text-white py-16 px-6 text-center">
                <h1 className="text-3xl font-extrabold mb-4">診断クイズの<span className="text-yellow-300">効果的な活用法 7選</span></h1>
                <p className="text-indigo-200 max-w-xl mx-auto">作成したコンテンツを最大限に活かし、集客と売上につなげるための具体的なアイデアをご紹介します。</p>
            </div>
            <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600 mb-4"><ArrowLeft size={16}/> 戻る</button>
                <div className="grid md:grid-cols-2 gap-6">
                    {tips.map((tip, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 p-3 rounded-full ${tip.bg} ${tip.color}`}><tip.icon size={24}/></div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{tip.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center pt-8">
                    <button onClick={()=>setPage('editor')} className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105">さっそく診断を作ってみる</button>
                </div>
            </div>
        </div>
    );
};

// --- 2. Quiz Logic Page ---
export const QuizLogicPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { document.title = "バズる診断の作り方 | 診断クイズメーカー"; }, []);
    
    const logics = [
        { icon: Target, title: "1. ターゲットの「不安」を特定する", text: "「誰の、どんな悩みを解決するか」を明確にします。単なる「性格診断」ではなく、「起業に失敗したくない人のための適性診断」のようにベネフィットを提示しましょう。" },
        { icon: Heart, title: "2. バーナム効果で信頼させる", text: "誰にでも当てはまることを「自分のことだ」と思わせる心理テクニックです。「一見大胆ですが、繊細な一面も…」のような多面的な記述が共感を呼びます。" },
        { icon: Megaphone, title: "3. 具体的なアクションへ誘導", text: "結果を見て終わりではなく、「このタイプにおすすめの商品」「解決策がわかるLINE」など、次の行動（CTA）を必ずボタンとして設置しましょう。" },
        { icon: Sparkles, title: "4. 「シェアしたくなる」タイトル", text: "「○○力」「○○度」といった数値化や、「実は…」といった意外性をタイトルに入れると、SNSでのクリック率が大幅に上がります。" },
        { icon: ImageIcon, title: "5. 視覚的なインパクト", text: "文字だけでなく、魅力的なメイン画像を設定しましょう。特にチャット形式の場合、アイコンやテンポの良い会話設計が離脱を防ぎます。" },
        { icon: Smartphone, title: "6. 入力ハードルを下げる", text: "質問数は3〜5問がベストです。多すぎると途中で離脱されます。スマホでサクサク答えられるボリューム感を意識しましょう。" },
        { icon: Eye, title: "7. 承認欲求を満たす結果", text: "悪い結果が出ても、必ずポジティブなフォローを入れましょう。「あなたはダメです」ではなく「伸びしろがあります」と伝えることで、シェアされやすくなります。" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="bg-orange-500 text-white py-16 px-6 text-center">
                <h1 className="text-3xl font-extrabold mb-4">思わずシェアしたくなる！<br/><span className="text-yellow-200">「売れる診断」</span>の鉄板ロジック</h1>
                <p className="text-orange-100 max-w-xl mx-auto">人が動く心理トリガーを押さえた、効果的な診断コンテンツの作り方を伝授します。</p>
            </div>
            <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-500 font-bold hover:text-orange-600 mb-4"><ArrowLeft size={16}/> 戻る</button>
                <div className="space-y-6">
                    {logics.map((logic, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                            <div className="flex-shrink-0 bg-orange-100 text-orange-600 p-3 rounded-full h-fit"><logic.icon size={24}/></div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{logic.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{logic.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center pt-8">
                    <button onClick={()=>setPage('editor')} className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all transform hover:scale-105">このロジックで作ってみる</button>
                </div>
            </div>
        </div>
    );
};

// --- 3. HowTo Page ---
export const HowToPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { document.title = "使い方・機能一覧 | 診断クイズメーカー"; }, []);
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="py-12 px-4 max-w-4xl mx-auto">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">機能一覧・使い方ガイド</h1>
                
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-xl">
                            <Unlock size={24} className="text-blue-500"/> 基本機能 (無料)
                        </div>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Zap size={16}/></span><span><strong>3つの作成モード:</strong> ビジネス診断 / 学習テスト / 占い</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><Sparkles size={16}/></span><span><strong>AI自動生成:</strong> テーマを入れるだけで全自動作成</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><ImageIcon size={16}/></span><span><strong>画像機能:</strong> アップロード / 自動画像設定</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><MessageCircle size={16}/></span><span><strong>デザイン切替:</strong> カード型 / チャット型(LINE風)</span></li>
                            <li className="flex gap-3"><span className="bg-blue-100 text-blue-600 p-1 rounded"><BarChart2 size={16}/></span><span><strong>基本解析:</strong> 閲覧数、完了数、クリック数のグラフ</span></li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">DONATION</div>
                        <div className="flex items-center gap-2 mb-4 text-indigo-900 font-bold text-xl">
                            <Lock size={24} className="text-orange-500"/> Pro機能 (寄付で開放)
                        </div>
                        <p className="text-xs text-indigo-700 mb-4">※クイズごとに任意の金額(500円〜)を寄付いただくと開放されます。</p>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><Download size={16}/></span><span><strong>HTML書き出し:</strong> 自社サーバーに設置可能なファイルをDL</span></li>
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><Code size={16}/></span><span><strong>埋め込みタグ発行:</strong> ブログやHPに診断を埋め込み</span></li>
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><FileText size={16}/></span><span><strong>リストCSV出力:</strong> 獲得したメールアドレスを一括DL</span></li>
                            <li className="flex gap-3"><span className="bg-orange-100 text-orange-600 p-1 rounded"><Heart size={16}/></span><span><strong>開発者支援:</strong> ツールの継続的なアップデートを支援</span></li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-8 text-gray-800 leading-relaxed border-t pt-8">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Briefcase className="text-indigo-600"/> 1. ビジネス診断の作り方</h2>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <p className="mb-2 text-sm font-bold text-indigo-800">例：「あなたのリーダータイプ診断」</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                <li><strong>配点方式:</strong> 選択肢ごとにA, B, C...のタイプに点数を割り振ります。</li>
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
                                <li><strong>結果判定:</strong> 正解数に応じて、自動的にランク（S〜Cなど）が判定されます。</li>
                                <li><strong>演出:</strong> 回答時に「正解！」のフィードバックや、満点時の紙吹雪演出があります。</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Sparkles className="text-purple-600"/> 3. 占いの作り方</h2>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <p className="mb-2 text-sm font-bold text-purple-800">例：「今日のラッキーアイテム占い」</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                <li><strong>ランダム:</strong> 質問への回答に関わらず、用意した結果の中からランダムに一つが表示されます。</li>
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

// --- FAQ Page ---
export const FaqPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { document.title = "よくある質問 | 診断クイズメーカー"; }, []);
    const [openIndex, setOpenIndex] = useState(null);
    const faqs = [
        { category: "一般・全般", q: "無料で使えますか？", a: "はい、作成・公開・分析の基本機能はすべて無料でご利用いただけます。" },
        { category: "一般・全般", q: "商用利用は可能ですか？", a: "可能です。作成したコンテンツは、ご自身のビジネス（LINE誘導、集客）や教育現場で自由にご活用ください。" },
        { category: "機能", q: "Pro機能（寄付）とは何ですか？", a: "クイズごとに任意の金額を寄付いただくことで、「HTMLダウンロード」「埋め込みコード発行」「収集したメールアドレスのCSVダウンロード」機能が開放されます。" },
        { category: "機能", q: "どんな種類のクイズが作れますか？", a: "①「ビジネス診断（点数加算型）」、②「学習・検定（正解数判定型）」、③「占い（ランダム結果型）」の3種類を作成可能です。" },
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

export const PricePage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    return <FaqPage onBack={onBack} setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />;
};

// --- Contact Page ---
export const ContactPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { document.title = "お問い合わせ | 診断クイズメーカー"; }, []);
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="py-12 px-4 max-w-2xl mx-auto text-center">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600 mx-auto"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">お問い合わせ</h1>
                <p className="text-gray-600 mb-8">
                    機能へのご要望、不具合のご報告、その他ご質問は以下のフォームよりお問い合わせください。<br/>
                    原則として3営業日以内にご返信いたします。
                </p>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSd8euNVubqlITrCF2_W7VVBjLd2mVxzOIcJ67pNnk3GPLnT_A/viewform" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105">
                    <Mail size={20}/> お問い合わせフォームを開く
                </a>
            </div>
        </div>
    );
};

// --- Legal Page ---
export const LegalPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { document.title = "特定商取引法に基づく表記 | 診断クイズメーカー"; }, []);
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="py-12 px-4 max-w-3xl mx-auto">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2"><Scale className="text-gray-400"/> 特定商取引法に基づく表記</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">販売事業者名</div>
                        <div className="md:col-span-2 text-gray-900">[あなたの事業者名または氏名]</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">代表者または運営統括責任者</div>
                        <div className="md:col-span-2 text-gray-900">[代表者氏名]</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">所在地</div>
                        <div className="md:col-span-2 text-gray-900">[住所]</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">お問い合わせ先</div>
                        <div className="md:col-span-2 text-gray-900">
                            [電話番号]<br/>
                            [メールアドレス]<br/>
                            またはお問い合わせフォームよりご連絡ください。
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">販売価格</div>
                        <div className="md:col-span-2 text-gray-900">各決済画面に表示された金額（寄付形式のため任意設定可能）</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">商品代金以外の必要料金</div>
                        <div className="md:col-span-2 text-gray-900">インターネット接続料金、通信料金</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">代金の支払時期および方法</div>
                        <div className="md:col-span-2 text-gray-900">クレジットカード決済（Stripe）。購入時即時に決済されます。</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="font-bold text-gray-500">商品の引渡時期</div>
                        <div className="md:col-span-2 text-gray-900">決済完了後、即時にダウンロードまたは機能が有効化されます。</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="font-bold text-gray-500">返品・キャンセルについて</div>
                        <div className="md:col-span-2 text-gray-900">デジタルコンテンツの性質上、決済完了後の返品・キャンセルはお受けできません。</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Privacy Page ---
export const PrivacyPage = ({ onBack, setPage, user, onLogout, setShowAuth, isAdmin }) => {
    useEffect(() => { document.title = "プライバシーポリシー | 診断クイズメーカー"; }, []);
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            <div className="py-12 px-4 max-w-3xl mx-auto">
                <button onClick={onBack} className="mb-6 flex items-center gap-1 text-gray-500 font-bold hover:text-indigo-600"><ArrowLeft size={16}/> 戻る</button>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2"><Shield className="text-gray-400"/> プライバシーポリシー</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-sm leading-relaxed space-y-6 text-gray-700">
                    <p>診断クイズメーカー（以下、「当サービス」）は、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」）を定めます。</p>
                    
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">1. 個人情報の収集</h3>
                        <p>当サービスは、ユーザー登録時や決済時に、メールアドレス、クレジットカード情報（決済代行会社が管理）等の情報を収集する場合があります。また、作成されたクイズを通じて収集される回答者のメールアドレス等の情報は、クイズ作成者の責任において管理されます。</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">2. 利用目的</h3>
                        <p>収集した情報は、サービスの提供、本人確認、決済処理、お問い合わせ対応、およびサービスの改善のために利用します。</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">3. 第三者への提供</h3>
                        <p>当サービスは、法令に基づく場合を除き、あらかじめユーザーの同意を得ることなく、個人情報を第三者に提供しません。</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">4. 決済情報の取扱い</h3>
                        <p>クレジットカード決済には「Stripe」を使用しており、当サービスがカード情報を直接保持することはありません。</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-gray-900 mb-2">5. お問い合わせ</h3>
                        <p>本ポリシーに関するお問い合わせは、お問い合わせフォームよりお願いいたします。</p>
                    </section>
                </div>
            </div>
        </div>
    );
};