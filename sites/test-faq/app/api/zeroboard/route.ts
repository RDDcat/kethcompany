import { NextRequest } from 'next/server';
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

// URL 생성 헬퍼 함수
function buildUrl(updates: Record<string, string | null>, currentParams: Record<string, string>): string {
  const params = new URLSearchParams();
  params.set('id', 'FAQ');
  
  Object.entries(currentParams).forEach(([key, value]) => {
    if (key !== 'id' && value) {
      params.set(key, value);
    }
  });
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });
  
  return `/zeroboard/zboard.php?${params.toString()}`;
}

// HTML 이스케이프
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // 쿼리 파라미터 파싱
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortKey = (searchParams.get('select_arrange') || 'headnum') as SortKey;
  const sortDirection = (searchParams.get('desc') || 'desc') as SortDirection;
  const keyword = searchParams.get('keyword') || '';
  const selectedNo = searchParams.get('no') ? parseInt(searchParams.get('no')!, 10) : null;
  
  // 현재 파라미터 객체
  const currentParams: Record<string, string> = {
    page: page.toString(),
    select_arrange: sortKey,
    desc: sortDirection,
  };
  if (keyword) currentParams.keyword = keyword;

  // 데이터 처리
  let posts: FaqPost[] = [...faqPosts];
  
  if (keyword) {
    posts = searchPosts(posts, keyword);
  }
  
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

  // 페이지네이션 HTML 생성
  const paginationHtml = (() => {
    let html = '';
    
    // 이전 버튼
    if (page === 1) {
      html += `<span class="page-btn disabled">« 이전</span>`;
    } else {
      html += `<a href="${buildUrl({ page: (page - 1).toString() }, currentParams)}" class="page-btn">« 이전</a>`;
    }
    
    // 페이지 번호
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      if (i === page) {
        html += `<span class="page-btn active">${i}</span>`;
      } else {
        html += `<a href="${buildUrl({ page: i.toString() }, currentParams)}" class="page-btn">${i}</a>`;
      }
    }
    
    // 다음 버튼
    if (page === totalPages || totalPages === 0) {
      html += `<span class="page-btn disabled">다음 »</span>`;
    } else {
      html += `<a href="${buildUrl({ page: (page + 1).toString() }, currentParams)}" class="page-btn">다음 »</a>`;
    }
    
    return html;
  })();

  // 상세 페이지 HTML
  const detailHtml = detailPost ? `
    <div class="detail-section">
      <div class="detail-header">
        <div id="post-title" class="post-title">${escapeHtml(detailPost.title)}</div>
        <div class="post-meta">
          <span>작성자: ${escapeHtml(detailPost.author)}</span>
          <span>날짜: ${detailPost.createdAt}</span>
          <span>조회수: ${detailPost.views}</span>
        </div>
      </div>
      <div class="detail-content">
        ${detailPost.content.split('\n').map(line => `<p>${line ? escapeHtml(line) : '<br>'}</p>`).join('')}
      </div>
      <div class="detail-nav">
        ${adjacentPosts.prev ? `<a href="${buildUrl({ no: adjacentPosts.prev.no.toString() }, currentParams)}" class="nav-btn">◀ 이전글: ${escapeHtml(adjacentPosts.prev.title)}</a>` : ''}
        ${adjacentPosts.next ? `<a href="${buildUrl({ no: adjacentPosts.next.no.toString() }, currentParams)}" class="nav-btn">다음글: ${escapeHtml(adjacentPosts.next.title)} ▶</a>` : ''}
      </div>
      <div class="back-to-list">
        <a href="${buildUrl({ no: null }, currentParams)}" class="list-btn">목록으로</a>
      </div>
      <hr class="divider">
    </div>
  ` : '';

  // 테이블 행 HTML
  const rowsHtml = paginatedPosts.map(post => `
    <tr class="row${selectedNo === post.no ? ' highlighted' : ''}">
      <td class="td-no">${post.no}</td>
      <td class="td-title">
        <a href="${buildUrl({ no: post.no.toString() }, currentParams)}">${escapeHtml(post.title)}</a>
      </td>
      <td class="td-author">${escapeHtml(post.author)}</td>
      <td class="td-date">${post.createdAt}</td>
      <td class="td-views">${post.views}</td>
    </tr>
  `).join('');

  // 전체 HTML 생성
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${detailPost ? escapeHtml(detailPost.title) + ' - ' : ''}FAQ - KETHcompany</title>
  <meta name="description" content="${detailPost ? escapeHtml(detailPost.content.substring(0, 150)) : 'KETHcompany FAQ board - 자주 묻는 질문과 답변을 확인하세요.'}">
  <link rel="canonical" href="/zeroboard/zboard.php?id=FAQ${selectedNo ? '&no=' + selectedNo : ''}">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      border-bottom: 2px solid #333;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    #board-title {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    .breadcrumb {
      font-size: 12px;
      color: #888;
      margin-bottom: 10px;
    }
    .breadcrumb a { color: #666; }
    .description {
      font-size: 13px;
      color: #666;
      margin: 0;
    }
    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
    }
    .search-form {
      display: flex;
      gap: 5px;
    }
    .search-input {
      width: 200px;
      padding: 6px 10px;
      border: 1px solid #ccc;
      font-size: 13px;
    }
    .search-btn {
      padding: 6px 15px;
      background: #555;
      color: #fff;
      border: none;
      cursor: pointer;
      font-size: 13px;
    }
    .search-btn:hover { background: #333; }
    .sort-controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .sort-links {
      display: flex;
      gap: 8px;
    }
    .sort-link {
      padding: 6px 10px;
      background: #f5f5f5;
      border: 1px solid #ccc;
      color: #555;
      font-size: 12px;
      text-decoration: none;
    }
    .sort-link:hover { background: #e5e5e5; text-decoration: none; }
    .sort-link.active {
      background: #333;
      color: #fff;
      border-color: #333;
    }
    .direction-btn {
      padding: 6px 10px;
      background: #f5f5f5;
      border: 1px solid #ccc;
      color: #333;
      font-size: 12px;
      text-decoration: none;
    }
    .direction-btn:hover { background: #e5e5e5; text-decoration: none; }
    .search-options {
      font-size: 11px;
      color: #999;
      margin-bottom: 10px;
      display: flex;
      gap: 15px;
    }
    #board-table {
      width: 100%;
      border-collapse: collapse;
      border-top: 1px solid #333;
      margin-bottom: 20px;
    }
    #board-table thead { background: #f7f7f7; }
    #board-table th {
      padding: 10px 8px;
      border-bottom: 1px solid #ddd;
      font-weight: bold;
      font-size: 13px;
      text-align: center;
      color: #333;
    }
    #board-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #eee;
      font-size: 13px;
    }
    .th-no, .td-no { width: 60px; text-align: center; }
    .th-title, .td-title { text-align: left; padding-left: 15px !important; }
    .td-title a { color: #333; }
    .td-title a:hover { color: #0066cc; }
    .th-author, .td-author { width: 100px; text-align: center; }
    .th-date, .td-date { width: 100px; text-align: center; color: #888; }
    .th-views, .td-views { width: 60px; text-align: center; color: #888; }
    .row:hover { background-color: #f9f9f9; }
    .row.highlighted { background-color: #fffde7; }
    .result-info {
      text-align: right;
      font-size: 12px;
      color: #888;
      margin-bottom: 10px;
    }
    .pagination {
      display: flex;
      justify-content: center;
      gap: 5px;
      margin: 20px 0;
    }
    .page-btn {
      display: inline-block;
      padding: 5px 10px;
      border: 1px solid #ddd;
      background: #fff;
      font-size: 12px;
      min-width: 32px;
      text-align: center;
      text-decoration: none;
      color: #333;
    }
    .page-btn:hover { background: #f5f5f5; border-color: #999; text-decoration: none; }
    .page-btn.disabled { color: #ccc; pointer-events: none; }
    .page-btn.active { background: #333; color: #fff; border-color: #333; }
    .help-text {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #888;
    }
    .help-text p { margin: 5px 0; }
    .detail-section {
      margin-bottom: 30px;
      border: 1px solid #ddd;
      background: #fafafa;
    }
    .detail-header {
      padding: 20px;
      border-bottom: 1px solid #ddd;
      background: #fff;
    }
    .post-title {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
      line-height: 1.4;
    }
    .post-meta {
      display: flex;
      gap: 20px;
      font-size: 12px;
      color: #888;
    }
    .detail-content {
      padding: 25px 20px;
      background: #fff;
      min-height: 200px;
      border-bottom: 1px solid #ddd;
    }
    .detail-content p { margin: 0 0 8px 0; line-height: 1.8; }
    .detail-nav {
      display: flex;
      flex-direction: column;
      background: #f7f7f7;
    }
    .nav-btn {
      display: block;
      padding: 12px 20px;
      border-bottom: 1px solid #eee;
      font-size: 13px;
      color: #555;
      text-decoration: none;
    }
    .nav-btn:hover { background: #f0f0f0; color: #0066cc; text-decoration: none; }
    .nav-btn:last-child { border-bottom: none; }
    .back-to-list {
      padding: 15px 20px;
      background: #f7f7f7;
      border-top: 1px solid #ddd;
    }
    .list-btn {
      display: inline-block;
      padding: 8px 20px;
      background: #555;
      color: #fff;
      text-decoration: none;
      font-size: 13px;
    }
    .list-btn:hover { background: #333; text-decoration: none; }
    .divider {
      border: none;
      border-top: 1px solid #ddd;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div id="board-title">FAQ</div>
      <div class="breadcrumb">
        <a href="/">홈</a> &gt; 고객센터 &gt; FAQ
      </div>
      <p class="description">자주 묻는 질문을 확인하세요.</p>
    </div>

    <div id="schema-anchor"></div>

    ${detailHtml}

    <div class="filter-bar">
      <form method="GET" action="/zeroboard/zboard.php" class="search-form">
        <input type="hidden" name="id" value="FAQ">
        <input type="hidden" name="select_arrange" value="${sortKey}">
        <input type="hidden" name="desc" value="${sortDirection}">
        <input type="text" name="keyword" value="${escapeHtml(keyword)}" placeholder="검색어를 입력하세요" class="search-input">
        <button type="submit" class="search-btn">검색</button>
      </form>
      <div class="sort-controls">
        <div class="sort-links">
          <a href="${buildUrl({ select_arrange: 'headnum', page: '1' }, currentParams)}" class="sort-link${sortKey === 'headnum' ? ' active' : ''}">번호순</a>
          <a href="${buildUrl({ select_arrange: 'views', page: '1' }, currentParams)}" class="sort-link${sortKey === 'views' ? ' active' : ''}">조회순</a>
          <a href="${buildUrl({ select_arrange: 'date', page: '1' }, currentParams)}" class="sort-link${sortKey === 'date' ? ' active' : ''}">날짜순</a>
        </div>
        <a href="${buildUrl({ desc: sortDirection === 'asc' ? 'desc' : 'asc' }, currentParams)}" class="direction-btn">
          ${sortDirection === 'desc' ? '▼ 내림차순' : '▲ 오름차순'}
        </a>
      </div>
    </div>

    <div class="search-options">
      <span>검색: 제목+내용</span>
      <span>sn=${searchParams.get('sn') || 'off'}</span>
      <span>ss=${searchParams.get('ss') || 'on'}</span>
      <span>sc=${searchParams.get('sc') || 'on'}</span>
    </div>

    <table id="board-table">
      <thead>
        <tr>
          <th class="th-no">번호</th>
          <th class="th-title">제목</th>
          <th class="th-author">작성자</th>
          <th class="th-date">날짜</th>
          <th class="th-views">조회</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="result-info">
      총 ${posts.length}건 / ${page} 페이지
    </div>

    <div class="pagination">
      ${paginationHtml}
    </div>

    <div class="help-text">
      <p>※ 검색: 제목/내용/제목+내용 검색이 가능합니다.</p>
      <p>※ 원하시는 답변을 찾지 못하셨다면 고객센터(1588-0000)로 문의해주세요.</p>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}






