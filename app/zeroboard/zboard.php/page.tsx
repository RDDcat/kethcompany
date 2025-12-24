import {
  faqPosts,
  sortPosts,
  searchPosts,
  paginatePosts,
  findPostByNo,
  findAdjacentPosts,
  getTotalPages,
  type SortKey,
  type SortDirection,
  type FaqPost
} from '@/src/mock/faq';
import styles from './styles.module.css';

// URL 생성 헬퍼 함수
function buildUrl(updates: Record<string, string | null>, currentParams: Record<string, string>): string {
  const params = new URLSearchParams();
  params.set('id', 'FAQ');
  
  // 현재 파라미터 유지
  Object.entries(currentParams).forEach(([key, value]) => {
    if (key !== 'id' && value) {
      params.set(key, value);
    }
  });
  
  // 업데이트 적용
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });
  
  return `/zeroboard/zboard.php?${params.toString()}`;
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FaqBoardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // 쿼리 파라미터 파싱
  const page = parseInt((params.page as string) || '1', 10);
  const sortKey = ((params.select_arrange as string) || 'headnum') as SortKey;
  const sortDirection = ((params.desc as string) || 'desc') as SortDirection;
  const keyword = (params.keyword as string) || '';
  const selectedNo = params.no ? parseInt(params.no as string, 10) : null;
  
  // 현재 파라미터 객체 생성
  const currentParams: Record<string, string> = {
    page: page.toString(),
    select_arrange: sortKey,
    desc: sortDirection,
  };
  if (keyword) currentParams.keyword = keyword;
  if (params.sn) currentParams.sn = params.sn as string;
  if (params.ss) currentParams.ss = params.ss as string;
  if (params.sc) currentParams.sc = params.sc as string;

  // 데이터 처리
  let posts: FaqPost[] = [...faqPosts];
  
  // 검색
  if (keyword) {
    posts = searchPosts(posts, keyword);
  }
  
  // 정렬
  posts = sortPosts(posts, sortKey, sortDirection);
  
  const totalPages = getTotalPages(posts);
  const paginatedPosts = paginatePosts(posts, page);
  
  // 상세 페이지용 데이터
  let detailPost: FaqPost | undefined;
  let adjacentPosts: { prev?: FaqPost; next?: FaqPost } = {};
  
  if (selectedNo) {
    detailPost = findPostByNo(selectedNo);
    adjacentPosts = findAdjacentPosts(selectedNo, posts);
  }

  // 페이지네이션 생성
  const renderPagination = () => {
    const pages = [];
    
    // 이전 버튼
    const prevPage = Math.max(1, page - 1);
    pages.push(
      page === 1 ? (
        <span key="prev" className={`${styles.pageButton} ${styles.disabled}`}>
          « 이전
        </span>
      ) : (
        <a
          key="prev"
          href={buildUrl({ page: prevPage.toString() }, currentParams)}
          className={styles.pageButton}
        >
          « 이전
        </a>
      )
    );
    
    // 페이지 번호
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        i === page ? (
          <span key={i} className={`${styles.pageButton} ${styles.active}`}>
            {i}
          </span>
        ) : (
          <a
            key={i}
            href={buildUrl({ page: i.toString() }, currentParams)}
            className={styles.pageButton}
          >
            {i}
          </a>
        )
      );
    }
    
    // 다음 버튼
    const nextPage = Math.min(totalPages, page + 1);
    pages.push(
      page === totalPages ? (
        <span key="next" className={`${styles.pageButton} ${styles.disabled}`}>
          다음 »
        </span>
      ) : (
        <a
          key="next"
          href={buildUrl({ page: nextPage.toString() }, currentParams)}
          className={styles.pageButton}
        >
          다음 »
        </a>
      )
    );
    
    return pages;
  };

  return (
    <div className={styles.container}>
      {/* 상단 타이틀 바 */}
      <div className={styles.header}>
        <div id="board-title" className={styles.boardTitle}>FAQ</div>
        <div className={styles.breadcrumb}>
          <a href="/">홈</a> &gt; 고객센터 &gt; FAQ
        </div>
        <p className={styles.description}>자주 묻는 질문을 확인하세요.</p>
      </div>

      {/* JSON-LD 삽입 지점 */}
      <div id="schema-anchor" />

      {/* 상세 페이지 */}
      {detailPost && (
        <div className={styles.detailSection}>
          <div className={styles.detailHeader}>
            <div id="post-title" className={styles.postTitle}>
              {detailPost.title}
            </div>
            <div className={styles.postMeta}>
              <span>작성자: {detailPost.author}</span>
              <span>날짜: {detailPost.createdAt}</span>
              <span>조회수: {detailPost.views}</span>
            </div>
          </div>
          <div className={styles.detailContent}>
            {detailPost.content.split('\n').map((line, idx) => (
              <p key={idx}>{line || <br />}</p>
            ))}
          </div>
          <div className={styles.detailNav}>
            {adjacentPosts.prev && (
              <a
                href={buildUrl({ no: adjacentPosts.prev.no.toString() }, currentParams)}
                className={styles.navButton}
              >
                ◀ 이전글: {adjacentPosts.prev.title}
              </a>
            )}
            {adjacentPosts.next && (
              <a
                href={buildUrl({ no: adjacentPosts.next.no.toString() }, currentParams)}
                className={styles.navButton}
              >
                다음글: {adjacentPosts.next.title} ▶
              </a>
            )}
          </div>
          <div className={styles.backToList}>
            <a href={buildUrl({ no: null }, currentParams)} className={styles.listButton}>
              목록으로
            </a>
          </div>
          <hr className={styles.divider} />
        </div>
      )}

      {/* 검색/필터 바 */}
      <div className={styles.filterBar}>
        {/* 검색 폼 - GET method로 전체 페이지 새로고침 */}
        <form method="GET" action="/zeroboard/zboard.php" className={styles.searchForm}>
          <input type="hidden" name="id" value="FAQ" />
          <input type="hidden" name="select_arrange" value={sortKey} />
          <input type="hidden" name="desc" value={sortDirection} />
          <input
            type="text"
            name="keyword"
            defaultValue={keyword}
            placeholder="검색어를 입력하세요"
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>검색</button>
        </form>
        <div className={styles.sortControls}>
          {/* 정렬 선택 - 각각 링크로 처리 */}
          <div className={styles.sortLinks}>
            <a
              href={buildUrl({ select_arrange: 'headnum', page: '1' }, currentParams)}
              className={`${styles.sortLink} ${sortKey === 'headnum' ? styles.sortActive : ''}`}
            >
              번호순
            </a>
            <a
              href={buildUrl({ select_arrange: 'views', page: '1' }, currentParams)}
              className={`${styles.sortLink} ${sortKey === 'views' ? styles.sortActive : ''}`}
            >
              조회순
            </a>
            <a
              href={buildUrl({ select_arrange: 'date', page: '1' }, currentParams)}
              className={`${styles.sortLink} ${sortKey === 'date' ? styles.sortActive : ''}`}
            >
              날짜순
            </a>
          </div>
          <a
            href={buildUrl({ desc: sortDirection === 'asc' ? 'desc' : 'asc' }, currentParams)}
            className={styles.directionButton}
          >
            {sortDirection === 'desc' ? '▼ 내림차순' : '▲ 오름차순'}
          </a>
        </div>
      </div>

      {/* 검색 옵션 표시 (테스트용) */}
      <div className={styles.searchOptions}>
        <span>검색: 제목+내용</span>
        <span>sn={params.sn || 'off'}</span>
        <span>ss={params.ss || 'on'}</span>
        <span>sc={params.sc || 'on'}</span>
      </div>

      {/* 테이블 */}
      <table id="board-table" className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thNo}>번호</th>
            <th className={styles.thTitle}>제목</th>
            <th className={styles.thAuthor}>작성자</th>
            <th className={styles.thDate}>날짜</th>
            <th className={styles.thViews}>조회</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPosts.map((post) => (
            <tr
              key={post.no}
              className={`${styles.row} ${selectedNo === post.no ? styles.highlighted : ''}`}
            >
              <td className={styles.tdNo}>{post.no}</td>
              <td className={styles.tdTitle}>
                <a href={buildUrl({ no: post.no.toString() }, currentParams)}>
                  {post.title}
                </a>
              </td>
              <td className={styles.tdAuthor}>{post.author}</td>
              <td className={styles.tdDate}>{post.createdAt}</td>
              <td className={styles.tdViews}>{post.views}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 결과 정보 */}
      <div className={styles.resultInfo}>
        총 {posts.length}건 / {page} 페이지
      </div>

      {/* 페이지네이션 */}
      <div className={styles.pagination}>
        {renderPagination()}
      </div>

      {/* 하단 도움말 */}
      <div className={styles.helpText}>
        <p>※ 검색: 제목/내용/제목+내용 검색이 가능합니다.</p>
        <p>※ 원하시는 답변을 찾지 못하셨다면 고객센터(1588-0000)로 문의해주세요.</p>
      </div>
    </div>
  );
}
