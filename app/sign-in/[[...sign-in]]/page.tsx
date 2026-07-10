import { SignIn } from '@clerk/nextjs';
import { AuthPageShell } from '@/components/layout/auth-page-shell';

const highlights: Array<[string, string]> = [
  ['Your savings, waiting', 'Pick up right where you left off — vaults, points, and rewards are tied to your account.'],
  ['Independently verifiable', 'Every vault lock is recorded on the Stellar network, so your deposit is never just our word.'],
];

export default function SignInPage() {
  return (
    <AuthPageShell
      badge="Welcome back"
      title="Sign in to your savings."
      subtitle="Check your locked balance, watch points accrue, and redeem rewards."
      highlights={highlights}
    >
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
    </AuthPageShell>
  );
}
