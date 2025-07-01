"use client";

import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';
import { useNavigation } from '../Providers/NavigationProvider';

export function HomeLayoutWithI18n({ children }: { children: ReactNode }) {
  const layoutOptions = useNavigation();
  
  return <HomeLayout {...layoutOptions}>{children}</HomeLayout>;
} 