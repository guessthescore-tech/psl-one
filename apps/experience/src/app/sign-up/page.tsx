import Link from 'next/link';
import { AuthLayout } from '@/components/account/AuthLayout';
import { SignUpForm } from './SignUpForm';

export const metadata = {
  title: 'Create your PSL One account',
};

export default function SignUpPage() {
  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <h1 className="text-display-sm text-white mb-1">Create your account</h1>
        <p className="text-body-sm text-white/50">
          {'Already have an account? '}
          <Link
            href="/sign-in"
            className="text-exp-gold hover:text-exp-gold-2 transition-colors font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-sm"
          >
            Sign in
          </Link>
        </p>
      </div>

      <SignUpForm />
    </AuthLayout>
  );
}
