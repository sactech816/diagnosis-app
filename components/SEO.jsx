import React from 'react';

const SEO = ({ title, description, image }) => {
    // AI向けの構造化データ（リッチリザルト対応）
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "診断クイズメーカー",
        "description": description || "AIが自動で診断・検定・占いを作成。集客や教育に使えるクイズ作成ツール。",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "JPY"
        },
        "featureList": ["AI生成", "診断作成", "テスト作成", "占い作成", "LINE連携"]
    };

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image || ""} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image || ""} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
        </>
    );
};

export default SEO;