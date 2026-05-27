'use client';

import Link from 'next/link';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogData } from '@/lib/blog-data';
import SiteFooter from '@/components/SiteFooter';

export default function BlogPage() {
  const { language } = useLanguage();
  const t = blogData[language as keyof typeof blogData] || blogData.en;

  return (
    <>
      <main className="content-page content-page-wide">
        <header className="content-hero centered">
          <span className="content-hero-icon" aria-hidden="true">
            <BookOpen size={24} />
          </span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </header>

        <div className="blog-list">
          {t.posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card panel">
              <div className="panel-body">
                <div className="blog-card-meta">
                  <Calendar size={14} />
                  <time dateTime={post.date}>{post.date}</time>
                </div>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-desc">{post.description}</p>
                <p className="blog-card-excerpt">{post.content}</p>
                <span className="blog-card-link">
                  {t.readMore}
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
