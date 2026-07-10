'use client';

import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';

export function BetlessClerkProvider({ children }: { children: ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
