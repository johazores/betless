import { SignIn } from '@clerk/nextjs';
import { PublicLayout } from '@/components/layout/public-layout';

export default function SignInPage() {
  return (
    <PublicLayout>
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl justify-center">
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
        </div>
      </section>
    </PublicLayout>
  );
}
