'use client';

import { useSearchParams } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import UserRebalancer from '@/lib/models/user';
import { useEffect, useState, Suspense } from 'react';

type AdminStats = {
  totalUsers: number;
  mauCount: number;
  dauCount: number;
};

function AdminContent() {
  const searchParams = useSearchParams();
  const team = searchParams.get('team');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (team !== 'zenith') {
        setError('Unauthorized. Invalid team.');
        return;
      }

      try {
        await dbConnect();

        const now = new Date();
        const today = new Date(now);
        today.setUTCHours(0, 0, 0, 0);

        const last30Days = new Date();
        last30Days.setDate(now.getDate() - 30);

        const [dauCount, mauCount, totalUsers] = await Promise.all([
          UserRebalancer.countDocuments({ lastActiveAt: { $gte: today } }),
          UserRebalancer.countDocuments({ lastActiveAt: { $gte: last30Days } }),
          UserRebalancer.countDocuments({}),
        ]);

        setStats({ dauCount, mauCount, totalUsers });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
        setError('Failed to load data.');
      }
    };

    fetchStats();
  }, [team]);

  if (error) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: 'red', fontSize: '1.5rem' }}>
        ❌ {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', fontSize: '1.5rem' }}>
        ⏳ Loading admin stats...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '3rem',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        background: '#f4f6f8',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>📊 Admin Dashboard</h1>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        👥 <strong>Total Users:</strong> {stats.totalUsers}
      </div>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        📈 <strong>Monthly Active Users (MAU):</strong> {stats.mauCount}
      </div>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        📅 <strong>Daily Active Users (DAU):</strong> {stats.dauCount}
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <Suspense fallback={
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', fontSize: '1.5rem' }}>
        ⏳ Loading...
      </div>
    }>
      <AdminContent />
    </Suspense>
  );
}
