import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { CubismProvider } from '@/components/providers/cubism-provider';
import { Toaster } from '@/components/ui/toaster';
import { EmotionProvider } from '@/lib/emotions/context';
import { ScriptProvider } from '@/components/providers/script-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chat App',
  description: 'Modern chat application with media previews',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ScriptProvider />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <EmotionProvider>
            {children}
          </EmotionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}