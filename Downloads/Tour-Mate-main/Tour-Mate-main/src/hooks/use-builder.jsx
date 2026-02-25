'use client';

import { createContext, useContext } from 'react';

export const BuilderContext = createContext(null);

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};
