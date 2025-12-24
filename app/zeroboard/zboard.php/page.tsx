'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, Suspense } from 'react';
import {
  faqPosts,
  sortPosts,
  searchPosts,
  paginatePosts,
  findPostByNo,
  findAdjacentPosts,
  getTotalPages,
  POSTS_PER_PAGE,
  type SortKey,
  type SortDirection,
  type FaqPost
} from '@/src/mock/faq';
import styles from './styles.module.css';

function FaqBoardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 쿼리 파라미터 파싱
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortKey = (searchParams.get('select_arrange') || 'headnum') as SortKey;
  const sortDirection = (searchParams.get('desc') || 'desc') as SortDirection;
  const keyword = searchParams.get('keyword') || '';
  const selectedNo = searchParams.get('no') ? parseInt(searchParams.get('no')!, 10) : null;

  // 데이터 처리
  const processedData = useMemo(() => {
    let posts = [...faqPosts];
    
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
    
    return {
      posts: paginatedPosts,
      allPosts: posts,
      totalPages,
      totalCount: posts.length,
      detailPost,
      adjacentPosts
    };
  }, [page, sortKey, sortDirection, keyword, selectedNo]);

  // URL 쿼리 업데이트 함수
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', 'FAQ');
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    router.push(`/zeroboard/zboard.php?${params.toString()}`);
  };

  // 게시물 클릭
  const handlePostClick = (no: number) => {
    updateQuery({ no: no.toString() });
  };

  // 검색 처리
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchKeyword = formData.get('keyword') as string;
    updateQuery({ keyword: searchKeyword || null, page: '1', no: null });
  };

  // 정렬 변경
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQuery({ select_arrange: e.target.value, page: '1' });
  };

  // 정렬 방향 변경
  const handleDirectionToggle = () => {
    updateQuery({ desc: sortDirection === 'asc' ? 'desc' : 'asc' });
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    updateQuery({ page: newPage.toString() });
  };

  // 목록으로 돌아가기
  const handleBackToList = () => {
    updateQuery({ no: null });
  };

  // 페이지네이션 렌더링
  const renderPagination = () => {
    const pages = [];
    const { totalPages } = processedData;
    
    // 이전 버튼
    pages.push(
      <button
        key="prev"
        className={styles.pageButton}
        onClick={() => handlePageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        « 이전
      </button>
    );
    
    // 페이지 번호
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.pageButton} ${i === page ? styles.active : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    // 다음 버튼
    pages.push(
      <button
        key="next"
        className={styles.pageButton}
        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        다음 »
      </button>
    );
    
    return pages;
  };

  return (
    <div className={styles.container}>
      {/* 상단 타이틀 바 */}
      <div className={styles.header}>
        <div id="board-title" className={styles.boardTitle}>FAQ</div>
        <div className={styles.breadcrumb}>
          홈 &gt; 고객센터 &gt; FAQ
        </div>
        <p className={styles.description}>자주 묻는 질문을 확인하세요.</p>
      </div>

      {/* JSON-LD 삽입 지점 */}
      <div id="schema-anchor" />

      {/* 상세 페이지 */}
      {processedData.detailPost && (
        <div className={styles.detailSection}>
          <div className={styles.detailHeader}>
            <div id="post-title" className={styles.postTitle}>
              {processedData.detailPost.title}
            </div>
            <div className={styles.postMeta}>
              <span>작성자: {processedData.detailPost.author}</span>
              <span>날짜: {processedData.detailPost.createdAt}</span>
              <span>조회수: {processedData.detailPost.views}</span>
            </div>
          </div>
          <div className={styles.detailContent}>
            {processedData.detailPost.content.split('\n').map((line, idx) => (
              <p key={idx}>{line || <br />}</p>
            ))}
          </div>
          <div className={styles.detailNav}>
            {processedData.adjacentPosts.prev && (
              <button
                className={styles.navButton}
                onClick={() => handlePostClick(processedData.adjacentPosts.prev!.no)}
              >
                ◀ 이전글: {processedData.adjacentPosts.prev.title}
              </button>
            )}
            {processedData.adjacentPosts.next && (
              <button
                className={styles.navButton}
                onClick={() => handlePostClick(processedData.adjacentPosts.next!.no)}
              >
                다음글: {processedData.adjacentPosts.next.title} ▶
              </button>
            )}
          </div>
          <div className={styles.backToList}>
            <button onClick={handleBackToList} className={styles.listButton}>
              목록으로
            </button>
          </div>
          <hr className={styles.divider} />
        </div>
      )}

      {/* 검색/필터 바 */}
      <div className={styles.filterBar}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
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
          <select
            value={sortKey}
            onChange={handleSortChange}
            className={styles.sortSelect}
          >
            <option value="headnum">번호순</option>
            <option value="views">조회순</option>
            <option value="date">날짜순</option>
          </select>
          <button
            onClick={handleDirectionToggle}
            className={styles.directionButton}
          >
            {sortDirection === 'desc' ? '▼ 내림차순' : '▲ 오름차순'}
          </button>
        </div>
      </div>

      {/* 검색 옵션 표시 (테스트용) */}
      <div className={styles.searchOptions}>
        <span>검색: 제목+내용</span>
        <span>sn={searchParams.get('sn') || 'off'}</span>
        <span>ss={searchParams.get('ss') || 'on'}</span>
        <span>sc={searchParams.get('sc') || 'on'}</span>
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
          {processedData.posts.map((post) => (
            <tr
              key={post.no}
              className={`${styles.row} ${selectedNo === post.no ? styles.highlighted : ''}`}
              onClick={() => handlePostClick(post.no)}
            >
              <td className={styles.tdNo}>{post.no}</td>
              <td className={styles.tdTitle}>{post.title}</td>
              <td className={styles.tdAuthor}>{post.author}</td>
              <td className={styles.tdDate}>{post.createdAt}</td>
              <td className={styles.tdViews}>{post.views}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 결과 정보 */}
      <div className={styles.resultInfo}>
        총 {processedData.totalCount}건 / {page} 페이지
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

export default function FaqBoardPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>로딩 중...</div>}>
      <FaqBoardContent />
    </Suspense>
  );
}

