import Link from "next/link";

export default function Home() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>KETHcompany</h1>
        <p style={styles.subtitle}>테스트용 zeroboard 스타일 FAQ 보드</p>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>FAQ 게시판</h2>
          <p style={styles.cardDesc}>자주 묻는 질문과 답변을 확인하세요.</p>
          <Link href="/zeroboard/zboard.php?id=FAQ" style={styles.link}>
            FAQ 바로가기 →
          </Link>
        </div>

        <div style={styles.info}>
          <h3 style={styles.infoTitle}>테스트 URL 예시</h3>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <Link href="/zeroboard/zboard.php?id=FAQ" style={styles.infoLink}>
                목록 페이지
              </Link>
            </li>
            <li style={styles.listItem}>
              <Link href="/zeroboard/zboard.php?id=FAQ&page=2" style={styles.infoLink}>
                2페이지
              </Link>
            </li>
            <li style={styles.listItem}>
              <Link href="/zeroboard/zboard.php?id=FAQ&no=43" style={styles.infoLink}>
                상세 보기 (no=43)
              </Link>
            </li>
            <li style={styles.listItem}>
              <Link href="/zeroboard/zboard.php?id=FAQ&keyword=환불" style={styles.infoLink}>
                검색 (환불)
              </Link>
            </li>
            <li style={styles.listItem}>
              <Link href="/zeroboard/zboard.php?id=FAQ&select_arrange=views&desc=desc" style={styles.infoLink}>
                조회순 정렬
              </Link>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: "'Malgun Gothic', '맑은 고딕', Arial, sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottom: '2px solid #333',
  },
  title: {
    fontSize: 32,
    margin: '0 0 10px 0',
    color: '#333',
  },
  subtitle: {
    color: '#666',
    margin: 0,
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: 30,
  },
  card: {
    background: '#f9f9f9',
    border: '1px solid #ddd',
    padding: 30,
    textAlign: 'center',
  },
  cardTitle: {
    margin: '0 0 10px 0',
    fontSize: 20,
  },
  cardDesc: {
    color: '#666',
    margin: '0 0 20px 0',
  },
  link: {
    display: 'inline-block',
    padding: '12px 24px',
    background: '#333',
    color: '#fff',
    textDecoration: 'none',
    fontSize: 14,
  },
  info: {
    background: '#fff',
    border: '1px solid #ddd',
    padding: '20px 30px',
  },
  infoTitle: {
    margin: '0 0 15px 0',
    fontSize: 16,
    color: '#333',
  },
  list: {
    margin: 0,
    padding: '0 0 0 20px',
  },
  listItem: {
    margin: '8px 0',
  },
  infoLink: {
    color: '#0066cc',
    textDecoration: 'none',
  },
};
