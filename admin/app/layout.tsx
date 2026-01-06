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
    minHeight: '100vh',
  },
  main: {
    marginLeft: 240, // 사이드바 너비만큼 여백
    padding: 30,
    minHeight: '100vh',
  },
};
