# 認証機能の修正まとめ

## 修正日時
2025年12月9日

## 修正内容

### 1. 同じメールでアカウント新規作成時の動作改善

#### 問題点
- 既に登録されているメールアドレスで新規登録しようとした場合、エラーメッセージが表示されるだけで、ログイン画面に切り替わるのみ
- パスワードが正しい場合でも、自動的にログインしない

#### 修正内容
`components/AuthModal.jsx` の `handleAuth` 関数を修正:

**修正前:**
```javascript
// 重複メールアドレスのエラーハンドリング
if (!isLogin && (error.message.includes('already registered') || ...)) {
    alert('このメールアドレスは既に登録されています。...');
    setIsLogin(true);
    setPassword('');
    setLoading(false);
    return;
}
```

**修正後:**
```javascript
// 重複メールアドレスのエラーハンドリング
if (!isLogin && (error.message.includes('already registered') || ...)) {
    // パスワードが合っているか試してみる
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
    });
    
    if (!loginError && loginData.user) {
        // パスワードが合っていた場合、自動的にログイン
        alert('このメールアドレスは既に登録されています。\n\n自動的にログインしました。');
        setUser(loginData.user);
        onClose();
        // ログイン成功時にマイページにリダイレクト
        if (onNavigate) {
            onNavigate('dashboard');
        } else if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard';
        }
        setLoading(false);
        return;
    } else {
        // パスワードが間違っている場合、ログイン画面に切り替え
        alert('このメールアドレスは既に登録されています。...');
        setIsLogin(true);
        setPassword('');
        setLoading(false);
        return;
    }
}
```

#### 動作
1. 既に登録されているメールアドレスで新規登録を試みる
2. 入力されたパスワードでログインを試みる
3. **パスワードが正しい場合**: 自動的にログインし、マイページにリダイレクト
4. **パスワードが間違っている場合**: ログイン画面に切り替え、パスワードのみクリア

---

### 2. パスワードリセット機能の修正

#### 問題点
- パスワードリセットメールは届くが、メール内のリンクをクリックしてもパスワード変更画面が表示されない
- URLハッシュフラグメント（`#access_token=...&type=recovery`）の検出とセッション確立のタイミングに問題があった

#### 修正内容

##### 2-1. Supabaseクライアントの設定追加

**ファイル:** `lib/supabase.js`, `lib/supabaseClient.js`

```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // URLハッシュからセッションを自動検出（追加）
  }
});
```

##### 2-2. パスワードリセットメールのリダイレクトURL修正

**ファイル:** `components/AuthModal.jsx`

**修正前:**
```javascript
const redirectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/` 
    : undefined;
```

**修正後:**
```javascript
const redirectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}` 
    : undefined;
```

##### 2-3. パスワードリセット処理フローの改善

**ファイル:** `app/page.jsx`

**修正前:**
- URLハッシュを検出後、`setTimeout`で1.5秒待ってから`getSession()`を呼び出し
- タイミングによってはセッションが確立される前に処理が実行される可能性があった

**修正後:**
- `onAuthStateChange`イベントリスナーで`PASSWORD_RECOVERY`イベントを待機
- Supabaseが自動的にハッシュからトークンを処理し、`PASSWORD_RECOVERY`イベントを発火
- イベント発火時にパスワード変更画面を表示

```javascript
// 認証状態の変更を監視
supabase.auth.onAuthStateChange((event, session) => {
    console.log('認証状態変更:', event, session?.user?.email);
    setUser(session?.user || null);
    
    // パスワードリセット後のセッション変更を検知
    if (event === 'PASSWORD_RECOVERY') {
        console.log('パスワードリカバリーイベント検出');
        if (session?.user) {
            setShowPasswordReset(true);
            setShowAuth(true);
            setView('portal');
            // ハッシュをクリア
            window.history.replaceState(null, '', window.location.pathname);
        }
    }
    // ... 他のイベント処理
});

// パスワードリセットリンクから来た場合の処理
if (hash && hash.includes('type=recovery')) {
    console.log('パスワードリセットリンクを検出しました:', hash);
    setView('portal');
    // onAuthStateChangeでPASSWORD_RECOVERYイベントが発火するのを待つ
    console.log('onAuthStateChangeでPASSWORD_RECOVERYイベントを待機中...');
}
```

#### 動作フロー

1. ユーザーが「パスワードを忘れた方」をクリック
2. メールアドレスを入力してリセットメールを送信
3. メール内のリンクをクリック
4. アプリのルートURL（`https://example.com/#access_token=...&type=recovery`）にリダイレクト
5. Supabaseが自動的にURLハッシュからトークンを処理
6. `PASSWORD_RECOVERY`イベントが発火
7. パスワード変更画面（`AuthModal`の`isChangePasswordMode`）が表示
8. 新しいパスワードを入力して変更
9. マイページにリダイレクト

---

## テスト方法

### 1. 同じメールでアカウント新規作成のテスト

#### ケース1: パスワードが正しい場合
1. 既に登録されているメールアドレスとパスワードで新規登録を試みる
2. 「このメールアドレスは既に登録されています。自動的にログインしました。」というメッセージが表示される
3. 自動的にログインし、マイページにリダイレクトされる

#### ケース2: パスワードが間違っている場合
1. 既に登録されているメールアドレスと間違ったパスワードで新規登録を試みる
2. 「このメールアドレスは既に登録されています。ログイン画面に切り替えます。」というメッセージが表示される
3. ログイン画面に切り替わり、メールアドレスは保持される
4. パスワードのみクリアされる

### 2. パスワードリセットのテスト

1. ログイン画面で「パスワードを忘れた方」をクリック
2. 登録済みのメールアドレスを入力
3. 「リセットメールを送信」をクリック
4. メールを確認し、リンクをクリック
5. **期待される動作**: パスワード変更画面が自動的に表示される
6. 新しいパスワードを入力（6文字以上）
7. 「パスワードを変更」をクリック
8. 「パスワードを変更しました。新しいパスワードでログインできます。」というメッセージが表示される
9. マイページにリダイレクトされる

---

## 技術的な詳細

### Supabaseの`PASSWORD_RECOVERY`イベント

Supabaseは、パスワードリセットリンクからアプリにアクセスした際、以下の処理を自動的に行います:

1. URLハッシュ（`#access_token=...&type=recovery`）からトークンを抽出
2. トークンを検証し、セッションを確立
3. `onAuthStateChange`コールバックで`PASSWORD_RECOVERY`イベントを発火

この仕組みを利用することで、タイミングの問題を解決し、確実にパスワード変更画面を表示できます。

### `detectSessionInUrl`オプション

Supabaseクライアントの`detectSessionInUrl`オプションを`true`に設定することで、URLハッシュからセッションを自動検出します。これにより、パスワードリセットリンクからのアクセス時に、手動で`getSession()`を呼び出す必要がなくなります。

---

## 注意事項

### Supabaseの設定確認

パスワードリセット機能が正しく動作するためには、Supabaseの設定を確認してください:

1. **Supabaseダッシュボード** → **Authentication** → **URL Configuration**
2. **Site URL**: アプリのルートURL（例: `https://shindan-quiz.makers.tokyo`）
3. **Redirect URLs**: パスワードリセット後のリダイレクト先URL（Site URLと同じでOK）

### メール送信の設定

Supabaseのメール送信が正しく設定されていることを確認してください:

1. **Supabaseダッシュボード** → **Authentication** → **Email Templates**
2. **Change Email (Confirmation)** テンプレートを確認
3. リンクが正しく設定されているか確認: `{{ .ConfirmationURL }}`

---

## まとめ

この修正により、以下の問題が解決されました:

1. ✅ 既に登録されているメールアドレスで新規登録を試みた際、パスワードが正しければ自動的にログイン
2. ✅ パスワードリセットメールのリンクをクリックした際、確実にパスワード変更画面が表示される
3. ✅ ユーザビリティの向上（不要な手順の削減）

これらの修正により、ユーザーの混乱を減らし、スムーズな認証体験を提供できます。

