import type { Metadata } from 'next';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const metadata: Metadata = {
  title: 'Privacy Policy | Relaxly',
  description: 'Relaxly Privacy Policy',
};

export default async function PrivacyPolicyPage() {
  const privacyPolicyHTML = await readFile(
    join(process.cwd(), 'privacy-policy-termly.html'),
    'utf8',
  );

  return (
    <main className="min-h-screen bg-blue-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1200px] rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
        <div
          className="privacy-policy-content overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: privacyPolicyHTML }}
        />
      </section>
    </main>
  );
}
