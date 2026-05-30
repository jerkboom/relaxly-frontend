'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function StudentBookingRedirectPage() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    if (params.roomId) {
      router.replace(`/booking/${params.roomId}`);
    } else {
      router.replace('/hostels');
    }
  }, [params.roomId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-slate-500 font-bold">
          Redirecting to secure checkout...
        </p>
      </div>
    </div>
  );
}
