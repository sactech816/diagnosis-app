import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { theme, mode } = await request.json();

    // サーバー側でAPIキーを取得（NEXT_PUBLIC_なし）
    // 診断クイズ専用のキーを優先、なければデフォルトを使用
    const apiKey = process.env.OPENAI_API_KEY_QUIZ || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      );
    }

    if (!theme) {
      return NextResponse.json(
        { error: 'テーマが指定されていません' },
        { status: 400 }
      );
    }

    // プロンプト生成
    let prompt = "";
    if (mode === 'test') {
      prompt = `テーマ「${theme}」の4択学習クイズを作成して。質問5つ。各質問で正解は1つだけ（scoreのAを1、他を0にする）。結果は高・中・低得点の3段階。`;
    } else if (mode === 'fortune') {
      prompt = `テーマ「${theme}」の占いを作成して。質問5つ（運勢には影響しない演出用）。結果は大吉・中吉・吉などの3パターン。`;
    } else {
      prompt = `テーマ「${theme}」の性格/タイプ診断を作成して。質問5つ。結果は3タイプ。`;
    }

    // OpenAI API呼び出し
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: prompt + `出力はJSON形式のみ: {title, description, questions:[{text, options:[{label, score:{A,B,C}}]...], results:[{type, title, description, link_url, link_text, line_url, line_text, qr_url, qr_text}]}`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'OpenAI APIリクエストが失敗しました', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
    const json = JSON.parse(jsonStr);

    return NextResponse.json({
      success: true,
      data: json
    });

  } catch (error) {
    console.error('AI生成エラー:', error);
    return NextResponse.json(
      { error: 'AI生成中にエラーが発生しました', details: error.message },
      { status: 500 }
    );
  }
}

