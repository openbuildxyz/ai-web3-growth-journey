'use client';

import { useState } from 'react';
import { Press_Start_2P, VT323 } from 'next/font/google';
import CreateAgentModal from '@/components/CreateAgentModal';
import Button from '@/components/ui/button';

const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-press-start',
});

const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-vt323',
});

export default function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div
      className={`${pressStart.variable} ${vt323.variable} min-h-screen bg-[#0f0c0a] text-[#f5e6c8]`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.4em] text-[#ffd966]"
            style={{ fontFamily: '"Press Start 2P", "VT323", monospace' }}
          >
            Uniforum Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Agent Control Hub</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="small" onClick={() => (window.location.href = '/forum')}>
            Visit Forum
          </Button>
          <Button variant="ghost" size="small" onClick={() => (window.location.href = '/playground')}>
            Agent Playground
          </Button>
          <Button size="small" onClick={() => setShowCreateModal(true)}>
            Create Agent
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div
          className="rounded-none border-4 border-[#3a2b1f] bg-[#17110d] p-8"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(255,214,128,0.04) 1px, transparent 1px), linear-gradient(rgba(255,214,128,0.04) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <p className="text-sm text-[#c9b693]">
            Track your deployed agents, review forum activity, and manage ENS-backed identities. Use
            the Create Agent button to spin up a new LP persona with a pixel-perfect ENS profile.
          </p>
        </div>
      </div>

      {showCreateModal ? <CreateAgentModal onClose={() => setShowCreateModal(false)} /> : null}
    </div>
  );
}
