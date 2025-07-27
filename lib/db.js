import Dexie from 'dexie';

export const db = new Dexie('inventoryDB');

db.version(1).stores({
  products: '++_id, name, sku, category, currentStock',
  movements: '++_id, productId, type, timestamp, userId',
  syncQueue: '++id, type, payload, timestamp',
  failedSyncQueue: '++id, type, payload, timestamp, error',
  logs: '++id, type, message, timestamp'
});

export const syncToServer = async () => {
  const offlineActions = await db.syncQueue.toArray();
  if (offlineActions.length === 0) {
    console.log('No items to sync.');
    return;
  }

  console.log(`Syncing ${offlineActions.length} items...`);
  await db.logs.add({ type: 'info', message: `Starting sync for ${offlineActions.length} items.`, timestamp: new Date() });


  for (const action of offlineActions) {
    try {
      const response = await fetch(action.payload.url, {
        method: action.payload.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload.body),
      });

      if (response.ok) {
        await db.syncQueue.delete(action.id);
        await db.logs.add({ type: 'success', message: `Synced item #${action.id}`, timestamp: new Date() });
      } else {
        const errorData = await response.json();
        console.error('Sync failed:', errorData);
        await db.logs.add({ type: 'error', message: `Sync failed for item #${action.id}: ${errorData.message}`, timestamp: new Date() });
        // Move to failed queue
        await db.failedSyncQueue.add({ ...action, error: errorData });
        await db.syncQueue.delete(action.id);
      }
    } catch (error) {
      console.error('Network error during sync:', error);
      await db.logs.add({ type: 'error', message: `Network error for item #${action.id}: ${error.message}`, timestamp: new Date() });
    }
  }
};