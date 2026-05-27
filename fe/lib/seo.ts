import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/blog-data';

export const SITE_URL = 'https://webdrop.online';

/** Parse blog display dates like "November 21, 2025" for structured data. */
export function parseBlogDate(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toISOString();
}

export function buildSitemapEntries(): MetadataRoute.Sitemap {
  const posts = getAllBlogPosts('en');

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date('2025-11-20'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog/`,
      lastModified: new Date('2025-11-21'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}/`,
      lastModified: parseBlogDate(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/privacy-policy.html`,
      lastModified: new Date('2025-08-04'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms-of-service.html`,
      lastModified: new Date('2025-08-04'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/copyright.html`,
      lastModified: new Date('2025-08-04'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
