import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KETHcompany</title>
  <meta name="description" content="KETHcompany - 테스트용 zeroboard 스타일 FAQ 보드">
  <link rel="canonical" href="/">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #fff;
      color: #333;
    }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333;
    }
    .title {
      font-size: 32px;
      margin: 0 0 10px 0;
      color: #333;
    }
    .subtitle {
      color: #666;
      margin: 0;
    }
    .main {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    .card {
      background: #f9f9f9;
      border: 1px solid #ddd;
      padding: 30px;
      text-align: center;
    }
    .card-title {
      margin: 0 0 10px 0;
      font-size: 20px;
    }
    .card-desc {
      color: #666;
      margin: 0 0 20px 0;
    }
    .link-btn {
      display: inline-block;
      padding: 12px 24px;
      background: #333;
      color: #fff;
      text-decoration: none;
      font-size: 14px;
    }
    .link-btn:hover {
      background: #555;
      text-decoration: none;
    }
    .info {
      background: #fff;
      border: 1px solid #ddd;
      padding: 20px 30px;
    }
    .info-title {
      margin: 0 0 15px 0;
      font-size: 16px;
      color: #333;
    }
    .list {
      margin: 0;
      padding: 0 0 0 20px;
    }
    .list li {
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">KETHcompany</h1>
      <p class="subtitle">테스트용 zeroboard 스타일 FAQ 보드</p>
    </header>

    <main class="main">
      <div class="card">
        <h2 class="card-title">FAQ 게시판</h2>
        <p class="card-desc">자주 묻는 질문과 답변을 확인하세요.</p>
        <a href="/zeroboard/zboard.php?id=FAQ" class="link-btn">
          FAQ 바로가기 →
        </a>
      </div>

      <div class="info">
        <h3 class="info-title">테스트 URL 예시</h3>
        <ul class="list">
          <li><a href="/zeroboard/zboard.php?id=FAQ">목록 페이지</a></li>
          <li><a href="/zeroboard/zboard.php?id=FAQ&page=2">2페이지</a></li>
          <li><a href="/zeroboard/zboard.php?id=FAQ&no=43">상세 보기 (no=43)</a></li>
          <li><a href="/zeroboard/zboard.php?id=FAQ&keyword=환불">검색 (환불)</a></li>
          <li><a href="/zeroboard/zboard.php?id=FAQ&select_arrange=views&desc=desc">조회순 정렬</a></li>
        </ul>
      </div>
    </main>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

