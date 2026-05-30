'use client';

import React from 'react';
import { 
  FaEnvelope, 
  FaPhoneAlt, 
  FaWhatsapp, 
  FaQuestionCircle, 
  FaChevronDown 
} from 'react-icons/fa';

import { useSettingsStore } from '../../../src/store/settingsStore';

export default function HelpPage() {
  const { supportSettings } = useSettingsStore();

  const faqs = [
    {
      question: "How do I approve bookings?",
      answer: "Navigate to the 'Bookings' section from the sidebar. You'll see all pending requests. Click on a booking to view details and select 'Approve' or 'Decline'."
    },
    {
      question: "How do payments work?",
      answer: "Students pay directly through the platform. Once a booking is confirmed and the student checks in, the funds are processed and reflected in your 'Estimated Earnings'. Payouts are made according to your settled schedule."
    },
    {
      question: "How do I add hostel rooms?",
      answer: "Go to 'My Hostels', select the specific hostel, and click on 'Manage Rooms'. From there, you can add new room types, set prices, and update availability."
    },
    {
      question: "Why is my hostel not visible?",
      answer: "Your hostel might be under review or missing required information (like images or room details). Ensure all fields are completed and your status is set to 'Active'."
    }
  ];

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Help & Support</h1>
        <p className="mt-2 text-slate-500 font-medium">Need assistance? Reach out to the Relaxly support team.</p>
      </div>

      {/* SUPPORT CARDS */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="group rounded-[2.5rem] bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 border border-slate-50">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-200">
            <FaEnvelope />
          </div>
          <h3 className="text-xl font-black text-slate-900">Email Support</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">Expect a response within 24 hours.</p>
          <a href={`mailto:${supportSettings.email}`} className="mt-6 inline-block font-black text-blue-600 hover:underline">
            {supportSettings.email}
          </a>
        </div>

        <div className="group rounded-[2.5rem] bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 border border-slate-50">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl text-white shadow-lg shadow-emerald-200">
            <FaWhatsapp />
          </div>
          <h3 className="text-xl font-black text-slate-900">WhatsApp</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">Quick chat with our support agents.</p>
          <a href={`https://wa.me/${supportSettings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block font-black text-emerald-600 hover:underline">
            Chat on WhatsApp
          </a>
        </div>

        <div className="group rounded-[2.5rem] bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 border border-slate-50">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white shadow-lg shadow-indigo-200">
            <FaPhoneAlt />
          </div>
          <h3 className="text-xl font-black text-slate-900">Phone Support</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">Available Mon-Fri, 8am - 6pm.</p>
          <a href={`tel:${supportSettings.phone}`} className="mt-6 inline-block font-black text-indigo-600 hover:underline">
            {supportSettings.phone}
          </a>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-50">
        <div className="mb-10">
          <h3 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h3>
          <p className="text-sm font-medium text-slate-400 mt-1">Quick answers to common questions</p>
        </div>

        <div className="grid gap-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group rounded-3xl border border-slate-50 bg-slate-50/50 p-6 transition-all hover:bg-slate-50">
              <summary className="flex cursor-pointer items-center justify-between list-none">
                <span className="text-lg font-black text-slate-900">{faq.question}</span>
                <FaChevronDown className="text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 text-slate-600 font-medium leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* CONTACT INFO FOOTER */}
      <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white text-center">
        <h4 className="text-2xl font-black mb-4">Still have questions?</h4>
        <p className="text-slate-400 font-medium max-w-2xl mx-auto">
          Our dedicated team is here to help you maximize your hostel's potential on Relaxly. 
          Don't hesitate to reach out for personalized assistance.
        </p>
      </div>
    </div>
  );
}
