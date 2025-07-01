import type { Metadata } from 'next';
import { HeroSection } from './components/HeroSection';
import { HandbookOverview } from './components/HandbookOverview';
import { ContentStructure } from './components/ContentStructure';
import { TargetAudienceAndFAQ } from './components/TargetAudienceAndFAQ';
import { CommunityJoin } from './components/CommunityJoin';
import { Sponsors } from './components/Sponsors';
import { Footer } from './components/Footer';

export const metadata: Metadata = {
  title: 'AI³ Growth Journey - AI+Web3开发者成长计划',
  description: 'OpenBuild与周周黑客松联合发起的亚太区AI+Web3开发者成长计划，每月举办线上Workshop和线下Mini-Hackathon',
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black relative">
      {/* Global background geometric elements - simplified */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Primary large circles - reduced to two */}
        <div className="absolute -left-40 -top-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900 rounded-full opacity-50 blur-xl" />
        <div className="absolute -right-40 -bottom-40 w-[600px] h-[600px] bg-gradient-to-tr from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 rounded-full opacity-50 blur-xl" />

        {/* One accent shape in the middle */}
        <div className="absolute top-1/2 left-20 w-24 h-24 bg-gradient-to-r from-emerald-100 to-teal-200 dark:from-emerald-900 dark:to-teal-800 opacity-60 transform rotate-12" />

        {/* Single horizontal line with enhanced visibility */}
        <div className="absolute top-1/3 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent opacity-70 transform -rotate-3" />
      </div>

      <div className="relative z-10">
        <HeroSection />
        <HandbookOverview />
        <ContentStructure />
        <TargetAudienceAndFAQ />
        <Sponsors />
        <CommunityJoin />
        <Footer />
      </div>
    </div>
  );
}
