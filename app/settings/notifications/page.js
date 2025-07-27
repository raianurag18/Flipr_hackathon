'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
  const { data: session } = useSession();
  const [receiveLowStockAlerts, setReceiveLowStockAlerts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('Session data:', session);
    if (session?.user?.preferences) {
      console.log('User preferences found:', session.user.preferences);
      setReceiveLowStockAlerts(session.user.preferences.receiveLowStockAlerts);
    } else {
      console.log('No user preferences found in session.');
    }
  }, [session]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiveLowStockAlerts }),
      });

      if (response.ok) {
        toast.success('Preferences saved successfully');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      toast.error('An error occurred while saving preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notification Settings</h1>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h2 className="font-semibold">Low Stock Alerts</h2>
          <p className="text-sm text-gray-500">
            Receive an email when product stock drops below the threshold.
          </p>
        </div>
        <input
          type="checkbox"
          checked={receiveLowStockAlerts}
          onChange={(e) => setReceiveLowStockAlerts(e.target.checked)}
          className="toggle toggle-primary"
        />
      </div>
      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}