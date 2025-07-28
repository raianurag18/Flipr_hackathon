'use client';

import { InventoryProvider as Provider } from './InventoryContext';
import useInventory from '../hooks/useInventory';

export default function InventoryProvider({ children }) {
  const inventoryData = useInventory();
  return <Provider value={inventoryData}>{children}</Provider>;
}
