'use client';

import React, { useState, useEffect } from 'react';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface ReservationTimerProps {
  expiresAt: string | Date;
  onExpire?: () => void;
}

const ReservationTimer: React.FC<ReservationTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiry = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, expiry - now);
      
      if (diff === 0 && !isExpired) {
        setIsExpired(true);
        if (onExpire) onExpire();
      }
      
      return Math.floor(diff / 1000);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire, isExpired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft > 0 && timeLeft <= 300; // 5 minutes

  if (isExpired) {
    return (
      <div className="rounded-2xl bg-rose-50 p-4 text-center ring-2 ring-rose-200">
        <p className="text-xs font-black uppercase tracking-widest text-rose-600">
          Reservation Expired
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-3xl p-6 transition-all duration-500 ${
      isWarning ? 'bg-amber-50 ring-4 ring-amber-200' : 'bg-blue-50 ring-4 ring-blue-100'
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl shadow-sm ${
            isWarning ? 'bg-amber-500 text-white animate-pulse' : 'bg-blue-600 text-white'
          }`}>
            <FaClock />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Reservation Timer
            </h4>
            <p className={`text-2xl font-black ${isWarning ? 'text-amber-600' : 'text-blue-700'}`}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {isWarning && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 rounded-xl bg-amber-200/50 px-3 py-1.5 text-amber-700"
            >
              <FaExclamationTriangle className="text-xs" />
              <span className="text-[10px] font-black uppercase">Ending Soon</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {isWarning && (
        <p className="mt-4 text-[10px] font-bold leading-tight text-amber-700/70">
          Complete your payment now to secure this room. Unpaid reservations are released automatically.
        </p>
      )}
    </div>
  );
};

export default ReservationTimer;
