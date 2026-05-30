'use client';

import React, { useEffect, useState } from 'react';
import API from '../../lib/axios';

/**
 * A small indicator for the backend system health.
 * Monitors the /api/health endpoint.
 */
const SystemStatus = () => {
  const [status, setStatus] = useState<'loading' | 'online' | 'error'>('loading');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await API.get('/health');
        if (response.status === 200) {
          setStatus('online');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    checkHealth();
    // Re-check every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'loading') return null;

  return (
    <div className="fixed bottom-4 left-6 z-50 flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-3 py-1.5 shadow-sm border border-slate-100 transition-all hover:bg-white">
      <div className={`h-2 w-2 rounded-full animate-pulse ${status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        System {status === 'online' ? 'Operational' : 'Issues'}
      </span>
    </div>
  );
};

export default SystemStatus;
