import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ONLY redirect the absolute root (localhost:3000/) to login
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/ru/login`, request.url));
  }

  // Allow /en, /ru, /en/doctor, etc., to pass through normally
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};