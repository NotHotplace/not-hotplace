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
import "./world.css";
import "./visit.css";
import "./place-page.css";
import "./comfort.css";
import "./places-first.css";
import "./refinement.css";
import "./community.css";
import "./upgrade.css";
import "./growth.css";
import "./warm-brand.css";
import {LanguageProvider} from "./locale";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "NotHotplace | Find your room to breathe",
  description: SITE_DESCRIPTION,
  applicationName: 'NotHotplace',
  manifest: '/manifest.webmanifest',
  appleWebApp: {capable: true, title: 'NotHotplace', statusBarStyle: 'default'},
  openGraph: {type: 'website', locale: 'en_US', alternateLocale: ['ko_KR'], siteName: 'NotHotplace', title: 'NotHotplace — Find your room to breathe', description: SITE_DESCRIPTION, images: [{url:'/og.png',width:1200,height:630}]},
  twitter: {card:'summary_large_image',title:'NotHotplace — Find your room to breathe',description:SITE_DESCRIPTION,images:['/og.png']},
};
export const viewport: Viewport = {width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#F7F1E5'};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg"/>
        <link rel="shortcut icon" href="/favicon.svg"/>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>
      </head>
      <body className="antialiased"><LanguageProvider><AppRuntime/>{children}</LanguageProvider></body>
    </html>
  );
}
