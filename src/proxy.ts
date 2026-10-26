import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If user goes to localhost:3000 (the absolute root), send them to login.
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/ru/login`, request.url));
  }

  // For /ru, /ru/doctor, /en, etc., just let the standard app router handle it.
  // No redirects here.
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};