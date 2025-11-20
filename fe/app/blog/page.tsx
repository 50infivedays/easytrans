'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-white/60 shadow-sm ring-1 ring-white/50">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight drop-shadow-sm">
            WebDrop Blog
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Latest updates, tutorials, and insights about secure file sharing
          </p>
        </div>

        {/* Blog Posts - Placeholder */}
        <div className="space-y-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Calendar className="w-4 h-4" />
                <span>November 20, 2025</span>
              </div>
              <CardTitle>Welcome to WebDrop</CardTitle>
              <CardDescription>
                Introducing secure, peer-to-peer file transfer and real-time chat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                WebDrop is a revolutionary platform for secure file sharing and real-time communication. 
                Using cutting-edge WebRTC technology, we enable direct peer-to-peer connections with 
                end-to-end encryption, ensuring your files and messages stay private.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Calendar className="w-4 h-4" />
                <span>November 15, 2025</span>
              </div>
              <CardTitle>How P2P File Transfer Works</CardTitle>
              <CardDescription>
                Understanding the technology behind WebDrop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Peer-to-peer file transfer eliminates the need for centralized servers. Your files 
                go directly from one device to another, providing faster transfers and complete privacy. 
                Learn how WebRTC makes this possible.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Calendar className="w-4 h-4" />
                <span>November 10, 2025</span>
              </div>
              <CardTitle>Security Best Practices</CardTitle>
              <CardDescription>
                Tips for staying safe while sharing files online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                While WebDrop provides end-to-end encryption, it's important to follow security 
                best practices. Only share your UID with trusted contacts, and always verify 
                the identity of users before transferring sensitive files.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

