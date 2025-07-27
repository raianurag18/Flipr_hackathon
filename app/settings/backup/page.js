'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../lib/db';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/Layout/Layout';
import Button from '../../../components/ui/Button';
import { ArrowDownTrayIcon, ClockIcon } from '@heroicons/react/24/outline';

const BackupSettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    toast.loading('Exporting data...');

    try {
      const products = await db.products.toArray();
      const movements = await db.movements.toArray();
      const logs = await db.logs.toArray();

      const data = {
        products,
        movements,
        logs,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_backup_${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoBackup = async () => {
    const now = new Date();
    const lastBackupTime = localStorage.getItem('lastBackupTime');
    
    if (lastBackupTime && (now.getTime() - new Date(lastBackupTime).getTime()) < 24 * 60 * 60 * 1000) {
      setLastBackup(new Date(lastBackupTime));
      return; // Already backed up today
    }

    try {
      const products = await db.products.toArray();
      const movements = await db.movements.toArray();
      
      const backupData = { products, movements, timestamp: now.toISOString() };
      localStorage.setItem('dailyBackup', JSON.stringify(backupData));
      localStorage.setItem('lastBackupTime', now.toISOString());
      setLastBackup(now);
      toast.success('Daily backup completed.');
    } catch (error) {
      toast.error('Automatic backup failed.');
    }
  };

  useEffect(() => {
    handleAutoBackup();
    const storedLastBackup = localStorage.getItem('lastBackupTime');
    if (storedLastBackup) {
      setLastBackup(new Date(storedLastBackup));
    }
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Backup & Export</h1>
        <p className="text-gray-600 mb-8">Manage your local application data.</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900">Manual Export</h2>
          <p className="text-gray-600 mt-1 mb-6">
            Download a JSON file of your current local inventory data. This is useful for creating personal backups or migrating data.
          </p>
          <Button onClick={handleExport} disabled={loading}>
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            {loading ? 'Exporting...' : 'Export All Data'}
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
          <h2 className="text-xl font-bold text-gray-900">Automated Local Backups</h2>
          <p className="text-gray-600 mt-1">
            The application automatically saves a backup of your data to your browser's local storage every 24 hours.
          </p>
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-800">
                  Last Backup: {lastBackup ? lastBackup.toLocaleString() : 'Not yet performed'}
                </p>
                <p className="text-sm text-blue-700">
                  This backup is stored on your device and will be used for recovery if needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BackupSettingsPage;