import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// The landing and auth pages are public; everything vault-related requires an
// account. API routes return their own 401 JSON, so they are not redirected.
const isProtectedPage = createRouteMatcher([
  '/create-vault(.*)',
  '/dashboard(.*)',
  '/vaults(.*)',
  '/rewards(.*)',
  '/account(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedPage(req)) {
    await auth.protect();
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
