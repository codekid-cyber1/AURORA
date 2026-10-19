import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aurora Home — Minimalist Storefront',
  description:
    'Modern minimalist product showcase web application with direct-to-WhatsApp ordering and a built-in Admin Dashboard for catalog management.',
  openGraph: {
    title: 'Aurora Home — Minimalist Storefront',
    description:
      'Modern minimalist product showcase web application with direct-to-WhatsApp ordering and a built-in Admin Dashboard for catalog management.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurora Home — Minimalist Storefront',
    description:
      'Modern minimalist product showcase web application with direct-to-WhatsApp ordering and a built-in Admin Dashboard for catalog management.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#F8F7F4] font-sans text-[#1A1A1A] antialiased selection:bg-[#1B4D3E] selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}
