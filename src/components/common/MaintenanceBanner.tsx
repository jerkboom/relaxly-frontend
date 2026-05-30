'use client';

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { connectSocket, getStoredToken } from '../../lib/socket';
import { toast } from 'react-hot-toast';

const MaintenanceBanner = () => {
  const { maintenanceMode, maintenanceMessage, setMaintenance } = useSettingsStore();

  useEffect(() => {
    let socketInstance: any = null;

    const initSocket = async () => {
      const token = getStoredToken();
      socketInstance = await connectSocket(token || undefined);
      
      if (socketInstance) {
        socketInstance.on('maintenance_update', (data: { maintenanceMode: boolean; message: string }) => {
          setMaintenance(data.maintenanceMode, data.message);
          if (data.maintenanceMode) {
            toast.error("Platform entered maintenance mode", { id: 'maint-on' });
          } else {
            toast.success("Platform is now back online", { id: 'maint-off' });
          }
        });
      }
    };

    initSocket();

    return () => {
      if (socketInstance) {
        socketInstance.off('maintenance_update');
      }
    };
  }, [setMaintenance]);

  if (!maintenanceMode) return null;

  return (
    <div className="bg-amber-600 text-white py-3 px-4 flex items-center justify-center gap-3 sticky top-0 z-[100] shadow-md animate-in slide-in-from-top duration-500">
      <AlertTriangle className="h-5 w-5 animate-pulse" />
      <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-center">
        <span className="font-bold uppercase text-xs tracking-widest whitespace-nowrap">Platform Maintenance</span>
        <span className="text-sm font-medium opacity-90">{maintenanceMessage}</span>
      </div>
    </div>
  );
};

export default MaintenanceBanner;
