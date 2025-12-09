# 決済機能の修正サマリー

## 問題

決済は成功するが、機能が開放されない問題が発生していました。

### 症状
- Stripe決済は正常に完了
- しかし、ダッシュボードで「HTMLダウンロード」「埋め込み」「リスト」ボタンがアクティブにならない
- 「機能開放 / 寄付」ボタンが表示されたままになる

## 原因

1. **決済検証のタイミング問題**: 購入履歴の取得と決済検証が並行実行されていたため、タイミングによっては購入履歴が反映されない
2. **エラーハンドリング不足**: エラーが発生してもユーザーに通知されず、問題の特定が困難
3. **ログ不足**: デバッグ情報が不足しており、問題の原因を特定しにくい
4. **重複挿入の防止なし**: 同じ決済が複数回記録される可能性があった

## 修正内容

### 1. Dashboard.jsx の修正

#### 変更点1: 決済検証の実行順序を変更
```javascript
// 修正前: 購入履歴取得と決済検証が並行実行
await fetchMyQuizzes();
const { data: bought } = await supabase.from('purchases').select('quiz_id').eq('user_id', user.id);
setPurchases(bought?.map(p => p.quiz_id) || []);
const params = new URLSearchParams(window.location.search);
if (params.get('payment') === 'success') {
    await verifyPayment(params.get('session_id'), params.get('quiz_id'));
}

// 修正後: 決済検証を最初に実行し、その後購入履歴を取得
const params = new URLSearchParams(window.location.search);
if (params.get('payment') === 'success' && params.get('session_id')) {
    const quizId = params.get('quiz_id');
    await verifyPayment(params.get('session_id'), quizId);
    window.history.replaceState(null, '', window.location.pathname);
}
await fetchMyQuizzes();
const { data: bought } = await supabase.from('purchases').select('quiz_id').eq('user_id', user.id);
setPurchases(bought?.map(p => p.quiz_id) || []);
```

#### 変更点2: verifyPayment関数の改善
```javascript
// 修正前: エラーハンドリングが不十分
const verifyPayment = async (sessionId, quizId) => {
    try {
        const res = await fetch('/api/verify', {...});
        if (res.ok) {
            alert('寄付ありがとうございます！...');
            setPurchases(prev => [...prev, parseInt(quizId)]);
        }
    } catch (e) {
        console.error(e);
    }
};

// 修正後: 詳細なログとエラーハンドリング、購入履歴の再取得
const verifyPayment = async (sessionId, quizId) => {
    try {
        console.log('🔍 決済検証開始:', { sessionId, quizId, userId: user.id });
        const res = await fetch('/api/verify', {...});
        const data = await res.json();
        console.log('✅ 決済検証レスポンス:', data);
        
        if (res.ok) {
            // 購入履歴を再取得して確実に反映
            const { data: bought, error } = await supabase.from('purchases').select('quiz_id').eq('user_id', user.id);
            if (error) {
                console.error('❌ 購入履歴の取得エラー:', error);
            } else {
                console.log('📋 購入履歴を更新:', bought);
                setPurchases(bought?.map(p => p.quiz_id) || []);
            }
            alert('寄付ありがとうございます！...');
        } else {
            console.error('❌ 決済検証失敗:', data);
            alert('決済の確認に失敗しました。お手数ですが、ページを再読み込みしてください。');
        }
    } catch (e) {
        console.error('❌ 決済検証エラー:', e);
        alert('エラーが発生しました: ' + e.message);
    }
};
```

### 2. app/api/verify/route.js の修正

#### 変更点1: 詳細なログの追加
```javascript
console.log('🔍 決済検証リクエスト:', { sessionId, quizId, userId });
console.log('💳 Stripe決済ステータス:', session.payment_status);
console.log('✅ 購入履歴を記録:', data);
```

#### 変更点2: 重複挿入の防止
```javascript
// 既に記録済みかチェック
const { data: existing } = await supabaseAdmin
    .from('purchases')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .single();

if (existing) {
    console.log('ℹ️ 既に記録済みの決済:', sessionId);
    return NextResponse.json({ success: true, message: 'Already recorded' });
}
```

#### 変更点3: エラーハンドリングの改善
```javascript
if (session.payment_status !== 'paid') {
    console.error('❌ 決済未完了:', session.payment_status);
    return NextResponse.json({ 
        error: 'Payment not completed', 
        status: session.payment_status 
    }, { status: 400 });
}
```

### 3. 新規ファイルの作成

#### supabase_purchases_schema.sql
- purchasesテーブルのスキーマ定義
- RLSポリシーの設定
- インデックスの作成

#### PAYMENT_TROUBLESHOOTING.md
- トラブルシューティングガイド
- よくある問題と解決方法
- デバッグ手順

## テスト手順

### 1. Supabaseの設定
1. `supabase_purchases_schema.sql`をSupabase SQL Editorで実行
2. purchasesテーブルが作成されたことを確認
3. RLSポリシーが設定されたことを確認

### 2. 環境変数の確認
1. Vercelダッシュボードで以下の環境変数が設定されているか確認:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. 環境変数を変更した場合は再デプロイ

### 3. 決済テスト
1. ログインする
2. 診断クイズを作成
3. 「機能開放 / 寄付」ボタンをクリック
4. テストカード（4242 4242 4242 4242）で決済
5. 決済成功後、ダッシュボードに戻る
6. ブラウザのコンソールを確認:
   - `🔍 決済検証開始:`
   - `✅ 決済検証レスポンス:`
   - `📋 購入履歴を更新:`
7. 「HTMLダウンロード」「埋め込み」「リスト」ボタンがアクティブになることを確認

### 4. Vercelログの確認
1. Vercelダッシュボード → Deployments → Functions
2. `/api/verify`のログを確認:
   - `🔍 決済検証リクエスト:`
   - `💳 Stripe決済ステータス: paid`
   - `✅ 購入履歴を記録:`

### 5. Supabaseデータの確認
```sql
SELECT * FROM public.purchases 
ORDER BY created_at DESC 
LIMIT 10;
```

## 期待される動作

1. **決済成功時**:
   - アラート「寄付ありがとうございます！...」が表示される
   - ダッシュボードにリダイレクトされる
   - 「HTMLダウンロード」ボタンが緑色でアクティブになる
   - 「埋め込み」ボタンがアクティブになる
   - 「リスト」ボタン（メール収集ONの場合）がアクティブになる

2. **ログ出力**:
   - ブラウザコンソールに詳細なログが表示される
   - Vercelのログに決済検証の詳細が記録される

3. **エラー時**:
   - ユーザーにわかりやすいエラーメッセージが表示される
   - コンソールに詳細なエラー情報が出力される

## ロールバック方法

問題が発生した場合は、以下のコマンドで変更を元に戻せます:

```bash
git log --oneline -5  # 最近のコミットを確認
git revert <commit-hash>  # 特定のコミットを取り消し
git push
```

## 今後の改善案

1. **購入履歴のキャッシュ**: React Queryなどを使用して購入履歴をキャッシュ
2. **リアルタイム更新**: Supabaseのリアルタイム機能を使用して購入履歴を自動更新
3. **エラー通知の改善**: トースト通知を使用してよりユーザーフレンドリーに
4. **決済履歴ページ**: ユーザーが過去の決済履歴を確認できるページを追加
5. **管理者ダッシュボード**: 全ユーザーの決済履歴を確認できる管理画面

## 関連ファイル

- `components/Dashboard.jsx` - ダッシュボードのメインコンポーネント
- `app/api/verify/route.js` - 決済検証API
- `app/api/checkout/route.js` - 決済開始API
- `supabase_purchases_schema.sql` - purchasesテーブルのスキーマ
- `PAYMENT_TROUBLESHOOTING.md` - トラブルシューティングガイド

