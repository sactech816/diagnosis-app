import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// APIキーの確認ログ
const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  console.error("❌ Stripe API Key is missing!");
}

const stripe = new Stripe(apiKey || '');

export async function POST(req) {
  try {
    const { quizId, quizTitle, userId, email } = await req.json();
    
    // 戻り先URLの取得
    let origin = req.headers.get('origin');
    if (!origin) {
        origin = req.headers.get('referer');
        if (origin) {
            origin = new URL(origin).origin;
        }
    }

    console.log(`🚀 Starting Checkout for: ${quizTitle} (User: ${userId}) at ${origin}`);

    if (!origin) {
        throw new Error("Origin URL could not be determined.");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `HTMLデータ提供: ${quizTitle}`,
              description: 'この診断クイズのHTMLデータをダウンロードします（寄付・応援）',
            },
            // ★修正: 自由価格(custom_unit_amount)を廃止し、固定価格(unit_amount)に変更
            unit_amount: 1000, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&quiz_id=${quizId}`,
      cancel_url: `${origin}/dashboard?payment=cancel`,
      metadata: {
        userId: userId,
        quizId: quizId,
      },
      customer_email: email,
    });

    console.log("✅ Session Created:", session.url);
    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("🔥 Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}