'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';

import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaArrowRight,
  FaUniversity,
  FaIdCard,
  FaKey,
  FaVenusMars,
  FaLink,
  FaPhone,
} from 'react-icons/fa';

import { registerUser, RegisterData } from '../../src/services/authService';
import { getUniversities } from '../../src/services/universityService';
import { useAuthStore } from '../../src/store/authStore';
import { getErrorMessage } from '../../src/utils/errorUtils';

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [universities, setUniversities] = useState<any[]>([]);
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const [uniSearch, setUniSearch] = useState('');

  useEffect(() => {
    getUniversities().then((res) => {
      const sorted = (res.data || res).sort((a: any, b: any) => a.name.localeCompare(b.name));
      setUniversities(sorted);
    }).catch(console.error);
  }, []);

  const [formData, setFormData] =
    useState({

      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: 'Male' as 'Male' | 'Female',
      phone: '',
      role: 'student' as 'student' | 'owner',
      ownerAccessCode: '',
      governmentIdUrl: '',
      university: '',
      customUniversity: '',
      studentId: '',
      agreeToPolicies: false,
    });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData({
      ...formData,
      [name]: val,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (loading) return;

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      toast.error(
        'Passwords do not match'
      );

      return;
    }

    if (!/^(?:\+233|0)[2-5]\d{8}$/.test(formData.phone)) {
      toast.error('Please enter a valid Ghana phone number (e.g. 0241234567).');
      return;
    }

    if (formData.role === 'student' && formData.university === 'other' && !formData.customUniversity.trim()) {
      toast.error('Please enter your university name.');
      return;
    }

    try {
    setLoading(true);

    const payload: RegisterData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      phone: formData.phone,
      role: formData.role as "student" | "owner",        // @ts-ignore
      accessCode: formData.ownerAccessCode,
      university: formData.role === 'student' ? formData.university : undefined,
      customUniversity: formData.role === 'student' && formData.university === 'other' ? formData.customUniversity : undefined,
      studentId: formData.role === 'student' ? formData.studentId : undefined,
      agreeToPolicies: formData.agreeToPolicies,
    };

    if (formData.role === 'owner') {
      payload.governmentIdUrl = formData.governmentIdUrl;
    }

      const response =
        await registerUser(payload);

      // UNIFIED SUCCESS BLOCK: Redirect all roles to verification pending
      const userData = response.user || response.data?.user;
      const userEmail = userData?.email || formData.email;

      localStorage.setItem('pendingVerificationEmail', userEmail);
      
      toast.success(
        response.message || 
        'Account created! Please check your email to verify your account.'
      );

      router.push('/verify-email-pending');
      return;
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          'Registration failed'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-[700px] rounded-[1.5rem] sm:rounded-[2rem] bg-white p-6 sm:p-10 shadow-2xl">
        {/* HEADER */}
        <div className="mb-8 sm:mb-10 text-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-black text-blue-600"
          >
            <img src="/logo.svg" alt="Relaxly Logo" className="h-8 w-8" />
            <span>Relaxly</span>
          </Link>

          <h1 className="mt-4 sm:mt-6 mb-2 sm:mb-3 text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            Create Account
          </h1>

          <p className="text-base sm:text-lg text-gray-500">
            Start your hostel journey today
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6"
        >
          {/* NAME & EMAIL */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                Full Name
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                <FaUser className="text-gray-400 shrink-0" />

                <input
                  type="text"
                  name="name"
                  placeholder="Richard Ofori"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                Email Address
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                <FaEnvelope className="text-gray-400 shrink-0" />

                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* ROLE & GENDER */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                Account Type
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                <FaUser className="text-gray-400 shrink-0" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 outline-none"
                >
                  <option value="student">
                    Student
                  </option>

                  <option value="owner">
                    Hostel Owner
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                Gender
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                <FaVenusMars className="text-gray-400 shrink-0" />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* DYNAMIC FIELDS: STUDENT */}
          {formData.role === 'student' && (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div className="relative">
                <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                  University / Institution
                </label>

                <div className="flex flex-col relative rounded-2xl border border-gray-200 bg-gray-50 transition focus-within:border-blue-500 focus-within:bg-white">
                  <div className="flex items-center px-4 sm:px-5">
                    <FaUniversity className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search your university..."
                      value={showUniDropdown ? uniSearch : (formData.university === 'other' ? 'Other (My University Is Not Listed)' : universities.find(u => u._id === formData.university)?.name || '')}
                      onChange={(e) => {
                        setUniSearch(e.target.value);
                        setShowUniDropdown(true);
                      }}
                      onFocus={() => {
                        setUniSearch('');
                        setShowUniDropdown(true);
                      }}
                      onBlur={() => setTimeout(() => setShowUniDropdown(false), 200)}
                      required={!formData.university}
                      className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none cursor-pointer"
                    />
                  </div>

                  {showUniDropdown && (
                    <div className="absolute top-full left-0 z-50 w-full mt-2 max-h-60 overflow-y-auto rounded-2xl bg-white shadow-xl border border-gray-100 py-2">
                      {universities
                        .filter(uni => uni.name.toLowerCase().includes(uniSearch.toLowerCase()))
                        .map(uni => (
                          <div
                            key={uni._id}
                            className="px-5 py-3 hover:bg-blue-50 cursor-pointer text-sm font-medium text-slate-700 transition-colors"
                            onClick={() => {
                              setFormData({ ...formData, university: uni._id });
                              setShowUniDropdown(false);
                            }}
                          >
                            {uni.name}
                          </div>
                      ))}
                      {(!uniSearch || 'other (my university is not listed)'.includes(uniSearch.toLowerCase())) && (
                        <div
                          className="px-5 py-3 hover:bg-blue-50 cursor-pointer text-sm font-bold text-blue-600 transition-colors border-t border-slate-50"
                          onClick={() => {
                            setFormData({ ...formData, university: 'other' });
                            setShowUniDropdown(false);
                          }}
                        >
                          Other (My University Is Not Listed)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {formData.university === 'other' && (
                <div className="md:col-span-2">
                  <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                    Enter University Name
                  </label>
                  <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                    <FaUniversity className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      name="customUniversity"
                      placeholder="Full Name of University"
                      value={formData.customUniversity}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className={formData.university === 'other' ? "md:col-span-2" : ""}>
                <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                  Student ID Number
                </label>

                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                  <FaIdCard className="text-gray-400 shrink-0" />

                  <input
                    type="text"
                    name="studentId"
                    placeholder="Student ID"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC FIELDS: OWNER */}
          {formData.role === 'owner' && (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                  Owner Access Code
                </label>

                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                  <FaKey className="text-gray-400 shrink-0" />

                  <input
                    type="text"
                    name="ownerAccessCode"
                    placeholder="Access Code"
                    value={formData.ownerAccessCode}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                  Gov ID Image URL
                </label>

                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                  <FaLink className="text-gray-400 shrink-0" />

                  <input
                    type="text"
                    name="governmentIdUrl"
                    placeholder="https://..."
                    value={formData.governmentIdUrl}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PHONE NUMBER (ALL ROLES) */}
          <div className="grid gap-4 sm:gap-6">
            <div>
              <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                <FaPhone className="text-gray-400 shrink-0" />

                <input
                  type="tel"
                  name="phone"
                  placeholder="0241234567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* PASSWORDS */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                Password
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                <FaLock className="text-gray-400 shrink-0" />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                Confirm Password
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                <FaLock className="text-gray-400 shrink-0" />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* LEGAL CONSENT */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="agreeToPolicies"
                checked={formData.agreeToPolicies}
                onChange={handleChange}
                required
                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                I have read and agree to the 
                <Link href="/terms-and-conditions" target="_blank" className="mx-1 font-bold text-blue-600 hover:underline">Terms & Conditions</Link>, 
                <Link href="/privacy-policy" target="_blank" className="mx-1 font-bold text-blue-600 hover:underline">Privacy Policy</Link>, 
                and 
                <Link href="/refund-policy" target="_blank" className="mx-1 font-bold text-blue-600 hover:underline">Refund Policy</Link> 
                of Relaxly.
              </span>
            </label>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading || !formData.agreeToPolicies}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 sm:py-5 text-base sm:text-lg font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? 'Creating Account...'
              : 'Create Account'}

            {!loading && <FaArrowRight />}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 sm:mt-8 text-center text-sm sm:text-base text-gray-500">
          Already have an account?

          <Link
            href="/login"
            className="ml-2 font-bold text-blue-600"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
