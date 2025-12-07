"use client";

// Priceページ用のラッパー
// ブラウザのリロードや直接URLアクセスに対応するため
// メインのpage.jsxと同じコンポーネントを使用
import App from '../page';

export default function PricePage() {
    return <App />;
}
