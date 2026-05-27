import type { Metadata } from 'next';
import Script from 'next/script';
import { getAllBlogPosts, getBlogPost } from '@/lib/blog-data';
import { parseBlogDate, SITE_URL } from '@/lib/seo';
import BlogPostContent from '@/components/BlogPostContent';

export function generateStaticParams() {
  const posts = getAllBlogPosts('en');
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const postEn = getBlogPost(slug, 'en');
  const postZh = getBlogPost(slug, 'zh');
  const post = postEn || postZh;

  if (!post) {
    return {
      title: 'Post Not Found | WebDrop Blog',
      robots: { index: false, follow: true },
    };
  }

  const canonical = `/blog/${slug}/`;
  const url = `${SITE_URL}/blog/${slug}/`;

  return {
    title: `${post.title} | WebDrop Blog`,
    description: post.description,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        'zh-CN': canonical,
        'x-default': canonical,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: 'WebDrop',
      type: 'article',
      publishedTime: parseBlogDate(post.date),
      locale: postEn ? 'en_US' : 'zh_CN',
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug, 'en') || getBlogPost(slug, 'zh');

  return (
    <>
      {post && (
        <Script id={`blog-schema-${slug}`} type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: parseBlogDate(post.date),
            author: { '@type': 'Organization', name: 'WebDrop' },
            publisher: {
              '@type': 'Organization',
              name: 'WebDrop',
              logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/android-chrome-512x512.png`,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${SITE_URL}/blog/${slug}/`,
            },
          })}
        </Script>
      )}
      <BlogPostContent slug={slug} />
    </>
  );
}
