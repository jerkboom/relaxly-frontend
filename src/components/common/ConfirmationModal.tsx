'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: <FaTrash className="text-red-600" />,
      bg: 'bg-red-50',
      button: 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
    },
    warning: {
      icon: <FaExclamationTriangle className="text-amber-600" />,
      bg: 'bg-amber-50',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30'
    },
    info: {
      icon: <FaExclamationTriangle className="text-blue-600" />,
      bg: 'bg-blue-50',
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
    }
  };

  const style = typeStyles[type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 transition hover:text-slate-600"
          >
            <FaTimes />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl ${style.bg} text-3xl`}>
              {style.icon}
            </div>

            <h3 className="mb-2 text-2xl font-black text-slate-900">{title}</h3>
            <p className="mb-8 font-medium text-slate-500">{message}</p>

            <div className="flex w-full gap-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-2xl bg-slate-100 py-4 font-black text-slate-600 transition hover:bg-slate-200 active:scale-95 disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 rounded-2xl py-4 font-black text-white shadow-lg transition active:scale-95 disabled:opacity-50 ${style.button}`}
              >
                {loading ? 'Processing...' : confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
