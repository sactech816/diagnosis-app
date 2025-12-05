import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ★修正: 管理者権限（Service Role）でSupabaseを操作する
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ここが変わりました
);

export async function POST(req) {
  try {
    const { sessionId, quizId, userId } = await req.json();

    // 1. Stripeに問い合わせて、本当に支払い済みか確認
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Not paid' }, { status: 400 });
    }

    // 2. Supabaseに購入履歴を記録（管理者権限で実行）
    const { data, error } = await supabaseAdmin.from('purchases').insert([
      {
        user_id: userId,
        quiz_id: quizId,
        stripe_session_id: sessionId,
        amount: session.amount_total
      }
    ]);

    if (error) {
        console.error("Supabase Insert Error:", error);
        throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}