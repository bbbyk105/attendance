// app/metadata.ts
import type { Metadata } from "next";

export const siteConfig = {
  name: "勤怠管理システム",
  description:
    "従業員の出勤・退勤時間、休憩時間、残業時間を効率的に管理できる勤怠管理システム。CSV出力、統計表示、ユーザー管理機能を搭載。",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: [
    "勤怠管理",
    "タイムカード",
    "労働時間管理",
    "出勤管理",
    "退勤管理",
    "残業管理",
    "CSV出力",
    "統計表示",
    "ユーザー管理",
    "従業員管理",
    "Next.js",
    "TypeScript",
    "React",
  ],
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "Your Company",
      url: siteConfig.url,
    },
  ],
  creator: "Your Company",
  publisher: "Your Company",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: false, // 社内システムなのでクロール禁止
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@yourcompany",
  },
  verification: {
    // 必要に応じてGoogle Search Consoleの認証コードを追加
    // google: 'your-google-verification-code',
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "ja-JP": siteConfig.url,
    },
  },
};

// ページ固有のメタデータ生成ヘルパー
export function generatePageMetadata(
  title: string,
  description?: string,
  path?: string
): Metadata {
  const pageUrl = path ? `${siteConfig.url}${path}` : siteConfig.url;

  return {
    title,
    description: description || siteConfig.description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: description || siteConfig.description,
      url: pageUrl,
    },
    twitter: {
      title: `${title} | ${siteConfig.name}`,
      description: description || siteConfig.description,
    },
  };
}
