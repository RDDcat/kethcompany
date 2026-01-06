'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/', label: '대시보드' },
  { href: '/hosts', label: '호스트 관리' },
  { href: '/pages', label: '페이지 SEO 설정' },
  { href: '/sitemap', label: '사이트맵 크롤링' },
];

const bottomItems = [
  { href: '/settings', label: '설정' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav style={styles.sidebar}>
      <div style={styles.logo}>SEO Admin</div>
      <ul style={styles.nav}>
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                }}
              >
                {isActive && <span style={styles.indicator} />}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      
      {/* 하단 메뉴 */}
      <div style={styles.bottomSection}>
        <ul style={styles.nav}>
          {bottomItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                  }}
                >
                  {isActive && <span style={styles.indicator} />}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 240,
    height: '100vh',
    background: '#1a1a1a',
    borderRight: '1px solid #333',
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    zIndex: 100,
  },
  bottomSection: {
    marginTop: 'auto',
    borderTop: '1px solid #333',
    paddingTop: 12,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: '0 20px 20px',
    borderBottom: '1px solid #333',
    marginBottom: 20,
    color: '#fff',
  },
  nav: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    color: '#a0a0a0',
    textDecoration: 'none',
    transition: 'all 0.2s',
    position: 'relative',
  },
  navLinkActive: {
    color: '#fff',
    background: '#252525',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    background: '#3b82f6',
  },
};
