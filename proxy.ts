import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const REFRESH_COOKIE = 'betless_admin_refresh';

// Admin panel uses separate JWT auth (not Clerk).
const isAdminPage = createRouteMatcher(['/admin(.*)']);
const isAdminLoginPage = createRouteMatcher(['/admin/login']);

// The landing and auth pages are public; everything vault-related requires an
// account. API routes return their own 401 JSON, so they are not redirected.
const isProtectedPage = createRouteMatcher([
  '/create-vault(.*)',
  '/dashboard(.*)',
  '/vaults(.*)',
  '/rewards(.*)',
  '/account(.*)',
  '/notifications(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminPage(req)) {
    const hasRefresh = req.cookies.has(REFRESH_COOKIE);

    if (isAdminLoginPage(req)) {
      if (hasRefresh) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return;
    }

    if (!hasRefresh) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    return;
  }

  if (isProtectedPage(req)) {
    // Always send signed-out visitors to our own /sign-in page (never the
    // Clerk-hosted accounts.dev one), and bring them back where they were going.
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname + req.nextUrl.search);
    await auth.protect({ unauthenticatedUrl: signInUrl.toString() });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf|eot|map)).*)',
    // Always run for API routes.
    '/(api|trpc)(.*)',
  ],
};
