'use client';

import { useState, useEffect, Suspense, useRef } from 'react';

import Link from 'next/link';

import { useRouter, useSearchParams } from 'next/navigation';

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
  FaSpinner,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaUsers
} from 'react-icons/fa';

import { registerUser, RegisterData, uploadPublicFile, trackReferralClick } from '../../src/services/authService';
import { getUniversities } from '../../src/services/universityService';
import { useAuthStore } from '../../src/store/authStore';
import { getErrorMessage } from '../../src/utils/errorUtils';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const refCode = searchParams.get('ref') || searchParams.get('referral');
  const refSource = searchParams.get('source') || 'link';
  const refCampaignId = searchParams.get('campaignId') || searchParams.get('campaign') || undefined;
  const refAssetId = searchParams.get('assetId') || searchParams.get('asset') || undefined;
  const hasTrackedStart = useRef(false);

  const [loading, setLoading] =
    useState(false);

  const [idUploading, setIdUploading] = useState(false);
  const [idFileName, setIdFileName] = useState('');

  const [universities, setUniversities] = useState<any[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('images', file);

    try {
      setIdUploading(true);
      const res = await uploadPublicFile(formData);
      const url = res.images?.[0];
      if (url) {
        setFormData(prev => ({ ...prev, governmentIdUrl: url }));
        setIdFileName(file.name);
        toast.success('Government ID uploaded successfully!');
      } else {
        toast.error('Failed to retrieve upload URL');
      }
    } catch (error: any) {
      console.error('File upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload Government ID');
    } finally {
      setIdUploading(false);
    }
  };
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const [uniSearch, setUniSearch] = useState('');

  useEffect(() => {
    getUniversities().then((res) => {
      const sorted = (res.data || res).sort((a: any, b: any) => a.name.localeCompare(b.name));
      setUniversities(sorted);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (refCode) {
      trackReferralClick(refCode, refSource, 'click', refCampaignId, refAssetId).catch((err) => {
        console.error('Failed to track referral click:', err);
      });
    }
  }, [refCode, refSource, refCampaignId, refAssetId]);

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
      referralCode: refCode || '',
    });

  const [applyAsAmbassador, setApplyAsAmbassador] = useState(false);
  const [ambassadorFields, setAmbassadorFields] = useState({
    faculty: '',
    level: '100',
    hallHostel: '',
    whatsapp: '',
    instagram: '',
    tiktok: '',
    groupsCount: 0,
    reach: 0,
    experience: '',
    reason: '',
    studentIdUrl: '',
    profilePicUrl: '',
    agreed: false
  });

  const [ambassadorIdUploading, setAmbassadorIdUploading] = useState(false);
  const [ambassadorIdFileName, setAmbassadorIdFileName] = useState('');
  const [ambassadorPicUploading, setAmbassadorPicUploading] = useState(false);
  const [ambassadorPicFileName, setAmbassadorPicFileName] = useState('');

  const handleAmbassadorFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'studentIdUrl' | 'profilePicUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('images', file);

    try {
      if (field === 'studentIdUrl') {
        setAmbassadorIdUploading(true);
      } else {
        setAmbassadorPicUploading(true);
      }
      
      const res = await uploadPublicFile(uploadData);
      const url = res.images?.[0];
      if (url) {
        setAmbassadorFields(prev => ({ ...prev, [field]: url }));
        if (field === 'studentIdUrl') {
          setAmbassadorIdFileName(file.name);
        } else {
          setAmbassadorPicFileName(file.name);
        }
        toast.success(`${field === 'studentIdUrl' ? 'Student ID' : 'Profile picture'} uploaded successfully!`);
      } else {
        toast.error('Failed to retrieve upload URL');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setAmbassadorIdUploading(false);
      setAmbassadorPicUploading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (refCode && !hasTrackedStart.current && value.trim() !== '') {
      hasTrackedStart.current = true;
      trackReferralClick(refCode, refSource, 'registration_started', refCampaignId, refAssetId).catch((err) => {
        console.error('Failed to track registration start:', err);
      });
    }

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

    if (formData.role === 'student' && applyAsAmbassador) {
      if (!ambassadorFields.reason.trim()) {
        toast.error('Please state why you want to become a Relaxly Campus Ambassador.');
        return;
      }
      if (!ambassadorFields.studentIdUrl) {
        toast.error('Please upload your Student ID to apply as an ambassador.');
        return;
      }
      if (!ambassadorFields.profilePicUrl) {
        toast.error('Please upload a profile picture to apply as an ambassador.');
        return;
      }
      if (!ambassadorFields.agreed) {
        toast.error('You must agree to represent Relaxly professionally to apply.');
        return;
      }
    }

    try {
      setLoading(true);

      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        phone: formData.phone,
        role: formData.role as "student" | "owner",
        accessCode: formData.ownerAccessCode,
        university: formData.role === 'student' ? formData.university : undefined,
        customUniversity: formData.role === 'student' && formData.university === 'other' ? formData.customUniversity : undefined,
        studentId: formData.role === 'student' ? formData.studentId : undefined,
        agreeToPolicies: formData.agreeToPolicies,
        refCode: formData.referralCode || undefined
      };

      if (formData.role === 'owner') {
        payload.governmentIdUrl = formData.governmentIdUrl;
      }

      if (formData.role === 'student' && applyAsAmbassador) {
        payload.applyAsAmbassador = true;
        payload.ambassadorUniversity = formData.university === 'other' ? formData.customUniversity : universities.find(u => u._id === formData.university)?.name || 'Unspecified';
        payload.ambassadorFaculty = ambassadorFields.faculty;
        payload.ambassadorLevel = ambassadorFields.level;
        payload.ambassadorHallHostel = ambassadorFields.hallHostel;
        payload.ambassadorPhone = formData.phone;
        payload.ambassadorWhatsapp = ambassadorFields.whatsapp;
        payload.ambassadorInstagram = ambassadorFields.instagram;
        payload.ambassadorTiktok = ambassadorFields.tiktok;
        payload.ambassadorGroupsCount = ambassadorFields.groupsCount;
        payload.ambassadorReach = ambassadorFields.reach;
        payload.ambassadorExperience = ambassadorFields.experience;
        payload.ambassadorReason = ambassadorFields.reason;
        payload.ambassadorStudentIdUrl = ambassadorFields.studentIdUrl;
        payload.ambassadorProfilePicUrl = ambassadorFields.profilePicUrl;
        payload.ambassadorAgreed = ambassadorFields.agreed;
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

      router.replace('/verify-email-pending');
      return;
    } catch (error: any) {
      if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        localStorage.setItem('pendingVerificationEmail', formData.email);
        toast.success(
          error.response.data.message ||
          "This email already has an account. We've sent you a new verification email."
        );
        router.replace('/verify-email-pending');
        return;
      }
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

              {/* REFERRAL CODE */}
              <div className="md:col-span-2">
                <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                  Referral Code (Optional)
                </label>

                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                  <FaUsers className="text-gray-400 shrink-0" />

                  <input
                    type="text"
                    name="referralCode"
                    placeholder="Enter referral code if you were invited (e.g., KNUST-RICHARD-123)"
                    value={formData.referralCode}
                    onChange={handleChange}
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
                  Upload Government ID <span className="text-red-500">*</span>
                </label>

                <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center transition focus-within:border-blue-500 hover:border-gray-300">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileUpload}
                    disabled={idUploading}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  
                  {idUploading ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <FaSpinner className="animate-spin text-2xl text-blue-600" />
                      <p className="text-xs font-semibold text-slate-500">Uploading document...</p>
                    </div>
                  ) : formData.governmentIdUrl ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <FaCheckCircle className="text-lg" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 truncate max-w-[250px]">
                        {idFileName || 'Document Uploaded'}
                      </p>
                      <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                        Ready for registration
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <FaCloudUploadAlt className="text-lg" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        Click to upload your ID document
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Supported: JPG, PNG, PDF (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>
                <input
                  type="hidden"
                  name="governmentIdUrl"
                  value={formData.governmentIdUrl}
                  required
                />
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

          {/* BECOME AN AMBASSADOR OPTIONAL SECTION */}
          {formData.role === 'student' && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 sm:p-6 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyAsAmbassador}
                  onChange={(e) => setApplyAsAmbassador(e.target.checked)}
                  className="h-5 w-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-base font-bold text-blue-900">
                  Become a Relaxly Campus Ambassador (Optional)
                </span>
              </label>

              {applyAsAmbassador && (
                <div className="pt-4 border-t border-blue-100/50 space-y-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2 text-sm text-blue-700 font-medium">
                    Help Relaxly grow on your campus and earn commissions from bookings you refer!
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Faculty</label>
                    <input
                      type="text"
                      placeholder="e.g. Science / Arts"
                      value={ambassadorFields.faculty}
                      onChange={(e) => setAmbassadorFields({ ...ambassadorFields, faculty: e.target.value })}
                      required={applyAsAmbassador}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Level</label>
                    <select
                      value={ambassadorFields.level}
                      onChange={(e) => setAmbassadorFields({ ...ambassadorFields, level: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    >
                      <option value="100">Level 100</option>
                      <option value="200">Level 200</option>
                      <option value="300">Level 300</option>
                      <option value="400">Level 400</option>
                      <option value="postgraduate">Postgraduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Hall / Hostel</label>
                    <input
                      type="text"
                      placeholder="e.g. Limann Hall"
                      value={ambassadorFields.hallHostel}
                      onChange={(e) => setAmbassadorFields({ ...ambassadorFields, hallHostel: e.target.value })}
                      required={applyAsAmbassador}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0541234567"
                      value={ambassadorFields.whatsapp}
                      onChange={(e) => setAmbassadorFields({ ...ambassadorFields, whatsapp: e.target.value })}
                      required={applyAsAmbassador}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Instagram Handle (Optional)</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={ambassadorFields.instagram}
                      onChange={(e) => setAmbassadorFields({ ...ambassadorFields, instagram: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">TikTok Handle (Optional)</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={ambassadorFields.tiktok}
                      onChange={(e) => setAmbassadorFields({ ...ambassadorFields, tiktok: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Student Groups You Manage</label>
                    <input
                      type="number"
                      placeholder="e.g. 3"
                      value={ambassadorFields.groupsCount}
                      onChange={(e) => setAmbassadorFields({ ...ambassadorFields, groupsCount: Number(e.target.value) })}
                      min="0"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Estimated Student Reach</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={ambassadorFields.reach}
                      onChange={(e) => setAmbassadorFields({ ...ambassadorFields, reach: Number(e.target.value) })}
                      min="0"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Leadership Experience</label>
                    <textarea
                      placeholder="List any class rep, senate, or club leadership roles..."
                      value={ambassadorFields.experience}
                      onChange={(e) => setAmbassadorFields({ ...ambassadorFields, experience: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 h-20 resize-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Why do you want to become an ambassador? *</label>
                    <textarea
                      placeholder="Tell us why you'd be a great ambassador..."
                      value={ambassadorFields.reason}
                      onChange={(e) => setAmbassadorFields({ ...ambassadorFields, reason: e.target.value })}
                      required={applyAsAmbassador}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 h-24 resize-none"
                    />
                  </div>

                  {/* Upload Student ID */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Upload Student ID *</label>
                    <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-4 text-center cursor-pointer hover:border-blue-400">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleAmbassadorFileUpload(e, 'studentIdUrl')}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                      {ambassadorIdUploading ? (
                        <FaSpinner className="animate-spin text-xl text-blue-600" />
                      ) : ambassadorFields.studentIdUrl ? (
                        <span className="text-xs text-emerald-600 font-bold truncate max-w-[150px]">
                          {ambassadorIdFileName || 'Uploaded'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 font-medium">Click to upload ID (Max 5MB)</span>
                      )}
                    </div>
                  </div>

                  {/* Upload Profile Pic */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Upload Profile Picture *</label>
                    <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-4 text-center cursor-pointer hover:border-blue-400">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleAmbassadorFileUpload(e, 'profilePicUrl')}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                      {ambassadorPicUploading ? (
                        <FaSpinner className="animate-spin text-xl text-blue-600" />
                      ) : ambassadorFields.profilePicUrl ? (
                        <span className="text-xs text-emerald-600 font-bold truncate max-w-[150px]">
                          {ambassadorPicFileName || 'Uploaded'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 font-medium">Click to upload photo (Max 5MB)</span>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ambassadorFields.agreed}
                        onChange={(e) => setAmbassadorFields({ ...ambassadorFields, agreed: e.target.checked })}
                        required={applyAsAmbassador}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-blue-900 font-medium leading-relaxed">
                        I agree to represent Relaxly professionally and abide by the ambassador code of conduct.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

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
            href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
            className="ml-2 font-bold text-blue-600"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
