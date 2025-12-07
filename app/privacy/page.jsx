"use client";

// Privacyページ用のラッパー
// ブラウザのリロードや直接URLアクセスに対応するため
// メインのpage.jsxと同じコンポーネントを使用
import App from '../page';

export default function PrivacyPage() {
    return <App />;
}
