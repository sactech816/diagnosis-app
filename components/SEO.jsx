import React from 'react';

const SEO = ({ title, description, image }) => {
    // AI向けの構造化データ（リッチリザルト対応）
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "診断クイズメーカー",
        "alternateName": ["診断メーカー", "クイズ作成ツール", "診断作成ツール"],
        "description": description || "診断クイズメーカーは、AIが自動で診断・検定・占いを作成できる無料ツール。性格診断、心理テスト、適職診断などを簡単に作成・公開できます。",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "JPY"
        },
        "featureList": ["AI自動生成", "診断クイズ作成", "性格診断作成", "心理テスト作成", "適職診断作成", "占い作成", "無料利用", "簡単公開"],
        "keywords": "診断クイズメーカー, 診断メーカー, クイズ作成, 性格診断, 心理テスト, 適職診断, AI診断"
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
            <meta name="google-site-verification" content="YamlBcefF4QY3_gsWPgflXrn5EoM0Fndb-bQ8GMFVjU" />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
        </>
    );
};

export default SEO;