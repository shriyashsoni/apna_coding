import { next, rewrite } from '@vercel/edge';

/**
 * Middleware to handle social media crawler previews for a Vite SPA.
 * Detects bots (WhatsApp, Telegram, Twitter, etc.) and rewrites their requests
 * to an API route that serves server-rendered Open Graph meta tags.
 */
export default function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // List of common social media and search engine crawlers
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
    'SkypeUriPreview'
  ];

  const isBot = bots.some(bot => userAgent.includes(bot));
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Define paths that have dynamic content (hackathons, jobs, news, etc.)
  const dynamicPaths = [
    '/hackathons/',
    '/events/',
    '/event-groups/',
    '/jobs/',
    '/products/',
    '/news/',
    '/community/',
    '/verify/'
  ];

  const isDynamicPath = dynamicPaths.some(p => pathname.startsWith(p));

  // If it's a bot hitting a dynamic path, rewrite to the OG preview generator
  if (isBot && isDynamicPath) {
    const previewUrl = new URL('/api/og-preview', request.url);
    previewUrl.searchParams.set('path', pathname);
    return rewrite(previewUrl);
  }

  // Otherwise, continue as normal (Vite SPA handles the rest)
  return next();
}

// Optimization: Only run middleware on relevant paths
export const config = {
  matcher: [
    '/hackathons/:path*',
    '/events/:path*',
    '/event-groups/:path*',
    '/jobs/:path*',
    '/products/:path*',
    '/news/:path*',
    '/community/:path*',
    '/verify/:path*'
  ],
};
