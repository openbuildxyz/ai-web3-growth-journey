'use client';

import Layout from '@/components/Layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="!text-xl [&_*]:text-xl">
      <Layout>{children}</Layout>
    </div>
  );
}
