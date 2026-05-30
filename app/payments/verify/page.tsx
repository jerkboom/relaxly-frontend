import {
  Suspense,
} from 'react';

import VerifyPaymentClient from './VerifyPaymentClient';

function VerifyPaymentFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <h1 className="text-3xl font-black text-slate-900">
          Preparing Verification
        </h1>
      </section>
    </main>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <VerifyPaymentFallback />
      }
    >
      <VerifyPaymentClient />
    </Suspense>
  );
}
