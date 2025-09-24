import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: "IAmHere - AI Travel Shot",
  description: "AI 带你环游世界，只需一张自拍。用户上传自拍,在世界地图选点,AI生成身临其境的旅行大片。",
  keywords: ["AI", "travel", "photo", "generation", "selfie", "world", "map"],
  authors: [{ name: "IAmHere Team" }],
  openGraph: {
    title: "IAmHere - AI Travel Shot",
    description: "AI 带你环游世界，只需一张自拍",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
