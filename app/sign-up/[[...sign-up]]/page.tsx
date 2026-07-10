import { SignUp } from '@clerk/nextjs';
import { PublicLayout } from '@/components/layout/public-layout';

export default function SignUpPage() {
  return (
    <PublicLayout>
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl justify-center">
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
        </div>
      </section>
    </PublicLayout>
  );
}
