import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  FaUndo, 
  FaInfoCircle, 
  FaUserCheck, 
  FaListOl, 
  FaUserShield, 
  FaPercent, 
  FaBan, 
  FaClock, 
  FaCreditCard, 
  FaGavel, 
  FaExclamationTriangle, 
  FaEnvelope,
  FaGlobe
} from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Refund Policy | Relaxly',
  description: 'Relaxly Refund Policy - Understand how refunds are handled between students and hostel owners.',
};

export default function RefundPolicyPage() {
  const sections = [
    {
      id: 'overview',
      title: '1. Overview',
      icon: <FaInfoCircle className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            Relaxly serves as a marketplace connecting students and tenants with hostel owners and accommodation providers. 
            While Relaxly facilitates bookings and payment processing, each hostel owner retains the right to establish 
            and enforce their own refund policies.
          </p>
          <p className="font-bold text-slate-800">
            By making a booking through Relaxly, you acknowledge and agree that refund decisions are primarily determined 
            by the hostel owner or accommodation provider.
          </p>
        </div>
      ),
    },
    {
      id: 'eligibility',
      title: '2. Refund Eligibility',
      icon: <FaUserCheck className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Refund eligibility depends on the specific refund policy of the hostel where the booking was made.</p>
          <p>Factors that may affect refund approval include:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Time remaining before check-in</li>
            <li>Reason for cancellation</li>
            <li>Payment status</li>
            <li>Room allocation status</li>
            <li>Hostel-specific policies</li>
            <li>Special promotions or discounted bookings</li>
          </ul>
          <p className="italic">Submitting a refund request does not guarantee approval.</p>
        </div>
      ),
    },
    {
      id: 'process',
      title: '3. Refund Request Process',
      icon: <FaListOl className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Students may submit refund requests through Relaxly.</p>
          <p>Once submitted:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>The request is forwarded to the hostel owner.</li>
            <li>The hostel owner reviews the request.</li>
            <li>The hostel owner approves, partially approves, or rejects the request.</li>
            <li>Relaxly processes any approved refund according to the owner&apos;s decision.</li>
          </ol>
          <p>Refund requests may require supporting documentation depending on the circumstances.</p>
        </div>
      ),
    },
    {
      id: 'authority',
      title: '4. Owner Refund Authority',
      icon: <FaUserShield className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Hostel owners have the authority to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Approve a full refund</li>
            <li>Approve a partial refund</li>
            <li>Reject a refund request</li>
          </ul>
          <p>
            Relaxly does not override owner refund decisions except where required by law or in cases involving fraud, 
            duplicate payments, or system errors.
          </p>
        </div>
      ),
    },
    {
      id: 'partial',
      title: '5. Partial Refunds',
      icon: <FaPercent className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Approved refunds may not equal the original booking amount.</p>
          <p>A hostel owner may deduct amounts for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Administrative charges</li>
            <li>Reservation fees</li>
            <li>Processing fees</li>
            <li>Occupied room periods</li>
            <li>Damages or violations</li>
            <li>Non-refundable booking fees</li>
          </ul>
          <p>As a result, the refunded amount may be lower than the amount originally paid.</p>
        </div>
      ),
    },
    {
      id: 'non-refundable',
      title: '6. Non-Refundable Situations',
      icon: <FaBan className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>A refund may be denied in situations including but not limited to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Failure to check in without prior notice</li>
            <li>Violation of hostel rules</li>
            <li>Late cancellation according to hostel policy</li>
            <li>Fraudulent bookings</li>
            <li>False information provided during booking</li>
            <li>Non-refundable promotional reservations</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'processing-time',
      title: '7. Processing Time',
      icon: <FaClock className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Once a refund is approved:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Relaxly will initiate the refund process.</li>
            <li>Processing times depend on the payment provider.</li>
            <li>Mobile Money, bank transfers, and card refunds may require different processing periods.</li>
          </ul>
          <p>Estimated processing times may range from 3 to 30 business days.</p>
        </div>
      ),
    },
    {
      id: 'fees',
      title: '8. Platform Fees',
      icon: <FaCreditCard className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            Certain Relaxly service fees, transaction fees, or payment processing fees may be non-refundable where 
            permitted by applicable law.
          </p>
          <p>Any applicable deductions will be communicated during refund processing.</p>
        </div>
      ),
    },
    {
      id: 'disputes',
      title: '9. Disputes',
      icon: <FaGavel className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>If a student disagrees with a refund decision, they may submit a dispute through Relaxly Support.</p>
          <p>
            Relaxly may review the matter and facilitate communication between the student and hostel owner 
            but does not guarantee reversal of an owner&apos;s decision.
          </p>
        </div>
      ),
    },
    {
      id: 'system-errors',
      title: '10. System Errors and Duplicate Payments',
      icon: <FaExclamationTriangle className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>In cases involving:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Duplicate charges</li>
            <li>Technical payment failures</li>
            <li>Incorrect billing</li>
            <li>Platform processing errors</li>
          </ul>
          <p>Relaxly reserves the right to issue refunds independently of the hostel owner&apos;s refund policy.</p>
        </div>
      ),
    },
    {
      id: 'contact',
      title: '11. Contact Us',
      icon: <FaEnvelope className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>For refund-related questions, contact:</p>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="font-bold text-slate-900 mb-1">Relaxly Support</p>
            <p className="flex items-center gap-2 mb-2">
              <FaEnvelope className="text-blue-600 h-3 w-3" />
              <a href="mailto:support@relaxlygh.com" className="text-blue-600 hover:underline">support@relaxlygh.com</a>
            </p>
            <p className="flex items-center gap-2">
              <FaGlobe className="text-blue-600 h-3 w-3" />
              <a href="https://relaxlygh.com" className="text-blue-600 hover:underline">https://relaxlygh.com</a>
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200 mb-6">
            <FaUndo className="text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Refund Policy
          </h1>
          <div className="flex items-center justify-center gap-3 text-slate-500 font-medium">
            <span>Last Updated: June 11, 2026</span>
          </div>
        </div>

        {/* Acknowledgement */}
        <div className="bg-blue-50 rounded-[2.5rem] p-8 md:p-12 border border-blue-100 mb-8">
           <p className="text-lg text-blue-900 font-medium leading-relaxed italic">
             &quot;By making a booking through Relaxly, you acknowledge that refund approval is subject 
             to the hostel owner&apos;s policies and that approved refunds may be partial and less than the 
             amount originally paid.&quot;
           </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <section 
              key={section.id} 
              id={section.id}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 transition hover:shadow-md"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {section.title}
                </h2>
              </div>
              {section.content}
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-8 font-medium">
            Need help with a refund request?
          </p>
          <Link 
            href="mailto:support@relaxlygh.com"
            className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white transition hover:scale-105 hover:bg-slate-800"
          >
            <FaEnvelope />
            Contact Support Team
          </Link>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm font-bold text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <Link href="/privacy-policy" className="hover:text-blue-600 transition">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-blue-600 transition">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
