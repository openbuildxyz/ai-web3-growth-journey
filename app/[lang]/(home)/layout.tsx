'use client';

import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';
import { useBaseOptions } from '../layout.config';

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  const baseOptions = useBaseOptions();
  
  return <HomeLayout {...baseOptions}>{children}</HomeLayout>;
}
