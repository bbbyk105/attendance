// app/page.tsx
import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { AttendanceApp } from "@/components/attendance/AttendanceApp";

export const metadata: Metadata = {
  title: "勤怠管理システム | 効率的な労働時間管理",
  description:
    "従業員の出勤・退勤時間、休憩時間、残業時間を効率的に管理できる勤怠管理システム。CSV出力、統計表示、ユーザー管理機能を搭載。",
  keywords: [
    "勤怠管理",
    "タイムカード",
    "労働時間管理",
    "出勤管理",
    "残業管理",
    "CSV出力",
  ],
  authors: [{ name: "Your Company" }],
  creator: "Your Company",
  publisher: "Your Company",
  robots: {
    index: false, // 社内システムなのでクロール禁止
    follow: false,
  },
  openGraph: {
    title: "勤怠管理システム",
    description: "効率的な労働時間管理を実現する勤怠管理システム",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    title: "勤怠管理システム",
    description: "効率的な労働時間管理を実現する勤怠管理システム",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

// 構造化データ
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "勤怠管理システム",
  description: "従業員の労働時間を効率的に管理するWebアプリケーション",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  featureList: [
    "出勤・退勤時間記録",
    "休憩時間管理",
    "残業時間計算",
    "CSV出力機能",
    "統計表示",
    "ユーザー管理",
  ],
};

export default function HomePage() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* メインコンテンツ */}
      <AuthProvider>
        <ProtectedLayout>
          <main role="main" className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
              <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                  勤怠管理システム
                </h1>
                <p className="text-muted-foreground text-lg">
                  効率的な労働時間管理で生産性を向上
                </p>
              </header>

              <AttendanceApp />
            </div>
          </main>
        </ProtectedLayout>
      </AuthProvider>
    </>
  );
}
