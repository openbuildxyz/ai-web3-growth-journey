import React from 'react';
import HeroSection from '../components/home/HeroSection';
import DatasetGrid from '../components/home/DatasetGrid';
import ExpertRanking from '../components/home/ExpertRanking';
import AuditMechanism from '../components/home/AuditMechanism';
import Stats from '../components/home/Stats';

const HomePage = () => {
  return (
    <div className="space-y-20">
      <HeroSection />
      <Stats />
      <DatasetGrid />
      <ExpertRanking />
      <AuditMechanism />
    </div>
  );
};

export default HomePage;