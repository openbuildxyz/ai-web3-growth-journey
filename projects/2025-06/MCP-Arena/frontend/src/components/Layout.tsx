import { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout = ({ children, title = 'MCP Arena' }: LayoutProps) => {
  const router = useRouter();
  
  const isActive = (path: string) => {
    return router.pathname === path ? styles.active : '';
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta content="MCP Arena - Upload and manage your MCPs" name="description" />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <Link href="/">MCP Arena</Link>
          </div>
          <nav className={styles.nav}>
            <Link href="/" className={`${styles.navLink} ${isActive('/')}`}>Home</Link>
            <Link href="/upload" className={`${styles.navLink} ${isActive('/upload')}`}>Upload MCP</Link>
            <Link href="/admin" className={`${styles.navLink} ${isActive('/admin')}`}>Admin</Link>
          </nav>
          <div className={styles.walletConnect}>
            <ConnectButton />
          </div>
        </div>
      </header>
      <div className={styles.headerSpacer}></div>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <p>MCP Arena © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Layout;
