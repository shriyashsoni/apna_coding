import { next, rewrite } from '@vercel/edge';

/**
 * Global Metadata & SEO Middleware for Apna Coding.
 * Intercepts requests from social media crawlers and search engine bots
 * on all dynamic content routes and serves high-performance, server-rendered SEO tags.
 */
export default function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Comprehensive list of crawlers across all major platforms
  const bots = [
    'WhatsApp',
    'TelegramBot',
    'Twitterbot',
    'facebookexternalhit',
    'Slackbot',
    'Discordbot',
    'LinkedInBot',
    'Pinterestbot',
    'Googlebot',
    'Bingbot',
    'SkypeUriPreview',
    'Instagram',
    'AppleNewsBot',
    'Baiduspider',
    'YandexBot'
  ];

  const isBot = bots.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Scalable list of dynamic paths supported by the SEO engine
  const dynamicPaths = [
    '/hackathons/',
    '/events/',
    '/event-groups/',
    '/jobs/',
    '/products/',
    '/news/',
    '/community/',
    '/verify/',
    '/blog/',
    '/courses/',
    '/internships/',
    '/projects/',
    '/startups/',
    '/opportunities/'
  ];

  const isDynamicPath = dynamicPaths.some(p => pathname.startsWith(p));

  // If it's a bot hitting a dynamic path, rewrite to our production SEO engine
  if (isBot && isDynamicPath) {
    const previewUrl = new URL('/api/og-preview', request.url);
    previewUrl.searchParams.set('path', pathname);
    return rewrite(previewUrl);
  }

  // Continue as normal for all other requests (Real users see the Vite SPA)
  return next();
}

// Ensure the middleware runs for all potential dynamic segments
export const config = {
  matcher: [
    '/hackathons/:path*',
    '/events/:path*',
    '/event-groups/:path*',
    '/jobs/:path*',
    '/products/:path*',
    '/news/:path*',
    '/community/:path*',
    '/verify/:path*',
    '/blog/:path*',
    '/courses/:path*',
    '/internships/:path*',
    '/projects/:path*',
    '/startups/:path*',
    '/opportunities/:path*'
  ],
};
