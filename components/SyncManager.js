'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useInterval } from '../hooks/useInterval';
import { db, syncToServer } from '../lib/db';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudIcon, 
  CloudArrowUpIcon, 
  ExclamationCircleIcon,
  WifiIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

const SyncManager = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncQueue = useLiveQuery(() => db.syncQueue.toArray(), []);
  const initialLoad = useRef(true);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      await syncToServer();
    } catch (error) {
      console.error('Sync failed', error);
      toast.error('An error occurred during sync.');
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  useInterval(() => {
    if (isOnline) {
      handleSync();
    }
  }, 10000); // Sync every 10 seconds

  const getStatus = () => {
    if (!isOnline) {
      return { 
        text: `Offline (${syncQueue?.length || 0} pending)`, 
        icon: NoSymbolIcon, 
        color: 'bg-gray-600',
        pulse: false
      };
    }
    if (isSyncing) {
      return { 
        text: 'Syncing...', 
        icon: CloudArrowUpIcon, 
        color: 'bg-blue-500',
        pulse: true
      };
    }
    if (syncQueue && syncQueue.length > 0) {
      return { 
        text: `Pending (${syncQueue.length})`, 
        icon: ExclamationCircleIcon, 
        color: 'bg-yellow-500',
        pulse: true
      };
    }
    return { 
      text: 'Online', 
      icon: WifiIcon, 
      color: 'bg-green-500',
      pulse: false
    };
  };

  const { text, icon: Icon, color, pulse } = getStatus();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`flex items-center px-4 py-2 rounded-full shadow-lg text-white ${color}`}
        >
          <Icon className={`h-5 w-5 mr-2 ${pulse ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-medium">{text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SyncManager;
