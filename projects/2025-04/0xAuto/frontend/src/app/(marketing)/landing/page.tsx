'use client';

import Spline from '@splinetool/react-spline';
import Link from 'next/link';
import { FaRocket, FaGithub, FaDiscord, FaTwitter } from 'react-icons/fa';

export default function Home() {
  return (
    <main className="relative h-screen overflow-hidden">
      {/* 3D Scene */}
      <Spline
        scene="https://prod.spline.design/KiD7sWB6QevEsMgE/scene.splinecode"
        className="relative z-0"
      />

      {/* Center Content */}
      <div className="absolute top-[22%] left-[5%] transform -translate-y-0 text-white z-10 w-full max-w-5xl px-4 pointer-events-none">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <h1 className="text-7xl md:text-9xl font-bold mb-12 md:mb-0 text-white leading-none">
            <div className="mb-[-0.2em]">
              <span className="text-indigo-500 text-8xl md:text-[12rem]">Auto</span>mate
            </div>
            <div className="mb-[-0em]">
              your strategy,
            </div>
            <div>
              powered by <span className="text-indigo-500 text-5xl md:text-[6rem]">MCP</span><span className="text-5xl md:text-[6rem]">！</span>
            </div>
          </h1>
        </div>

        <div className="flex mt-2 md:mt-4 mb-8">
          <div className="flex items-center w-full">
            <p className="text-4xl md:text-5xl font-semibold text-indigo-300 tracking-wider drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)] ml-2">
              Trade Smarter, Not Harder
            </p>

            <Link
              href="/agents"
              className="group relative flex flex-row items-center justify-between ml-4 px-6 py-2 rounded-xl bg-gradient-to-r from-transparent from-5% via-transparent via-20% via-indigo-400/20 via-40% via-indigo-500/30 via-60% to-indigo-600/50 text-white transform hover:translate-x-2 transition-all duration-300 border-r border-t border-b border-white/10 flex-grow flex-shrink-0 overflow-hidden pointer-events-auto"
            >
              <div className="absolute top-0 bottom-0 left-0 w-0 group-hover:w-full rounded-xl bg-gradient-to-r from-indigo-400/15 via-indigo-500/25 to-indigo-600/35 transition-[width] duration-700 ease-in-out"></div>

              <div className="relative transition-transform duration-700 ease-in-out group-hover:translate-x-[1050%] z-10">
                <FaRocket className="w-8 h-8 text-indigo-300 relative z-10" />
              </div>
              <span className="text-3xl md:text-4xl font-semibold relative z-10 transition-transform duration-700 ease-in-out group-hover:-translate-x-24">Start Earning 24/7</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="absolute top-[74%] left-[5%] transform -translate-y-0 z-10 w-full max-w-5xl px-4 pointer-events-none">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="p-6 rounded-xl backdrop-blur-sm bg-white/25 border border-white/30 text-white hover:bg-white/50 transition-colors pointer-events-auto">
            <div className="flex items-center mb-3">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-400">Smart Automation</h3>
            </div>
            <p className="text-lg md:text-xl text-[#4B5563] leading-relaxed">
              24/7 strategy execution with real-time triggers based on KOL posts, market events, and on-chain activities
            </p>
          </div>

          <div className="p-6 rounded-xl backdrop-blur-sm bg-white/25 border border-white/30 text-white hover:bg-white/50 transition-colors pointer-events-auto">
            <div className="flex items-center mb-3">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-400">Multi-Dimensional Triggers</h3>
            </div>
            <p className="text-lg md:text-xl text-[#4B5563] leading-relaxed">
              Intelligent analysis of social media, market data, and on-chain events to capture every trading opportunity
            </p>
          </div>

          <div className="p-6 rounded-xl backdrop-blur-sm bg-white/25 border border-white/30 text-white hover:bg-white/50 transition-colors pointer-events-auto">
            <div className="flex items-center mb-3">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-400">Secure & Reliable</h3>
            </div>
            <p className="text-lg md:text-xl text-[#4B5563] leading-relaxed">
              User-dedicated smart contracts for fund management with transparent point system for worry-free automation
            </p>
          </div>
        </div>
      </div>

      {/* Footer and Social Media */}
      <div className="absolute bottom-4 left-0 w-full z-10 px-4 pointer-events-none">
        <div className="flex items-center justify-start ml-[5%]">
          <div className="text-gray-400 text-sm">
            © 2025 0xAuto
          </div>
          <div className="flex space-x-4 ml-4">
            <a href="#" className="text-gray-400 hover:text-indigo-300 transition-colors pointer-events-auto">
              <FaGithub className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-indigo-300 transition-colors pointer-events-auto">
              <FaDiscord className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-indigo-300 transition-colors pointer-events-auto">
              <FaTwitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Ask Button */}
      <div className="fixed flex justify-end items-center w-full z-20 p-4 bottom-1 right-0 pointer-events-none">
        <div className="relative pointer-events-auto group">
          <div className="absolute inset-0 bg-gray-100 rounded-lg blur-md opacity-50 group-hover:opacity-80 transition-all duration-300"></div>
          <button className="btn bg-gray-200 hover:bg-gray-200 text-gray-700 border-none rounded-lg shadow-sm hover:shadow hover:scale-105 transition-all duration-300 font-medium relative z-10 p-0 h-10 min-h-0 overflow-hidden">
            <div className="flex items-center justify-center gap-1 px-3 h-full w-[145px]">
              <span className="relative inline-block leading-tight text-center">
                <span className="text-base">Help & FAQ</span>
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gray-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}