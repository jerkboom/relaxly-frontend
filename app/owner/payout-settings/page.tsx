'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaWallet, 
  FaMobileAlt, 
  FaUniversity, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaArrowRight,
  FaSave,
  FaShieldAlt,
  FaInfoCircle,
  FaTimesCircle,
  FaPhoneAlt,
  FaEnvelope
} from 'react-icons/fa';
import { payoutMethodService } from '@/src/services/payoutMethodService';
import { useSettingsStore } from '@/src/store/settingsStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function PayoutSettingsPage() {
  const { supportSettings } = useSettingsStore();
  const [method, setMethod] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'momo' as 'momo' | 'bank',
    accountName: '',
    network: 'MTN',
    phoneNumber: '',
    bankName: '',
    accountNumber: ''
  });

  useEffect(() => {
    loadMethod();
  }, []);

  const loadMethod = async () => {
    try {
      setLoading(true);
      const res = await payoutMethodService.getMyPayoutMethod();
      console.log('LOAD PAYOUT METHOD:', res);
      
      if (res.payoutMethod) {
        // Handle both isVerified (from model) and verified (from legacy/User model sync)
        const methodData = {
          ...res.payoutMethod,
          isVerified: res.payoutEnabled ?? res.payoutMethod.isVerified ?? res.payoutMethod.verified ?? false
        };
        
        setMethod(methodData);
        
        // Pre-fill form
        setFormData({
          type: res.payoutMethod.type || 'momo',
          accountName: res.payoutMethod.accountName || '',
          network: res.payoutMethod.provider || 'MTN',
          phoneNumber: res.payoutMethod.type === 'momo' ? res.payoutMethod.accountNumber : '',
          bankName: res.payoutMethod.type === 'bank' ? res.payoutMethod.bankCode : '',
          accountNumber: res.payoutMethod.type === 'bank' ? res.payoutMethod.accountNumber : ''
        });
      }
    } catch (error) {
      console.error('Failed to load payout method:', error);
      toast.error('Could not load payout settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        type: formData.type,
        accountName: formData.accountName,
        accountNumber: formData.type === 'momo' ? formData.phoneNumber : formData.accountNumber,
        provider: formData.type === 'momo' ? formData.network : undefined,
        bankCode: formData.type === 'bank' ? formData.bankName : undefined,
      };

      await payoutMethodService.setupPayoutMethod(payload);
      toast.success('Payout method verified successfully');
      await loadMethod();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Save Error:', error);
      toast.error(error.response?.data?.message || 'Failed to save payout details');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await payoutMethodService.verifyPayoutMethod();
      if (res.verified) {
        toast.success('Recipient verified successfully!');
      } else {
        toast.error('Verification pending or failed. Please check your details.');
      }
      await loadMethod();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Payout Settings</h1>
          <p className="mt-2 text-slate-500 font-medium">Manage how you receive your earnings from bookings.</p>
        </div>
        {method && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-2xl bg-white border-2 border-slate-100 px-6 py-3 font-black text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            Edit Details
          </button>
        )}
      </div>

      {/* STATUS BANNER */}
      {(!method || !method.isVerified) ? (
        <div className="rounded-[2.5rem] bg-orange-50 border-2 border-orange-100 p-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl text-orange-600">
            <FaExclamationTriangle />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black text-slate-900">Payouts are currently disabled</h3>
            <p className="text-slate-600 font-medium mt-1">
              You must set up and verify a valid payout method before you can receive any funds.
            </p>
          </div>
          {method && !method.isVerified && (
            <button 
              onClick={handleVerify}
              disabled={verifying}
              className="px-8 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Verify Now'}
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-[2.5rem] bg-emerald-50 border-2 border-emerald-100 p-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl text-emerald-600">
            <FaCheckCircle />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black text-slate-900">Payouts are active</h3>
            <p className="text-slate-600 font-medium mt-1">
              Your account is ready to receive automated transfers to your verified {method.type === 'momo' ? 'Mobile Money' : 'Bank'} account.
            </p>
          </div>
          <div className="px-6 py-2 bg-emerald-100 text-emerald-700 font-black rounded-full text-xs uppercase tracking-widest">
            Verified Account
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-8">
          {(!method || isEditing) ? (
            <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-50">
              <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <FaWallet className="text-blue-600" />
                {method ? 'Update Payout Method' : 'Setup Payout Method'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Account Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'momo'})}
                        className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          formData.type === 'momo' 
                            ? 'border-blue-600 bg-blue-50 text-blue-600' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-500'
                        }`}
                      >
                        <FaMobileAlt />
                        <span className="font-black">Mobile Money</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'bank'})}
                        className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          formData.type === 'bank' 
                            ? 'border-blue-600 bg-blue-50 text-blue-600' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-500'
                        }`}
                      >
                        <FaUniversity />
                        <span className="font-black">Bank Account</span>
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Account Holder Name</label>
                    <input 
                      required
                      placeholder="e.g. John Doe"
                      className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 focus:border-blue-600 focus:outline-none transition-colors"
                      value={formData.accountName}
                      onChange={e => setFormData({...formData, accountName: e.target.value})}
                    />
                  </div>

                  {formData.type === 'momo' ? (
                    <>
                      <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Network Provider</label>
                        <select 
                          className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 focus:border-blue-600 focus:outline-none transition-colors appearance-none"
                          value={formData.network}
                          onChange={e => setFormData({...formData, network: e.target.value})}
                        >
                          <option value="MTN">MTN</option>
                          <option value="TELECEL">TELECEL (Vodafone)</option>
                          <option value="AIRTELTIGO">AirtelTigo</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Phone Number</label>
                        <input 
                          required
                          placeholder="054XXXXXXX"
                          className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 focus:border-blue-600 focus:outline-none transition-colors"
                          value={formData.phoneNumber}
                          onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Bank Name</label>
                        <input 
                          required
                          placeholder="e.g. GCB Bank"
                          className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 focus:border-blue-600 focus:outline-none transition-colors"
                          value={formData.bankName}
                          onChange={e => setFormData({...formData, bankName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Account Number</label>
                        <input 
                          required
                          placeholder="1234567890XXX"
                          className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 focus:border-blue-600 focus:outline-none transition-colors"
                          value={formData.accountNumber}
                          onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  {method && (
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-4 rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 transition active:scale-95"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-black transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <FaSave />
                        <span>Save Payout Details</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-50">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-slate-900">Current Payout Details</h3>
                  <p className="text-sm font-medium text-slate-400 mt-1">Verified destination for your funds</p>
                </div>
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl ${
                  method.type === 'momo' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {method.type === 'momo' ? <FaMobileAlt /> : <FaUniversity />}
                </div>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                  <p className="text-xl font-black text-slate-900">{method.accountName}</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Method Type</p>
                  <p className="text-xl font-black text-slate-900 uppercase">{method.type === 'momo' ? 'Mobile Money' : 'Bank Account'}</p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{method.type === 'momo' ? 'Network' : 'Bank Name'}</p>
                  <p className="text-xl font-black text-slate-900">{method.type === 'momo' ? method.provider : method.bankCode}</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                  <p className="text-xl font-black text-slate-900">{method.accountNumber}</p>
                </div>
              </div>

              {method.recipientCode && (
                <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paystack Recipient Code</p>
                    <code className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{method.recipientCode}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Verification:</span>
                    <span className={`text-xs font-black uppercase tracking-tighter px-3 py-1 rounded-full ${
                      method.isVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {method.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-[3rem] bg-slate-900 p-10 text-white shadow-xl">
            <h4 className="text-2xl font-black mb-6 flex items-center gap-3">
              <FaShieldAlt className="text-blue-400" />
              Secure Payouts
            </h4>
            <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">
              We use Paystack to process all hostel payouts. This ensures your funds are transferred securely and on schedule.
            </p>
            
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="h-6 w-6 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-black">1</div>
                <div>
                  <p className="font-bold text-sm">Recipient Setup</p>
                  <p className="text-xs text-slate-500 mt-1">Your details are sent to Paystack to create a transfer recipient.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="h-6 w-6 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-black">2</div>
                <div>
                  <p className="font-bold text-sm">Automatic Verification</p>
                  <p className="text-xs text-slate-500 mt-1">We verify the account exists before allowing any payouts.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="h-6 w-6 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-black">3</div>
                <div>
                  <p className="font-bold text-sm">Schedule Payouts</p>
                  <p className="text-xs text-slate-500 mt-1">Once verified, your earnings are automatically processed.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-[3rem] bg-blue-600 p-10 text-white shadow-xl shadow-blue-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl mb-6">
              <FaInfoCircle />
            </div>
            <h4 className="text-2xl font-black mb-4">Need Help?</h4>
            <p className="text-blue-100 font-medium text-sm leading-relaxed mb-8">
              If you're having trouble verifying your account or haven't received a payout, contact our support team.
            </p>
            <button 
              onClick={() => setShowSupportModal(true)}
              className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black transition hover:bg-blue-50 active:scale-95"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* SUPPORT MODAL */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupportModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
            >
              <div className="bg-blue-600 p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                    <FaInfoCircle />
                  </div>
                  <button onClick={() => setShowSupportModal(false)} className="text-white/60 hover:text-white transition-colors">
                    <FaTimesCircle className="text-2xl" />
                  </button>
                </div>
                <h3 className="text-2xl font-black">Support Channels</h3>
                <p className="text-blue-100 text-sm font-medium mt-1">Select your preferred way to reach us.</p>
              </div>

              <div className="p-8 space-y-4">
                <a 
                  href={`https://wa.me/${supportSettings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hello Relaxly Support, I need assistance with my payout settings.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-100 text-emerald-700 transition hover:bg-emerald-100 active:scale-[0.98]"
                >
                  <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-200">
                    <FaMobileAlt />
                  </div>
                  <div className="flex-1">
                    <p className="font-black">WhatsApp Support</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Instant Messaging</p>
                  </div>
                  <FaArrowRight className="opacity-40" />
                </a>

                <a 
                  href={`tel:${supportSettings.phone}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border-2 border-blue-100 text-blue-700 transition hover:bg-blue-100 active:scale-[0.98]"
                >
                  <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-200">
                    <FaPhoneAlt className="rotate-90" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black">Call Support</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Mon - Fri • 8am - 6pm</p>
                  </div>
                  <FaArrowRight className="opacity-40" />
                </a>

                <a 
                  href={`mailto:${supportSettings.email}?subject=Payout Support Request`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
                >
                  <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-lg shadow-slate-200">
                    <FaEnvelope />
                  </div>
                  <div className="flex-1">
                    <p className="font-black">Email Support</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Response within 24h</p>
                  </div>
                  <FaArrowRight className="opacity-40" />
                </a>
              </div>

              <div className="px-8 pb-8">
                <button 
                  onClick={() => setShowSupportModal(false)}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
