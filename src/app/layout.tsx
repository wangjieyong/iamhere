import type { Metadata } from 'next'
import './globals.css'
import { Providers } from "./providers";
import { Analytics } from '@vercel/analytics/react';
import { generateMetadata as getMetadata } from '@/lib/metadata'

export const metadata: Metadata = getMetadata()

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
