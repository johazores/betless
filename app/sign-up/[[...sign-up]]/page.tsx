import { SignUp } from '@clerk/nextjs';
import { AuthPageShell } from '@/components/layout/auth-page-shell';

const highlights: Array<[string, string]> = [
  ['Takes under a minute', 'Create your account, open your first vault, and start earning points after your first full month.'],
  ['Your money comes back', '100% of your deposit is returned at maturity — and the lock is verifiable on the Stellar network.'],
  ['Real-world rewards', 'Points are worth ₱1 each and redeemable for groceries, travel, gadgets, and more.'],
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
