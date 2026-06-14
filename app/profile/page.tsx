'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import API from '../../src/lib/axios';

import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaSave,
  FaUniversity,
  FaUser,
} from 'react-icons/fa';

import {
  useAuthStore,
} from '../../src/store/authStore';

import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

interface UserProfile {
  _id: string;

  name: string;

  email: string;

  phone?: string;

  role: string;

  gender?: 'Male' | 'Female';

  createdAt: string;

  studentId?: string;

  customUniversity?: string;

  university?: {
    name: string;
  };
}

export default function ProfilePage() {
  const { token } =
    useAuthStore();

  const [user, setUser] =
    useState<UserProfile | null>(
      null
    );

  const [name, setName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [gender, setGender] =
    useState('');

  const [university, setUniversity] = useState('');
  const [customUniversity, setCustomUniversity] = useState('');
  const [studentId, setStudentId] = useState('');
  const [universities, setUniversities] = useState<{ _id: string, name: string }[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const fetchUniversities = async () => {
    try {
      const response = await API.get('/universities');
      setUniversities(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch universities:', error);
    }
  };

  const fetchProfile =
    useCallback(
      async () => {
        try {
          const response =
            await API.get(
              '/users/profile',
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          const profileData = response.data?.data || response.data; setUser(profileData);

          setName(profileData.name || '');

          setPhone(profileData.phone ||
              ''
          );

          setGender(profileData.gender ||
              ''
          );

          setUniversity(profileData.university?._id || (profileData.customUniversity ? 'other' : ''));
          setCustomUniversity(profileData.customUniversity || '');
          setStudentId(profileData.studentId || '');
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
      [token]
    );

  useEffect(() => {
    void fetchUniversities();
    const timer =
      window.setTimeout(() => {
        void fetchProfile();
      }, 0);

    return () =>
      window.clearTimeout(timer);
  }, [fetchProfile]);

  const updateProfile =
    async () => {
      try {
        setSaving(true);

        const response =
          await API.put(
            '/users/profile',
            {
              name,
              phone,
              gender,
              university,
              customUniversity: university === 'other' ? customUniversity : undefined,
              studentId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        alert(
          response.data.message
        );

        fetchProfile();
      } catch (error: unknown) {
        const message =
          error &&
          typeof error === 'object' &&
          'response' in error
            ? (
                error as {
                  response?: {
                    data?: {
                      message?: string;
                    };
                  };
                }
              ).response?.data?.message
            : undefined;

        alert(
          message ||
            'Update failed'
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-100 px-4 sm:px-6 py-6 sm:py-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-white shadow-xl">

          {/* HEADER */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 px-6 sm:px-10 py-10 sm:py-14 text-white">

            {/* BACK BUTTON */}
            <button
              onClick={() =>
                window.history.back()
              }
              className="absolute left-4 sm:left-6 top-4 sm:top-6 flex items-center gap-2 rounded-2xl bg-white/20 px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95"
            >
              <FaArrowLeft />

              Back
            </button>

            {/* PROFILE HEADER */}
            <div className="mt-10 sm:mt-12 flex flex-col items-center gap-4 sm:gap-6 md:flex-row text-center md:text-left">
              <div className="flex h-24 w-24 sm:h-32 sm:w-32 shrink-0 items-center justify-center rounded-full bg-white text-4xl sm:text-5xl font-black text-blue-600 shadow-xl">
                {user?.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <h1 className="text-3xl sm:text-5xl font-black truncate max-w-full">
                  {user?.name}
                </h1>

                <p className="mt-1 sm:mt-2 text-lg sm:text-xl capitalize text-blue-100">
                  {user?.role}
                </p>

                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-blue-200">
                  Member since{' '}
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="grid gap-6 sm:gap-8 p-6 sm:p-10 md:grid-cols-2">

            {/* NAME */}
            <div className="rounded-[1.5rem] sm:rounded-3xl border border-slate-200 p-6 sm:p-8">
              <div className="mb-4 sm:mb-5 flex items-center gap-3 text-blue-600">
                <FaUser className="text-xl sm:text-2xl" />

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Full Name
                </h2>
              </div>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-slate-300 px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg font-medium text-slate-800 outline-none transition focus:border-blue-500"
              />
            </div>

            {/* EMAIL */}
            <div className="rounded-[1.5rem] sm:rounded-3xl border border-slate-200 p-6 sm:p-8">
              <div className="mb-4 sm:mb-5 flex items-center gap-3 text-blue-600">
                <FaEnvelope className="text-xl sm:text-2xl" />

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Email Address
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-100 px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg font-medium text-slate-700 truncate">
                {user?.email}
              </div>
            </div>

            {/* PHONE */}
            <div className="rounded-[1.5rem] sm:rounded-3xl border border-slate-200 p-6 sm:p-8">
              <div className="mb-4 sm:mb-5 flex items-center gap-3 text-blue-600">
                <FaPhone className="text-xl sm:text-2xl" />

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Phone Number
                </h2>
              </div>

              <input
                type="text"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="Enter phone number"
                className="w-full rounded-2xl border border-slate-300 px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg font-medium text-slate-800 outline-none transition focus:border-blue-500"
              />
            </div>

            {/* GENDER */}
            <div className="rounded-[1.5rem] sm:rounded-3xl border border-slate-200 p-6 sm:p-8">
              <div className="mb-4 sm:mb-5 flex items-center gap-3 text-blue-600">
                <FaUser className="text-xl sm:text-2xl" />

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Gender
                </h2>
              </div>

              <select
                value={gender}
                onChange={(e) =>
                  setGender(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-slate-300 px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg font-medium text-slate-800 outline-none transition focus:border-blue-500"
              >
                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>
            </div>

            {/* UNIVERSITY & STUDENT ID (STUDENTS ONLY) */}
            {user?.role === 'student' && (
              <>
                {/* UNIVERSITY */}
                <div className="rounded-[1.5rem] sm:rounded-3xl border border-slate-200 p-6 sm:p-8">
                  <div className="mb-4 sm:mb-5 flex items-center gap-3 text-blue-600">
                    <FaUniversity className="text-xl sm:text-2xl" />

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      University
                    </h2>
                  </div>

                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg font-medium text-slate-800 outline-none transition focus:border-blue-500"
                  >
                    <option value="">Select University</option>
                    {universities.map((u) => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                    <option value="other">Other (Not listed)</option>
                  </select>

                  {university === 'other' && (
                    <input
                      type="text"
                      value={customUniversity}
                      onChange={(e) => setCustomUniversity(e.target.value)}
                      placeholder="Enter university name"
                      className="mt-4 w-full rounded-2xl border border-slate-300 px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg font-medium text-slate-800 outline-none transition focus:border-blue-500"
                    />
                  )}
                </div>

                {/* STUDENT ID */}
                <div className="rounded-[1.5rem] sm:rounded-3xl border border-slate-200 p-6 sm:p-8">
                  <div className="mb-4 sm:mb-5 flex items-center gap-3 text-blue-600">
                    <FaUser className="text-xl sm:text-2xl" />

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Student ID Number
                    </h2>
                  </div>

                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter student ID"
                    className="w-full rounded-2xl border border-slate-300 px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg font-medium text-slate-800 outline-none transition focus:border-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* SAVE BUTTON */}
          <div className="px-6 sm:px-10 pb-6 sm:pb-10">
            <button
              onClick={
                updateProfile
              }
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white transition hover:bg-blue-700 active:scale-95"
            >
              <FaSave />

              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}