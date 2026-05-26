'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, Home, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogData } from '@/lib/blog-data';
import { Button } from '@/components/ui/button';

export default function BlogPage() {
  const { language } = useLanguage();
  const t = blogData[language as keyof typeof blogData] || blogData.en;

  return (
    <div className="min-h-screen p-4 md:p-8 pt-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back to Home Button */}
        <div>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              {t.backToHome}
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-white/60 shadow-sm ring-1 ring-white/50">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight drop-shadow-sm">
            {t.title}
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Blog Posts */}
        <div className="space-y-6">
          {t.posts.map((post, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
                <CardTitle className="text-2xl">{post.title}</CardTitle>
                <CardDescription className="text-base">{post.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{post.content}</p>
                <Link href={`/blog/${post.slug}`}>
                  <Button variant="default" className="gap-2 group">
                    {t.readMore}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="pb-8">
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

