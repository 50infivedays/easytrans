import type { Metadata, Viewport } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import "./workspace.css";
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import { LanguageProvider } from '@/contexts/LanguageContext';

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "WebDrop - Secure P2P File Transfer & Real-time Chat | Drop Files Instantly",
  description: "WebDrop: Secure P2P file transfer & real-time chat. Drop files instantly with end-to-end encryption, no size limits, no server storage. Fast, private, and free.",
  keywords: ["airdrop", "snapdrop", "webdrop", "file transfer", "share files", "p2p file sharing", "send anywhere", "large file transfer", "webrtc", "secure transfer"],
  authors: [{ name: "WebDrop" }],
  creator: "WebDrop",
  publisher: "WebDrop",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://webdrop.online'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'zh-CN': '/',
      'zh-TW': '/',
      'zh-HK': '/',
      'es': '/',
      'ru': '/',
      'x-default': '/',
    },
  },
  openGraph: {
    title: "WebDrop - Secure P2P File Transfer & Real-time Chat",
    description: "Drop files instantly with end-to-end encryption. No size limits, no server storage. Fast, private, and free.",
    url: 'https://webdrop.online',
    siteName: 'WebDrop',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'WebDrop Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "WebDrop - Secure P2P File Transfer & Real-time Chat",
    description: "Drop files instantly with end-to-end encryption. No size limits, no server storage. Fast, private, and free.",
    images: ['/android-chrome-512x512.png'],
    creator: '@webdrop',
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
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicon.ico' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WebDrop',
  },
  applicationName: 'WebDrop',
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: '#f6f5f2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SF9EWZDX5Q"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SF9EWZDX5Q');
          `}
        </Script>

        <Script id="structured-data" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://webdrop.online/#organization",
                "name": "WebDrop",
                "url": "https://webdrop.online",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://webdrop.online/android-chrome-512x512.png",
                  "width": 512,
                  "height": 512
                },
                "description": "Secure P2P file transfer & real-time chat with end-to-end encryption",
                "foundingDate": "2025",
                "sameAs": []
              },
              {
                "@type": "WebApplication",
                "@id": "https://webdrop.online/#app",
                "name": "WebDrop",
                "alternateName": ["Web Drop", "webdrop.online"],
                "description": "Secure P2P file transfer & real-time chat. Drop files instantly with end-to-end encryption, no size limits, no server storage.",
                "url": "https://webdrop.online",
                "logo": "https://webdrop.online/android-chrome-512x512.png",
                "datePublished": "2025-01-01",
                "dateModified": "2025-11-20",
                "applicationCategory": "CommunicationApplication",
                "operatingSystem": "Web Browser, Cross-platform",
                "browserRequirements": "Requires JavaScript. Requires HTML5.",
                "softwareVersion": "1.0",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock"
                },
                "featureList": [
                  "P2P File Transfer",
                  "End-to-End Encryption",
                  "Real-Time Chat",
                  "Instant File Drop",
                  "No Size Limits",
                  "No Server Storage",
                  "Privacy Protection",
                  "WebRTC Technology",
                  "Cross-platform Support",
                  "Drag and Drop Interface"
                ],
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "1250",
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "author": { "@id": "https://webdrop.online/#organization" }
              },
              {
                "@type": "FAQPage",
                "@id": "https://webdrop.online/#faq",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Is WebDrop secure?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, WebDrop uses end-to-end encryption and P2P technology. Files are transferred directly between devices without passing through our servers."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is there a file size limit?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "No, WebDrop supports unlimited file sizes. Transfer speed depends on your network connection."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Do you store my files?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "No, WebDrop never stores your files. All transfers are peer-to-peer, directly between your devices."
                    }
                  }
                ]
              }
            ]
          })}
        </Script>

        <link rel="dns-prefetch" href="https://api.webdrop.online" />
      </head>
      <body className={`antialiased app-shell ${outfit.variable} ${dmSans.variable}`}>
        <div className="ambient" aria-hidden="true" />
        <LanguageProvider>
          <Navbar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
