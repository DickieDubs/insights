
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login/admin');
  }, [router]);

  return (
    <LoadingSpinner fullScreen={true} message="Redirecting..." />
  );
}
