import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Oracle-X | AI-Powered Trading Risk Assessment',
  description: '在交易决策前获得多维度 AI 风险分析',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
