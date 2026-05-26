'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, BookOpen } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar() {
  const { language, setLanguage } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          {/* Left side - Logo and Site Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-110 duration-200">
              <Image
                src="/favicon.ico"
                alt="WebDrop"
                width={32}
                height={32}
                className="rounded-md"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-primary transition-all duration-300">
              WebDrop
            </span>
          </Link>

          {/* Right side - Navigation Links & Language Switcher */}
          <div className="flex items-center gap-1 md:gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-200 font-medium"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-200 font-medium"
            >
              <BookOpen className="w-5 h-5" />
              <span className="hidden sm:inline">Blog</span>
            </Link>
            
            {/* Divider */}
            <div className="h-6 w-px bg-gray-300 mx-1 md:mx-2" />
            
            {/* Language Switcher */}
            <div className="flex items-center">
              <LanguageSwitcher
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

