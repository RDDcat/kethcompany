import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'SEO Admin - KETHcompany',
  description: 'SEO 설정 관리 어드민',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div style={styles.container}>
          <Sidebar />
          <main style={styles.main}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    padding: 30,
    overflow: 'auto',
  },
};
