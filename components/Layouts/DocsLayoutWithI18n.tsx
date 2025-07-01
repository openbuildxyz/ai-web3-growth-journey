"use client";

import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { useNavigation } from '../Providers/NavigationProvider';

export function DocsLayoutWithI18n({ 
  children, 
  tree 
}: { 
  children: ReactNode;
  tree: any;  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) {
  const layoutOptions = useNavigation();
  
  return (
    <DocsLayout tree={tree} {...layoutOptions}>
      {children}
    </DocsLayout>
  );
} 