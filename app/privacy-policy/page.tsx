import type { Metadata } from 'next';
import Link from 'next/link';
import { FaShieldAlt, FaLock, FaUserShield, FaInfoCircle, FaEnvelope, FaGlobe } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Privacy Policy | Relaxly',
  description: 'Relaxly Privacy Policy - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      icon: <FaInfoCircle className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Welcome to Relaxly (&quot;Relaxly&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;).</p>
          <p>
            Relaxly is a student accommodation marketplace that connects students with verified hostel and property owners across Ghana. 
            This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website, 
            mobile applications, and services.
          </p>
          <p>
            By accessing or using Relaxly, you agree to the collection and use of information in accordance with this Privacy Policy.
          </p>
        </div>
      ),
    },
    {
      id: 'information-we-collect',
      title: '2. Information We Collect',
      icon: <FaUserShield className="text-blue-600" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Personal Information</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Full Name</li>
              <li>Email Address</li>
              <li>Phone Number</li>
              <li>Student ID Number</li>
              <li>University Information</li>
              <li>Gender</li>
              <li>Profile Picture (optional)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Booking Information</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Booking Details</li>
              <li>Check-in Information</li>
              <li>Room Assignment Information</li>
              <li>Payment Records</li>
              <li>Booking History</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Owner Information</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Business Name</li>
              <li>Hostel Information</li>
              <li>Payment Details</li>
              <li>Identification Documents</li>
              <li>Payout Information</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'payment-information',
      title: '3. Payment Information',
      icon: <FaLock className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Relaxly does not store full debit card, credit card, or mobile money credentials.</p>
          <p>Payments are securely processed through trusted third-party payment providers.</p>
          <p>We may store:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Transaction IDs</li>
            <li>Payment Status</li>
            <li>Amount Paid</li>
            <li>Payment Dates</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'how-we-use-information',
      title: '4. How We Use Your Information',
      icon: <FaShieldAlt className="text-blue-600" />,
      content: (
        <div className="space-y-2 text-slate-600 leading-relaxed">
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Create and manage accounts</li>
            <li>Verify student identities</li>
            <li>Process bookings</li>
            <li>Assign rooms</li>
            <li>Facilitate check-ins</li>
            <li>Process refunds</li>
            <li>Send notifications</li>
            <li>Improve platform security</li>
            <li>Prevent fraud and abuse</li>
            <li>Provide customer support</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'university-verification',
      title: '5. University Verification',
      icon: <FaShieldAlt className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>To maintain a trusted student community, Relaxly may verify:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Student ID numbers</li>
            <li>University affiliations</li>
            <li>Enrollment information</li>
          </ul>
          <p>Verification information is used solely for account authentication and fraud prevention.</p>
        </div>
      ),
    },
    {
      id: 'room-assignment',
      title: '6. Room Assignment & Hostel Management',
      icon: <FaShieldAlt className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>When a booking is approved and checked in, Relaxly may store:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Assigned Room Number</li>
            <li>Hostel Information</li>
            <li>Occupancy Records</li>
            <li>Check-in History</li>
            <li>Check-out History</li>
          </ul>
          <p>This information is visible only to authorized hostel managers and administrators.</p>
        </div>
      ),
    },
    {
      id: 'communications',
      title: '7. Communications',
      icon: <FaEnvelope className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>We may send:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Booking confirmations</li>
            <li>Payment confirmations</li>
            <li>Refund updates</li>
            <li>Account notifications</li>
            <li>Security alerts</li>
            <li>Customer support responses</li>
          </ul>
          <p>Users may opt out of promotional communications.</p>
        </div>
      ),
    },
    {
      id: 'information-sharing',
      title: '8. Information Sharing',
      icon: <FaShieldAlt className="text-blue-600" />,
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">Relaxly does not sell personal information. We may share information with:</p>
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Hostel Owners</h4>
            <p className="text-slate-600 mb-2">To facilitate bookings, hostel owners may receive:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Student Name</li>
              <li>Contact Information</li>
              <li>Booking Information</li>
              <li>Room Assignment Information</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Payment Providers</h4>
            <p className="text-slate-600">For payment processing and refunds.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Legal Authorities</h4>
            <p className="text-slate-600">When required by law or to protect users and platform security.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'data-security',
      title: '9. Data Security',
      icon: <FaLock className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>We implement appropriate technical and organizational safeguards to protect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>User Accounts</li>
            <li>Passwords</li>
            <li>Booking Records</li>
            <li>Payment Information</li>
            <li>Personal Information</li>
          </ul>
          <p>Passwords are encrypted and never stored in plain text.</p>
        </div>
      ),
    },
    {
      id: 'data-retention',
      title: '10. Data Retention',
      icon: <FaShieldAlt className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>We retain information only for as long as necessary to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide services</li>
            <li>Meet legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce agreements</li>
          </ul>
          <p>Inactive accounts may be archived or deleted according to our retention policies.</p>
        </div>
      ),
    },
    {
      id: 'your-rights',
      title: '11. Your Rights',
      icon: <FaUserShield className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>You may:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access your information</li>
            <li>Correct inaccurate information</li>
            <li>Request account deletion</li>
            <li>Request data updates</li>
            <li>Contact us regarding privacy concerns</li>
          </ul>
          <p>Some information may be retained where legally required.</p>
        </div>
      ),
    },
    {
      id: 'cookies-analytics',
      title: '12. Cookies & Analytics',
      icon: <FaGlobe className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Relaxly may use cookies and analytics technologies to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Maintain login sessions</li>
            <li>Improve user experience</li>
            <li>Analyze platform usage</li>
            <li>Detect security threats</li>
          </ul>
          <p>Users can manage cookie settings through their browser.</p>
        </div>
      ),
    },
    {
      id: 'childrens-privacy',
      title: '13. Children\'s Privacy',
      icon: <FaShieldAlt className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Relaxly is intended for university students and adults.</p>
          <p>We do not knowingly collect personal information from children under 18 without appropriate authorization.</p>
        </div>
      ),
    },
    {
      id: 'changes',
      title: '14. Changes to This Policy',
      icon: <FaShieldAlt className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>We may update this Privacy Policy periodically.</p>
          <p>Material changes will be posted on this page with an updated revision date.</p>
        </div>
      ),
    },
    {
      id: 'contact',
      title: '15. Contact Us',
      icon: <FaEnvelope className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>For privacy-related questions, contact:</p>
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
            <FaShieldAlt className="text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <div className="flex items-center justify-center gap-3 text-slate-500 font-medium">
            <span>Last Updated: June 11, 2026</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Effective Date: June 11, 2026</span>
          </div>
        </div>

        {/* Content */}
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
            Have questions about our privacy practices?
          </p>
          <Link 
            href="mailto:support@relaxlygh.com"
            className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white transition hover:scale-105 hover:bg-slate-800"
          >
            <FaEnvelope />
            Contact Privacy Team
          </Link>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm font-bold text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <Link href="/hostels" className="hover:text-blue-600 transition">Hostels</Link>
            <Link href="/register" className="hover:text-blue-600 transition">Register</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
