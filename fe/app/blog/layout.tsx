import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Blog | WebDrop — Secure P2P File Transfer',
  description:
    'WebDrop blog: tutorials, security guides, and updates on peer-to-peer file transfer and real-time chat in the browser.',
  alternates: {
    canonical: '/blog/',
  },
  openGraph: {
    title: 'WebDrop Blog',
    description:
      'Tutorials, security guides, and updates on P2P file transfer and browser-based sharing.',
    url: 'https://webdrop.online/blog/',
    siteName: 'WebDrop',
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="blog-schema" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'WebDrop Blog',
          url: 'https://webdrop.online/blog/',
          publisher: {
            '@type': 'Organization',
            name: 'WebDrop',
            logo: {
              '@type': 'ImageObject',
              url: 'https://webdrop.online/android-chrome-512x512.png',
            },
          },
        })}
      </Script>
      {children}
    </>
  );
}
