"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuizPlayer from '../../components/QuizPlayer';
import { Loader2, RefreshCw, Home } from 'lucide-react';

// エディターのテンプレートデータをインポート
const TEMPLATE_QUIZZES = [
  // ビジネス3種
  {
    title: "あなたの「起業家タイプ」診断",
    description: "あなたの性格や行動パターンから、最適な起業スタイル（リーダー型、参謀型、職人型など）を診断します。",
    mode: "diagnosis", category: "Business", color: "bg-indigo-600",
    questions: [
      {text: "トラブルが発生！まずどう動く？", options: [{label: "全体への指示出し", score: {A:3,B:0,C:0}}, {label: "困っている人のケア", score: {A:0,B:3,C:0}}, {label: "解決策を考案", score: {A:0,B:0,C:3}}, {label: "静観する", score: {A:1,B:1,C:1}}]},
      {text: "新しいプロジェクト、何から始める？", options: [{label: "ゴール設定", score: {A:3,B:0,C:0}}, {label: "チーム編成", score: {A:0,B:3,C:0}}, {label: "アイデア出し", score: {A:0,B:0,C:3}}, {label: "予算確保", score: {A:1,B:1,C:1}}]},
      {text: "褒められて嬉しい言葉は？", options: [{label: "頼れるね！", score: {A:3,B:0,C:0}}, {label: "助かったよ！", score: {A:0,B:3,C:0}}, {label: "天才だね！", score: {A:0,B:0,C:3}}, {label: "仕事早いね！", score: {A:1,B:1,C:1}}]},
      {text: "会議での役割は？", options: [{label: "進行役", score: {A:3,B:0,C:0}}, {label: "調整役", score: {A:0,B:3,C:0}}, {label: "意見出し", score: {A:0,B:0,C:3}}, {label: "書記", score: {A:0,B:1,C:1}}]},
      {text: "休日の過ごし方は？", options: [{label: "予定通り行動", score: {A:3,B:0,C:0}}, {label: "友人と交流", score: {A:0,B:3,C:0}}, {label: "趣味に没頭", score: {A:0,B:0,C:3}}, {label: "寝る", score: {A:0,B:0,C:0}}]}
    ],
    results: [
      {type: "A", title: "統率者タイプ (リーダー)", description: "あなたには人を導く天性のカリスマがあります。全体を俯瞰し、決断するスピードはピカイチ。起業やマネジメントで才能が開花します。"},
      {type: "B", title: "調和者タイプ (サポーター)", description: "あなたは組織の潤滑油となる重要な存在です。人の感情の機微に聡く、モチベーション管理が得意です。HRやカスタマーサクセスで活躍できます。"},
      {type: "C", title: "革新者タイプ (クリエイター)", description: "あなたは常識にとらわれないアイデアマンです。0から1を生み出すことに喜びを感じます。ルーチンワークは苦手ですが、企画職や開発職で輝きます。"}
    ]
  },
  {
    title: "SNS発信力レベル診断",
    description: "なぜフォロワーが増えないのか？あなたの運用スキルを辛口判定します。",
    mode: "diagnosis", category: "Business", color: "bg-pink-500",
    questions: [
      {text: "投稿作成にかける時間は？", options: [{label: "10分以内", score: {A:0,B:1,C:0}}, {label: "30分〜1時間", score: {A:0,B:2,C:1}}, {label: "数時間", score: {A:0,B:0,C:3}}, {label: "気分次第", score: {A:1,B:0,C:0}}]},
      {text: "分析ツールは見てる？", options: [{label: "見方が不明", score: {A:3,B:0,C:0}}, {label: "たまに見る", score: {A:0,B:3,C:1}}, {label: "毎日分析", score: {A:0,B:0,C:3}}, {label: "数字は気にしない", score: {A:2,B:0,C:0}}]},
      {text: "他人の投稿への反応は？", options: [{label: "見るだけ", score: {A:2,B:0,C:0}}, {label: "いいねのみ", score: {A:0,B:2,C:0}}, {label: "引用RT・コメント", score: {A:0,B:1,C:3}}, {label: "無視", score: {A:1,B:0,C:0}}]},
      {text: "発信の目的は？", options: [{label: "なんとなく", score: {A:3,B:0,C:0}}, {label: "認知拡大", score: {A:0,B:3,C:1}}, {label: "リスト獲得", score: {A:0,B:0,C:3}}, {label: "承認欲求", score: {A:1,B:1,C:0}}]},
      {text: "プロフ更新頻度は？", options: [{label: "初期のまま", score: {A:3,B:0,C:0}}, {label: "たまに", score: {A:0,B:2,C:1}}, {label: "頻繁に改善", score: {A:0,B:0,C:3}}, {label: "変え方が不明", score: {A:2,B:0,C:0}}]}
    ],
    results: [
      {type: "A", title: "初心者 (趣味レベル)", description: "まだSNSのパワーを活かしきれていません。「日記」ではなく「誰かの役に立つ情報」を発信することから始めましょう。"},
      {type: "B", title: "中級者 (あと一歩！)", description: "良い発信をしていますが、少しムラがあるようです。ターゲットを一人に絞り、分析ツールを使って「伸びた投稿」の傾向を掴みましょう。"},
      {type: "C", title: "プロ級 (インフルエンサー)", description: "素晴らしい！SNSの本質を理解しています。次は「自動化」や「収益化」のフェーズです。LINE公式アカウントへの誘導を強化しましょう。"}
    ]
  },
  {
    title: "あなたの「副業適性」チェック",
    description: "あなたに合った副業は物販？アフィリエイト？コンテンツ販売？",
    mode: "diagnosis", category: "Business", color: "bg-blue-500",
    questions: [
      {text: "使える初期資金は？", options: [{label: "ほぼゼロ", score: {A:1,B:3,C:2}}, {label: "数万円", score: {A:2,B:2,C:2}}, {label: "投資可", score: {A:3,B:1,C:3}}, {label: "借金してでも", score: {A:3,B:0,C:3}}]},
      {text: "文章を書くのは？", options: [{label: "苦手", score: {A:3,B:0,C:1}}, {label: "普通", score: {A:2,B:3,C:2}}, {label: "得意", score: {A:0,B:3,C:3}}, {label: "読む専門", score: {A:2,B:0,C:0}}]},
      {text: "在庫リスクは？", options: [{label: "絶対イヤ", score: {A:0,B:3,C:3}}, {label: "多少なら", score: {A:2,B:2,C:2}}, {label: "管理できる", score: {A:3,B:0,C:0}}, {label: "倉庫借りる", score: {A:3,B:0,C:0}}]},
      {text: "作業スタイルは？", options: [{label: "すぐ結果が欲しい", score: {A:3,B:0,C:1}}, {label: "コツコツ継続", score: {A:1,B:3,C:2}}, {label: "仕組み化したい", score: {A:1,B:2,C:3}}, {label: "飽きっぽい", score: {A:2,B:0,C:0}}]},
      {text: "人との関わりは？", options: [{label: "一人がいい", score: {A:2,B:3,C:1}}, {label: "SNSなら", score: {A:1,B:2,C:2}}, {label: "ガンガン関わる", score: {A:1,B:1,C:3}}, {label: "AI相手がいい", score: {A:1,B:3,C:2}}]}
    ],
    results: [
      {type: "A", title: "転売・ポイ活 (即金重視)", description: "まずはフリマアプリやポイ活など、確実に現金化できる副業がおすすめ。リスクを取らず「ネットで1円を稼ぐ」経験を積みましょう。"},
      {type: "B", title: "ブログ・アフィリエイト (資産型)", description: "ブログやアフィリエイトが向いています。最初の収益化までは時間がかかりますが、忍耐強く継続できれば将来の不労所得になります。"},
      {type: "C", title: "コンテンツ販売 (起業型)", description: "自分の知識や経験を商品化する「コンテンツ販売」が最適です。noteやBrainでの販売や、コンサルティングで高利益を目指せます。"}
    ]
  },
  // 学習3種
  {
    title: "確定申告「経費」クイズ",
    description: "これって経費になる？ならない？フリーランス1年目必見の○×テスト。",
    mode: "test", category: "Education", color: "bg-gray-800",
    questions: [
      {text: "一人カフェでのコーヒー代は？", options: [{label: "なる", score: {A:1}}, {label: "ならない", score: {A:0}}, {label: "半額", score: {A:0}}, {label: "時価", score: {A:0}}]},
      {text: "仕事用のスーツ代は？", options: [{label: "なる", score: {A:0}}, {label: "ならない", score: {A:1}}, {label: "靴ならOK", score: {A:0}}, {label: "全額OK", score: {A:0}}]},
      {text: "取引先との接待ゴルフは？", options: [{label: "なる", score: {A:1}}, {label: "ならない", score: {A:0}}, {label: "飲食のみ", score: {A:0}}, {label: "1割負担", score: {A:0}}]},
      {text: "自宅オフィスの家賃全額は？", options: [{label: "なる", score: {A:0}}, {label: "ならない", score: {A:1}}, {label: "50%固定", score: {A:0}}, {label: "大家次第", score: {A:0}}]},
      {text: "健康診断の費用は？", options: [{label: "なる", score: {A:0}}, {label: "ならない", score: {A:1}}, {label: "福利厚生", score: {A:0}}, {label: "経費", score: {A:0}}]}
    ],
    results: [
      {type: "A", title: "税理士レベル (高得点)", description: "完璧です！税金の仕組みをよく理解しています。無駄な税金を払わず、賢く手残りを増やしていきましょう。"},
      {type: "B", title: "勉強中 (中得点)", description: "基本はわかっていますが、グレーゾーンの判断が危ういです。間違った申告は追徴課税のリスクがあります。"},
      {type: "C", title: "危険信号 (低得点)", description: "知識不足です！プライベートな出費まで経費にしていませんか？まずは簿記3級レベルの知識をつけましょう。"}
    ]
  },
  {
    title: "中学英語「前置詞」完全攻略",
    description: "in, on, at の使い分け、本当に理解してる？",
    mode: "test", category: "Education", color: "bg-orange-500",
    questions: [
      {text: "I was born __ 1990.", options: [{label: "in", score: {A:1}}, {label: "on", score: {A:0}}, {label: "at", score: {A:0}}, {label: "to", score: {A:0}}]},
      {text: "See you __ Monday.", options: [{label: "in", score: {A:0}}, {label: "on", score: {A:1}}, {label: "at", score: {A:0}}, {label: "of", score: {A:0}}]},
      {text: "The party starts __ 7 PM.", options: [{label: "in", score: {A:0}}, {label: "on", score: {A:0}}, {label: "at", score: {A:1}}, {label: "by", score: {A:0}}]},
      {text: "He is good __ tennis.", options: [{label: "in", score: {A:0}}, {label: "on", score: {A:0}}, {label: "at", score: {A:1}}, {label: "for", score: {A:0}}]},
      {text: "The cat is __ the table.", options: [{label: "in", score: {A:0}}, {label: "on", score: {A:1}}, {label: "at", score: {A:0}}, {label: "to", score: {A:0}}]}
    ],
    results: [
      {type: "A", title: "ネイティブ級", description: "完璧です！前置詞のイメージがしっかりと頭に入っています。"},
      {type: "B", title: "あと一歩", description: "時間や場所の基本的な使い分けはできていますが、熟語になると迷いがあるようです。"},
      {type: "C", title: "要復習", description: "残念ながら基礎があやふやです。in=中、on=接触、at=点のイメージを復習しましょう。"}
    ]
  },
  {
    title: "AIリテラシー検定",
    description: "ChatGPT時代の必須用語チェック！",
    mode: "test", category: "Education", color: "bg-indigo-600",
    questions: [
      {text: "ChatGPTのベース技術は？", options: [{label: "LLM", score: {A:1}}, {label: "NFT", score: {A:0}}, {label: "VR", score: {A:0}}, {label: "IoT", score: {A:0}}]},
      {text: "AIへの命令文は？", options: [{label: "スクリプト", score: {A:0}}, {label: "プロンプト", score: {A:1}}, {label: "コマンド", score: {A:0}}, {label: "オーダー", score: {A:0}}]},
      {text: "画像生成AIでないのは？", options: [{label: "Midjourney", score: {A:0}}, {label: "Stable Diffusion", score: {A:0}}, {label: "Excel", score: {A:1}}, {label: "DALL-E", score: {A:0}}]},
      {text: "AIが嘘をつく現象は？", options: [{label: "バグ", score: {A:0}}, {label: "ハルシネーション", score: {A:1}}, {label: "エラー", score: {A:0}}, {label: "フェイク", score: {A:0}}]},
      {text: "ChatGPTの開発元は？", options: [{label: "Google", score: {A:0}}, {label: "OpenAI", score: {A:1}}, {label: "Meta", score: {A:0}}, {label: "Microsoft", score: {A:0}}]}
    ],
    results: [
      {type: "A", title: "AIマスター", description: "最新技術を完璧に追えています。業務効率を劇的に上げることができる人材です。"},
      {type: "B", title: "一般ユーザー", description: "ニュースレベルの知識はあります。実際にツールを使いこなすには実践が必要です。"},
      {type: "C", title: "化石化注意", description: "危険です。時代に取り残されています。今すぐChatGPTを触ってみましょう。"}
    ]
  },
  // 占い3種
  {
    title: "今日の「推し活」運勢",
    description: "推しがいる全人類へ。今日の運勢を占います。",
    mode: "fortune", category: "Fortune", color: "bg-pink-500",
    questions: [
      {text: "推しの尊さを一言で！", options: [{label: "天使", score: {A:0,B:0,C:0}}, {label: "神", score: {A:0,B:0,C:0}}, {label: "宇宙", score: {A:0,B:0,C:0}}, {label: "酸素", score: {A:0,B:0,C:0}}]},
      {text: "グッズは？", options: [{label: "保存用も買う", score: {A:0,B:0,C:0}}, {label: "使う分だけ", score: {A:0,B:0,C:0}}, {label: "厳選する", score: {A:0,B:0,C:0}}, {label: "祭壇がある", score: {A:0,B:0,C:0}}]},
      {text: "遠征はする？", options: [{label: "地球の裏側まで", score: {A:0,B:0,C:0}}, {label: "国内なら", score: {A:0,B:0,C:0}}, {label: "近場のみ", score: {A:0,B:0,C:0}}, {label: "在宅勢", score: {A:0,B:0,C:0}}]},
      {text: "推し色は？", options: [{label: "暖色系", score: {A:0,B:0,C:0}}, {label: "寒色系", score: {A:0,B:0,C:0}}, {label: "モノトーン", score: {A:0,B:0,C:0}}, {label: "その他", score: {A:0,B:0,C:0}}]},
      {text: "最後に一言！", options: [{label: "一生推す", score: {A:0,B:0,C:0}}, {label: "ありがとう", score: {A:0,B:0,C:0}}, {label: "結婚して", score: {A:0,B:0,C:0}}, {label: "生きてて偉い", score: {A:0,B:0,C:0}}]}
    ],
    results: [
      {type: "A", title: "大吉 (神席確定!?)", description: "最高の運気です！チケット運、グッズ運ともに最強。推しからのファンサがもらえる予感。"},
      {type: "B", title: "中吉 (供給過多)", description: "嬉しいニュースが飛び込んでくるかも。メディア出演や新曲発表など、嬉しい悲鳴をあげる一日に。"},
      {type: "C", title: "小吉 (沼の深み)", description: "今日は過去の映像を見返すと吉。初心にかえり、尊さを噛み締めましょう。散財には注意。"}
    ]
  },
  {
    title: "あなたの「オーラカラー」診断",
    description: "性格からあなたの魂の色を導き出します。",
    mode: "diagnosis", category: "Fortune", color: "bg-purple-600",
    questions: [
      {text: "好きな季節は？", options: [{label: "夏", score: {A:3,B:0,C:0}}, {label: "冬", score: {A:0,B:3,C:0}}, {label: "春秋", score: {A:0,B:0,C:3}}, {label: "特になし", score: {A:1,B:1,C:1}}]},
      {text: "悩み事は？", options: [{label: "すぐ相談", score: {A:0,B:0,C:3}}, {label: "一人で考える", score: {A:0,B:3,C:0}}, {label: "寝て忘れる", score: {A:3,B:0,C:0}}, {label: "検索する", score: {A:1,B:1,C:1}}]},
      {text: "直感は？", options: [{label: "信じる", score: {A:3,B:0,C:0}}, {label: "信じない", score: {A:0,B:3,C:0}}, {label: "場合による", score: {A:0,B:0,C:3}}, {label: "占いなら", score: {A:1,B:1,C:1}}]},
      {text: "旅行先は？", options: [{label: "リゾート", score: {A:3,B:0,C:0}}, {label: "古都", score: {A:0,B:3,C:0}}, {label: "都会", score: {A:0,B:0,C:3}}, {label: "秘境", score: {A:2,B:1,C:0}}]},
      {text: "人混みは？", options: [{label: "大好き", score: {A:3,B:0,C:0}}, {label: "苦手", score: {A:0,B:3,C:0}}, {label: "普通", score: {A:0,B:0,C:3}}, {label: "知人がいれば", score: {A:1,B:1,C:1}}]}
    ],
    results: [
      {type: "A", title: "情熱のレッド", description: "燃えるようなエネルギーの持ち主。行動力があり、周囲を巻き込んで進むリーダータイプです。"},
      {type: "B", title: "知性のブルー", description: "冷静沈着で深い知性を持ちます。論理的に考え、信頼されるアドバイザータイプ。"},
      {type: "C", title: "無邪気なイエロー", description: "天真爛漫で、いるだけで場が明るくなるムードメーカー。好奇心旺盛で新しいものが大好き。"}
    ]
  },
  {
    title: "前世の職業占い",
    description: "あなたの魂の記憶から前世を占います。",
    mode: "fortune", category: "Fortune", color: "bg-indigo-900",
    questions: [
      {text: "古い建物を見ると？", options: [{label: "懐かしい", score: {A:0,B:0,C:0}}, {label: "怖い", score: {A:0,B:0,C:0}}, {label: "無関心", score: {A:0,B:0,C:0}}, {label: "住みたい", score: {A:0,B:0,C:0}}]},
      {text: "得意科目は？", options: [{label: "体育", score: {A:0,B:0,C:0}}, {label: "国語", score: {A:0,B:0,C:0}}, {label: "数学", score: {A:0,B:0,C:0}}, {label: "歴史", score: {A:0,B:0,C:0}}]},
      {text: "海と山どっち？", options: [{label: "海", score: {A:0,B:0,C:0}}, {label: "山", score: {A:0,B:0,C:0}}, {label: "両方", score: {A:0,B:0,C:0}}, {label: "どっちも嫌", score: {A:0,B:0,C:0}}]},
      {text: "夢を見る？", options: [{label: "毎日", score: {A:0,B:0,C:0}}, {label: "たまに", score: {A:0,B:0,C:0}}, {label: "忘れた", score: {A:0,B:0,C:0}}, {label: "見ない", score: {A:0,B:0,C:0}}]},
      {text: "直感で選ぶ色は？", options: [{label: "金", score: {A:0,B:0,C:0}}, {label: "銀", score: {A:0,B:0,C:0}}, {label: "赤", score: {A:0,B:0,C:0}}, {label: "黒", score: {A:0,B:0,C:0}}]}
    ],
    results: [
      {type: "A", title: "王族・貴族", description: "国を治める立場にありました。プライドが高く、リーダーシップを発揮し多くの人を導く使命を持っています。"},
      {type: "B", title: "職人・芸術家", description: "黙々と一つの道を極める職人でした。こだわりが強く、妥協を許さない性格。クリエイティブな分野で才能を発揮します。"},
      {type: "C", title: "旅人・商人", description: "世界中を旅して回っていました。束縛を嫌い自由を愛する心はそこから来ています。変化を恐れず挑戦しましょう。"}
    ]
  }
];

const DemoQuizPage = () => {
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // テンプレートクイズをランダムに取得
  const fetchRandomTemplateQuiz = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // テンプレート配列からランダムに1つ選択
      const randomIndex = Math.floor(Math.random() * TEMPLATE_QUIZZES.length);
      const selectedQuiz = TEMPLATE_QUIZZES[randomIndex];
      
      // IDとslugを追加（QuizPlayerが必要とする場合のため）
      const quizWithMetadata = {
        ...selectedQuiz,
        id: `demo-${randomIndex}`,
        slug: `demo-${randomIndex}`,
        layout: 'card' // デフォルトレイアウト
      };
      
      setQuiz(quizWithMetadata);
      setIsLoading(false);
    } catch (err) {
      console.error('デモクイズ読み込みエラー:', err);
      setError(err.message);
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
