import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from '@/components/user-provider';
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kanba - Open-source Project Management Tool',
  description: 'Project Management Reimagined for Builders',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      { url: '/icon-black.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-white.png', media: '(prefers-color-scheme: dark)' }
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico'
  },
  manifest: '/web-app-manifest-512x512.png',
  openGraph: {
    title: 'Kanba - Open-source Project Management Tool',
    description: 'Project Management Reimagined for Builders',
    url: 'https://kanba.co',
    siteName: 'Kanba',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kanba - Open-source Project Management Tool'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kanba - Open-source Project Management Tool',
    description: 'Project Management Reimagined for Builders',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  authors: [{ name: 'Kanba Team' }],
  keywords: ['kanban', 'project management', 'task management', 'productivity', 'open source', 'builders', 'developers'],
  category: 'Productivity',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        
          <UserProvider>
          <Analytics />
            {children}
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}