import type { Metadata, Viewport } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { personalInfo } from '@/data/content';

const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${personalInfo.name} — Don't just scroll. Experience it.`,
  description:
    'Scroll-driven portfolio of Suyash Pandey — AI & Data Science engineer, developer and creative technologist. Five internships, one continuous story.',
  authors: [{ name: personalInfo.name }],
  openGraph: {
    title: `${personalInfo.name} — Portfolio`,
    description: 'An interactive, scroll-driven portfolio experience.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#07070a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
