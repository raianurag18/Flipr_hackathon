'use client';

import { createContext, useContext } from 'react';

const InventoryContext = createContext();

export const useInventoryContext = () => useContext(InventoryContext);

export const InventoryProvider = ({ children, value }) => {
  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};