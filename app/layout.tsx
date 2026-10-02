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

/* Set NEXT_PUBLIC_SITE_URL to your deployed origin so og:image and canonical
   links resolve to absolute URLs. Vercel exposes VERCEL_URL automatically. */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const description =
  'Scroll-driven portfolio of Suyash Pandey — AI & Data Science engineer, developer and creative technologist. Five internships, one continuous story.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${personalInfo.name} — Don't just scroll. Experience it.`,
  description,
  applicationName: `${personalInfo.name} — Portfolio`,
  keywords: [
    'Suyash Pandey',
    'AI engineer',
    'data science',
    'creative developer',
    'portfolio',
    'GSAP',
    'Next.js',
  ],
  authors: [{ name: personalInfo.name }],
  creator: personalInfo.name,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${personalInfo.name} — Portfolio`,
    description,
    type: 'website',
    url: '/',
    siteName: `${personalInfo.name} — Portfolio`,
    locale: 'en_US',
    /* image comes from app/opengraph-image.png via the file convention */
  },
  twitter: {
    card: 'summary_large_image',
    title: `${personalInfo.name} — Portfolio`,
    description,
    /* image comes from app/twitter-image.png via the file convention */
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
