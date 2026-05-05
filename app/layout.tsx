import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Navbar } from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'AI Learning Hub',
  description: 'AI 학습 자료 아카이브 웹앱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-bg-main text-text-main font-sans antialiased min-h-screen">
        <ErrorBoundary>
          <div className="flex min-h-screen overflow-x-hidden">
            <Navbar />
            <main className="flex-1 lg:ml-[260px] pt-16 lg:pt-0 min-h-screen w-full transition-all duration-300">
              {children}
            </main>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
