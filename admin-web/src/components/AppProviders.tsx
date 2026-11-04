'use client';

import React from 'react';
import { OpsProvider } from '@/components/layout/OpsContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <OpsProvider>{children}</OpsProvider>;
}

