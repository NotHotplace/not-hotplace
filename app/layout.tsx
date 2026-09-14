import type { Metadata, Viewport } from "next";
import {SITE_URL, SITE_DESCRIPTION} from '@/lib/seo';
import AppRuntime from './app-runtime';
import "./globals.css";
import "./product.css";
import "./discovery.css";
import "./launch.css";
import "./quiet.css";
import "./atlas.css";
import "./update.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "NotHotplace | 조용한 카페·음식점·드라이브",
  description: SITE_DESCRIPTION,
  applicationName: 'NotHotplace',
  manifest: '/manifest.webmanifest',
  appleWebApp: {capable: true, title: 'NotHotplace', statusBarStyle: 'black-translucent'},
  openGraph: {type: 'website', locale: 'ko_KR', siteName: 'NotHotplace', title: 'NotHotplace — 우리는 휴식을 원한다', description: SITE_DESCRIPTION, images: [{url:'/og.png',width:1200,height:630}]},
  twitter: {card:'summary_large_image',title:'NotHotplace — 우리는 휴식을 원한다',description:SITE_DESCRIPTION,images:['/og.png']},
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: '/icons/apple-touch-icon.png',
  },
};
export const viewport: Viewport = {width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#0b0b0b'};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased"><AppRuntime/>{children}</body>
    </html>
  );
}
