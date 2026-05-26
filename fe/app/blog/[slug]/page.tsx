import { getAllBlogPosts } from '@/lib/blog-data';
import BlogPostContent from '@/components/BlogPostContent';

// Generate static params for all blog posts
export function generateStaticParams() {
  const posts = getAllBlogPosts('en');
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  return <BlogPostContent slug={slug} />;
}

