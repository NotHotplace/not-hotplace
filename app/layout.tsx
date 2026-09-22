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
import {LanguageProvider} from "./locale";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "NotHotplace | Find your room to breathe",
  description: SITE_DESCRIPTION,
  applicationName: 'NotHotplace',
  manifest: '/manifest.webmanifest',
  appleWebApp: {capable: true, title: 'NotHotplace', statusBarStyle: 'black-translucent'},
  openGraph: {type: 'website', locale: 'en_US', alternateLocale: ['ko_KR'], siteName: 'NotHotplace', title: 'NotHotplace — Find your room to breathe', description: SITE_DESCRIPTION, images: [{url:'/og.png',width:1200,height:630}]},
  twitter: {card:'summary_large_image',title:'NotHotplace — Find your room to breathe',description:SITE_DESCRIPTION,images:['/og.png']},
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
    <html lang="en" className="dark">
      <body className="antialiased"><LanguageProvider><AppRuntime/>{children}</LanguageProvider></body>
    </html>
  );
}
