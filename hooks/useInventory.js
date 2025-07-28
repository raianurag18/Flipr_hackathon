import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function useInventory() {
  const [loading, setLoading] = useState(true);

  const products = useLiveQuery(() => db.products.toArray(), []);
  const movements = useLiveQuery(() => db.movements.toArray(), []);

  const syncData = async () => {
    setLoading(true);
    try {
      // Fetch from API
      const [productsRes, movementsRes] = await Promise.all([
        fetch('/api/products?limit=1000'),
        fetch('/api/inventory/movement?limit=1000')
      ]);

      if (!productsRes.ok || !movementsRes.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const { products: serverProducts } = await productsRes.json();
      const { movements: serverMovements } = await movementsRes.json();

      // Bulk update local DB
      await db.transaction('rw', db.products, db.movements, async () => {
        await db.products.bulkPut(serverProducts);
        await db.movements.bulkPut(serverMovements);
      });
      
      toast.success('Data synced with server');
    } catch (error) {
      console.error("Sync Error: ", error);
      toast.error('Could not sync with server. Displaying local data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  return { products, movements, loading, refetch: syncData };
};
