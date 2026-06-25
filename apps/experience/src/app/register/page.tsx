import { redirect } from 'next/navigation';

// /register → /sign-up (canonical sign-up page with all required fields)
export default function RegisterPage() {
  redirect('/sign-up');
}
