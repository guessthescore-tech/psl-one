'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRootPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/dashboard'); }, [router]);
  return <div className="p-6 text-gray-500 text-sm">Redirecting to Admin Dashboard...</div>;
}
