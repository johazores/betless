import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { AuthPageShell } from '@/components/layout/auth-page-shell';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Get started',
  description: 'Create your Betless account, lock a deposit, earn monthly points, and redeem real-world rewards.',
  path: '/sign-up',
});

const highlights: Array<[string, string]> = [
  ['Takes under a minute', 'Create your account, open your first vault, and start earning points after your first full month.'],
  ['Your money comes back', '100% of your deposit is returned at maturity — and the lock is verifiable on the Stellar network.'],
  ['Real-world rewards', 'Points are worth ₱1 each and redeemable for groceries, travel, gadgets, and more.'],
  ['Invited by a friend?', 'Sign up through their invite link and you both earn ₱100 in points automatically.'],
];

export default function SignUpPage() {
  return (
    <AuthPageShell
      badge="Get started"
      title="Start saving with commitment."
      subtitle="Sign up, lock a deposit, and earn monthly points you can actually spend."
      highlights={highlights}
    >
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
    </AuthPageShell>
  );
}
