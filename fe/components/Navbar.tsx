'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, BookOpen } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Site Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
              <Image
                src="/favicon.ico"
                alt="WebDrop"
                width={32}
                height={32}
                className="rounded-md"
              />
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
              WebDrop
            </span>
          </Link>

          {/* Right side - Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary transition-all duration-200 font-medium"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary transition-all duration-200 font-medium"
            >
              <BookOpen className="w-5 h-5" />
              <span className="hidden sm:inline">Blog</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

