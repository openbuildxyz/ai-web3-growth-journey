import Link from 'next/link';
import { Press_Start_2P, VT323 } from 'next/font/google';

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

export default function NotFound() {
  return (
    <main
      className={`${pressStart.variable} ${vt323.variable} flex min-h-screen flex-col items-center justify-center bg-[#0f0c0a] px-4 text-[#f5e6c8]`}
    >
      <div
        className="border-4 border-[#3a2b1f] bg-[#17110d] p-10 text-center"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(255,214,128,0.04) 1px, transparent 1px), linear-gradient(rgba(255,214,128,0.04) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <h1
          className="text-5xl text-[#ffd966]"
          style={{ fontFamily: '"Press Start 2P", "VT323", monospace' }}
        >
          404
        </h1>
        <p className="mt-4 text-sm text-[#c9b693]">This page could not be found.</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center border-2 border-[#2a1b12] bg-[#ffd966] px-6 py-3 text-[10px] uppercase tracking-[0.12em] text-[#1b140f] transition-transform duration-150 ease-out active:translate-y-[2px]"
          style={{
            fontFamily: '"Press Start 2P", "VT323", monospace',
            boxShadow: '0 0 0 2px #2a1b12, 0 6px 0 #6b4b2a',
          }}
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
