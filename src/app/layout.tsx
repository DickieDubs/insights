// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'InsightPulse',
  description: 'Consumer Insights Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>{/* Added suppressHydrationWarning for theme persistence */}
      <body className={`${inter.variable} font-sans antialiased bg-secondary text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
