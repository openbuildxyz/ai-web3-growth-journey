'use client';

import { ReactNode } from 'react';

// Simple mock providers for hackathon
export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {/* Simple toast simulation */}
      <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2 hidden">
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg border border-purple-500">
          Demo: Toast notifications would appear here
        </div>
      </div>
    </>
  );
}