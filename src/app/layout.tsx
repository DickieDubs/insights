import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Use Inter for a clean sans-serif look
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context'; // Import AuthProvider
import ProtectedRoute from '@/components/auth/protected-route'; // Import ProtectedRoute

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' }); // Changed font to Inter

export const metadata: Metadata = {
  title: 'InsightPulse', // Updated title
  description: 'Consumer Insights Dashboard', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-secondary text-foreground`}>
        <AuthProvider> {/* Wrap everything with AuthProvider */}
          <ProtectedRoute> {/* Apply route protection */}
            {children}
          </ProtectedRoute>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
