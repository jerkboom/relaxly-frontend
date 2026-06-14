import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  FaGavel, 
  FaInfoCircle, 
  FaUserCheck, 
  FaUserPlus, 
  FaIdCard, 
  FaBuilding, 
  FaCalendarCheck, 
  FaBed, 
  FaCreditCard, 
  FaUndo, 
  FaBan, 
  FaCommentDots, 
  FaCopyright, 
  FaServer, 
  FaExclamationTriangle, 
  FaUserTimes, 
  FaShieldAlt, 
  FaEdit, 
  FaEnvelope,
  FaGlobe,
  FaHandshake
} from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Relaxly',
  description: 'Relaxly Terms and Conditions - The rules and guidelines for using our platform.',
};

export default function TermsPage() {
  const sections = [
    {
      id: 'agreement',
      title: '1. Agreement to Terms',
      icon: <FaHandshake className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Welcome to Relaxly.</p>
          <p>
            These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Relaxly platform, website, applications, and services.
          </p>
          <p>
            By creating an account, browsing listings, making bookings, or using any Relaxly service, you agree to be legally bound by these Terms.
          </p>
          <p className="font-bold text-slate-800">
            If you do not agree with these Terms, you must not use the platform.
          </p>
        </div>
      ),
    },
    {
      id: 'about',
      title: '2. About Relaxly',
      icon: <FaInfoCircle className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            Relaxly is an online accommodation marketplace that connects students and tenants with hostel owners, property managers, and accommodation providers.
          </p>
          <p>
            Relaxly facilitates bookings but does not own, manage, or operate the hostels listed on the platform unless explicitly stated.
          </p>
        </div>
      ),
    },
    {
      id: 'eligibility',
      title: '3. User Eligibility',
      icon: <FaUserCheck className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>To use Relaxly, you must:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Be at least 18 years old</li>
            <li>Provide accurate registration information</li>
            <li>Maintain the security of your account</li>
            <li>Use the platform lawfully</li>
          </ul>
          <p>Users are responsible for all activity conducted under their accounts.</p>
        </div>
      ),
    },
    {
      id: 'registration',
      title: '4. Account Registration',
      icon: <FaUserPlus className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>When creating an account, you agree to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide truthful information</li>
            <li>Keep your information updated</li>
            <li>Maintain confidentiality of your login credentials</li>
            <li>Notify Relaxly immediately of unauthorized account access</li>
          </ul>
          <p>Relaxly reserves the right to suspend or terminate accounts containing false information.</p>
        </div>
      ),
    },
    {
      id: 'verification',
      title: '5. Student Verification',
      icon: <FaIdCard className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Relaxly may request:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Student ID</li>
            <li>University information</li>
            <li>Enrollment verification documents</li>
          </ul>
          <p>Providing false verification information may result in:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account suspension</li>
            <li>Booking cancellation</li>
            <li>Permanent platform ban</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'owner-responsibilities',
      title: '6. Hostel Owner Responsibilities',
      icon: <FaBuilding className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Hostel owners must:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide accurate hostel information</li>
            <li>Maintain truthful room availability</li>
            <li>Accurately represent room conditions</li>
            <li>Honor confirmed bookings</li>
            <li>Comply with applicable laws and regulations</li>
          </ul>
          <p>Owners are solely responsible for their properties and services.</p>
        </div>
      ),
    },
    {
      id: 'booking-process',
      title: '7. Booking Process',
      icon: <FaCalendarCheck className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>A booking becomes confirmed only when:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>The student completes payment requirements.</li>
            <li>The hostel owner approves the booking.</li>
            <li>Relaxly records the reservation successfully.</li>
          </ol>
          <p>Relaxly reserves the right to cancel bookings affected by:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fraud</li>
            <li>Technical errors</li>
            <li>Duplicate reservations</li>
            <li>Policy violations</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'room-allocation',
      title: '8. Room Allocation and Check-In',
      icon: <FaBed className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Hostel owners may assign:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Room Numbers</li>
            <li>Bed Spaces</li>
            <li>Occupancy Positions</li>
          </ul>
          <p>Room assignments may be updated when necessary for operational reasons.</p>
          <p>Students must comply with hostel check-in procedures.</p>
        </div>
      ),
    },
    {
      id: 'payments',
      title: '9. Payments',
      icon: <FaCreditCard className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Users agree that:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>All payments are final unless covered by the Refund Policy.</li>
            <li>Relaxly may charge platform service fees.</li>
            <li>Payment processing is handled through approved payment providers.</li>
          </ul>
          <p>Failure to complete payment may result in booking cancellation.</p>
        </div>
      ),
    },
    {
      id: 'refund-policy',
      title: '10. Refund Policy',
      icon: <FaUndo className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Refund requests are governed by Relaxly&apos;s Refund Policy.</p>
          <p>Refund eligibility depends on:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Cancellation timing</li>
            <li>Hostel policies</li>
            <li>Payment verification status</li>
            <li>Booking circumstances</li>
          </ul>
          <p>Refund processing times may vary depending on payment providers.</p>
        </div>
      ),
    },
    {
      id: 'prohibited-activities',
      title: '11. Prohibited Activities',
      icon: <FaBan className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Users must not:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Submit false information</li>
            <li>Impersonate another person</li>
            <li>Attempt unauthorized access</li>
            <li>Circumvent platform security</li>
            <li>Use the platform for fraudulent activities</li>
            <li>Upload malicious software</li>
            <li>Harass or abuse other users</li>
            <li>Manipulate reviews or ratings</li>
          </ul>
          <p>Violations may result in immediate account suspension or termination.</p>
        </div>
      ),
    },
    {
      id: 'reviews',
      title: '12. Reviews and Feedback',
      icon: <FaCommentDots className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Users may submit reviews based on genuine experiences.</p>
          <p>Relaxly reserves the right to remove reviews that:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Are fraudulent</li>
            <li>Contain abusive language</li>
            <li>Include hate speech</li>
            <li>Violate applicable laws</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'intellectual-property',
      title: '13. Intellectual Property',
      icon: <FaCopyright className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>All platform content including:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Logos</li>
            <li>Branding</li>
            <li>Software</li>
            <li>Designs</li>
            <li>Graphics</li>
            <li>Text</li>
          </ul>
          <p>belongs to Relaxly or its licensors.</p>
          <p>Users may not copy, reproduce, or distribute platform content without written permission.</p>
        </div>
      ),
    },
    {
      id: 'availability',
      title: '14. Platform Availability',
      icon: <FaServer className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>While Relaxly strives for uninterrupted service, we do not guarantee:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Continuous availability</li>
            <li>Error-free operation</li>
            <li>Uninterrupted access</li>
          </ul>
          <p>Scheduled maintenance and unforeseen outages may occur.</p>
        </div>
      ),
    },
    {
      id: 'liability',
      title: '15. Limitation of Liability',
      icon: <FaExclamationTriangle className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Relaxly is not responsible for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Property conditions</li>
            <li>Room quality disputes</li>
            <li>Actions of hostel owners</li>
            <li>Actions of students</li>
            <li>Personal injury</li>
            <li>Theft or property loss</li>
            <li>Service interruptions beyond our control</li>
          </ul>
          <p>Our maximum liability shall not exceed the amount paid through the affected booking.</p>
        </div>
      ),
    },
    {
      id: 'termination',
      title: '16. Account Suspension and Termination',
      icon: <FaUserTimes className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Relaxly may suspend or terminate accounts for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fraudulent activity</li>
            <li>Policy violations</li>
            <li>False information</li>
            <li>Security threats</li>
            <li>Abuse of the platform</li>
          </ul>
          <p>Termination may occur without prior notice in severe cases.</p>
        </div>
      ),
    },
    {
      id: 'privacy-link',
      title: '17. Privacy',
      icon: <FaShieldAlt className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>
            Your use of Relaxly is also governed by our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
          </p>
          <p>
            By using the platform, you consent to the collection and use of information described therein.
          </p>
        </div>
      ),
    },
    {
      id: 'changes-to-terms',
      title: '18. Changes to These Terms',
      icon: <FaEdit className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Relaxly may update these Terms periodically.</p>
          <p>
            Continued use of the platform after changes become effective constitutes acceptance of the revised Terms.
          </p>
        </div>
      ),
    },
    {
      id: 'governing-law',
      title: '19. Governing Law',
      icon: <FaGavel className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>These Terms shall be governed by and interpreted in accordance with the laws of the Republic of Ghana.</p>
          <p>Any disputes arising from these Terms shall be subject to the jurisdiction of the courts of Ghana.</p>
        </div>
      ),
    },
    {
      id: 'contact',
      title: '20. Contact Information',
      icon: <FaEnvelope className="text-blue-600" />,
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>For questions regarding these Terms, contact:</p>
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
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-xl mb-6">
            <FaGavel className="text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Terms and Conditions
          </h1>
          <div className="flex items-center justify-center gap-3 text-slate-500 font-medium">
            <span>Last Updated: June 11, 2026</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 mb-8">
           <p className="text-lg text-slate-600 font-medium leading-relaxed italic">
             &quot;By creating an account, booking accommodation, listing a property, or otherwise using Relaxly, 
             you acknowledge that you have read, understood, and agreed to these Terms and Conditions.&quot;
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
            Have questions about our Terms and Conditions?
          </p>
          <Link 
            href="mailto:support@relaxlygh.com"
            className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white transition hover:scale-105 hover:bg-slate-800"
          >
            <FaEnvelope />
            Contact Legal Team
          </Link>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm font-bold text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <Link href="/privacy-policy" className="hover:text-blue-600 transition">Privacy Policy</Link>
            <Link href="/hostels" className="hover:text-blue-600 transition">Hostels</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
