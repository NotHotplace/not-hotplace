import type { Metadata } from "next";
import "./globals.css";
import "./product.css";
import "./discovery.css";
import "./launch.css";
import "./quiet.css";
import "./atlas.css";

export const metadata: Metadata = {
  title: "Not_Hotplace — 우리는 휴식을 원한다",
  description: "전국에서 찾는 나만의 휴식. 체크형 방문 후기와 함께 음식점, 카페, 드라이브 코스를 탐색하세요.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
