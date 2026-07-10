import { clerkMiddleware } from '@clerk/nextjs/server';

// Betless is guest-first: pages stay publicly reachable, but clerkMiddleware
// wires Clerk's server-side session context (recommended for Clerk v6+/Next 16)
// so authenticated sessions are detected consistently across routes.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf|eot|map)).*)',
    // Always run for API routes.
    '/(api|trpc)(.*)',
  ],
};
