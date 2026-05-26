'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getBlogPost, blogData, type BlogPost } from '@/lib/blog-data';
import { Button } from '@/components/ui/button';

interface BlogPostContentProps {
  slug: string;
}

export default function BlogPostContent({ slug }: BlogPostContentProps) {
  const { language } = useLanguage();
  
  // 先尝试获取当前语言版本，如果找不到则使用英文版本
  let post = getBlogPost(slug, language);
  if (!post) {
    post = getBlogPost(slug, 'en');
  }
  
  const t = blogData[language as keyof typeof blogData] || blogData.en;

  // 解析内联 Markdown 格式（加粗、链接等）
  const parseInlineMarkdown = (text: string) => {
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let key = 0;

    // 匹配 **加粗**、[链接](url) 和裸露的 URL
    const regex = /(\*\*(.+?)\*\*)|(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s]+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // 添加匹配前的普通文本
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      if (match[1]) {
        // 加粗文本 **text**
        parts.push(
          <strong key={key++} className="font-bold text-gray-900">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Markdown 链接 [text](url)
        parts.push(
          <a
            key={key++}
            href={match[5]}
            className="text-primary hover:underline font-medium transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {match[4]}
          </a>
        );
      } else if (match[6]) {
        // 裸露的 URL（如 https://webdrop.online）
        const url = match[6];
        parts.push(
          <a
            key={key++}
            href={url}
            className="text-primary hover:underline font-medium transition-colors break-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            {url}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    // 添加剩余的文本
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Update document title and meta tags for SEO
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | WebDrop Blog`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', post.description);

      // Update OG tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', `${post.title} | WebDrop Blog`);

      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', post.description);

      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', `https://webdrop.online/blog/${post.slug}`);
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen p-4 md:p-8 pt-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {language === 'zh' ? '文章未找到' : 'Post Not Found'}
              </h1>
              <p className="text-gray-600 mb-6">
                {language === 'zh' 
                  ? '抱歉，我们找不到您要查找的文章。' 
                  : 'Sorry, we couldn\'t find the post you\'re looking for.'}
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/blog">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {language === 'zh' ? '返回博客' : 'Back to Blog'}
                  </Button>
                </Link>
                <Link href="/">
                  <Button>
                    <Home className="w-4 h-4 mr-2" />
                    {t.backToHome}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pt-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Link href="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {language === 'zh' ? '返回博客' : 'Back to Blog'}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              {t.backToHome}
            </Button>
          </Link>
        </div>

        {/* Article */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{post.date}</span>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900">
              {post.title}
            </CardTitle>
            <p className="text-lg text-gray-600 leading-relaxed">
              {post.description}
            </p>
          </CardHeader>
          <CardContent>
            <article className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed space-y-4">
                {post.fullContent ? (
                  post.fullContent.split('\n\n').map((paragraph, index) => {
                    // Handle markdown-style headings
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                          {parseInlineMarkdown(paragraph.replace('## ', ''))}
                        </h2>
                      );
                    }
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3">
                          {parseInlineMarkdown(paragraph.replace('### ', ''))}
                        </h3>
                      );
                    }
                    // Handle lists
                    if (paragraph.startsWith('- ')) {
                      const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                      return (
                        <ul key={index} className="list-disc list-inside space-y-2 my-4">
                          {items.map((item, i) => (
                            <li key={i} className="text-gray-700">
                              {parseInlineMarkdown(item.replace('- ', ''))}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    if (/^\d+\./.test(paragraph)) {
                      const items = paragraph.split('\n').filter(line => /^\d+\./.test(line));
                      return (
                        <ol key={index} className="list-decimal list-inside space-y-2 my-4">
                          {items.map((item, i) => (
                            <li key={i} className="text-gray-700">
                              {parseInlineMarkdown(item.replace(/^\d+\.\s/, ''))}
                            </li>
                          ))}
                        </ol>
                      );
                    }
                    // Regular paragraphs
                    return (
                      <p key={index} className="text-gray-700 leading-relaxed">
                        {parseInlineMarkdown(paragraph)}
                      </p>
                    );
                  })
                ) : (
                  <p className="text-gray-700 leading-relaxed">{parseInlineMarkdown(post.content)}</p>
                )}
              </div>
            </article>
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <div className="flex gap-3 flex-wrap pb-8">
          <Link href="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {language === 'zh' ? '返回博客' : 'Back to Blog'}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              {t.backToHome}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

