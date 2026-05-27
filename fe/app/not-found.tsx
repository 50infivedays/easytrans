import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';

export default function NotFound() {
  return (
    <>
      <main className="content-page">
        <div className="panel empty-state-panel">
          <p className="panel-label">404</p>
          <h1>Page not found</h1>
          <p>The page you are looking for does not exist or has been moved.</p>
          <div className="content-nav" style={{ justifyContent: 'center' }}>
            <Link href="/" className="btn btn-primary">
              Back to WebDrop
            </Link>
            <Link href="/blog/" className="btn btn-ghost">
              Visit Blog
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
