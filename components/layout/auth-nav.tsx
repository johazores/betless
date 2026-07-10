'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

export function AuthNav() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="h-10 w-28 rounded-full bg-slate-100" aria-label="Loading account navigation" />;
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <SignInButton mode="modal">
          <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
            Log in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800">
            Sign up
          </button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/dashboard" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
        Dashboard
      </Link>
      <UserButton />
    </div>
  );
}
