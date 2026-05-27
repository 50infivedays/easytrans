'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getBlogPost, blogData } from '@/lib/blog-data';
import SiteFooter from '@/components/SiteFooter';

interface BlogPostContentProps {
  slug: string;
}

export default function BlogPostContent({ slug }: BlogPostContentProps) {
  const { language } = useLanguage();

  let post = getBlogPost(slug, language);
  if (!post) {
    post = getBlogPost(slug, 'en');
  }

  const t = blogData[language as keyof typeof blogData] || blogData.en;
  const backToBlog = language === 'zh' ? '返回博客' : language === 'es' ? 'Volver al blog' : language === 'ru' ? 'Назад к блогу' : 'Back to Blog';
  const notFoundTitle = language === 'zh' ? '文章未找到' : language === 'es' ? 'Artículo no encontrado' : language === 'ru' ? 'Статья не найдена' : 'Post Not Found';
  const notFoundDesc =
    language === 'zh'
      ? '抱歉，我们找不到您要查找的文章。'
      : language === 'es'
        ? 'Lo sentimos, no encontramos el artículo.'
        : language === 'ru'
          ? 'К сожалению, статья не найдена.'
          : "Sorry, we couldn't find the post you're looking for.";

  const parseInlineMarkdown = (text: string) => {
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let key = 0;
    const regex = /(\*\*(.+?)\*\*)|(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s]+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      if (match[1]) {
        parts.push(<strong key={key++}>{match[2]}</strong>);
      } else if (match[3]) {
        parts.push(
          <a key={key++} href={match[5]} target="_blank" rel="noopener noreferrer">
            {match[4]}
          </a>
        );
      } else if (match[6]) {
        parts.push(
          <a key={key++} href={match[6]} target="_blank" rel="noopener noreferrer" className="break-all">
            {match[6]}
          </a>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const renderContent = () => {
    if (!post?.fullContent) {
      return <p>{parseInlineMarkdown(post?.content || '')}</p>;
    }

    return post.fullContent.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('## ')) {
        return <h2 key={index}>{parseInlineMarkdown(paragraph.replace('## ', ''))}</h2>;
      }
      if (paragraph.startsWith('### ')) {
        return <h3 key={index}>{parseInlineMarkdown(paragraph.replace('### ', ''))}</h3>;
      }
      if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter((line) => line.startsWith('- '));
        return (
          <ul key={index}>
            {items.map((item, i) => (
              <li key={i}>{parseInlineMarkdown(item.replace('- ', ''))}</li>
            ))}
          </ul>
        );
      }
      if (/^\d+\./.test(paragraph)) {
        const items = paragraph.split('\n').filter((line) => /^\d+\./.test(line));
        return (
          <ol key={index}>
            {items.map((item, i) => (
              <li key={i}>{parseInlineMarkdown(item.replace(/^\d+\.\s/, ''))}</li>
            ))}
          </ol>
        );
      }
      return <p key={index}>{parseInlineMarkdown(paragraph)}</p>;
    });
  };

  if (!post) {
    return (
      <>
        <main className="content-page">
          <div className="panel empty-state-panel">
            <h1>{notFoundTitle}</h1>
            <p>{notFoundDesc}</p>
            <div className="content-nav" style={{ justifyContent: 'center' }}>
              <Link href="/blog" className="btn btn-ghost">
                <ArrowLeft size={16} />
                {backToBlog}
              </Link>
              <Link href="/" className="btn btn-primary">
                {t.backToHome}
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <main className="content-page">
        <nav className="content-nav" aria-label="Breadcrumb">
          <Link href="/blog" className="btn btn-ghost">
            <ArrowLeft size={16} />
            {backToBlog}
          </Link>
          <Link href="/" className="btn btn-ghost">
            {t.backToHome}
          </Link>
        </nav>

        <article className="panel article-panel">
          <header className="panel-header">
            <div className="article-date">
              <Calendar size={14} />
              <time dateTime={post.date}>{post.date}</time>
            </div>
            <h1 className="article-title">{post.title}</h1>
            <p className="article-lead">{post.description}</p>
          </header>
          <div className="panel-body prose-content">{renderContent()}</div>
        </article>

        <nav className="content-nav" style={{ marginTop: 24 }}>
          <Link href="/blog" className="btn btn-ghost">
            <ArrowLeft size={16} />
            {backToBlog}
          </Link>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
