import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)',
      },
    });

    let html = await res.text();

    // 요소 선택 스크립트 주입
    const selectorScript = `
<script>
(function() {
  let selectedElement = null;
  let highlightOverlay = null;
  let selectorMode = false;

  // 메시지 수신 (부모 창에서 선택 모드 토글)
  window.addEventListener('message', function(e) {
    if (e.data.type === 'toggleSelectorMode') {
      selectorMode = e.data.enabled;
      document.body.style.cursor = selectorMode ? 'crosshair' : 'default';
      if (!selectorMode && highlightOverlay) {
        highlightOverlay.remove();
        highlightOverlay = null;
      }
    }
  });

  // 하이라이트 오버레이 생성
  function createHighlight() {
    if (!highlightOverlay) {
      highlightOverlay = document.createElement('div');
      highlightOverlay.style.cssText = 'position:fixed;pointer-events:none;background:rgba(59,130,246,0.3);border:2px solid #3b82f6;z-index:999999;transition:all 0.1s;';
      document.body.appendChild(highlightOverlay);
    }
    return highlightOverlay;
  }

  // CSS selector 생성
  function getSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.trim().split(/\\s+/).filter(c => c).slice(0, 2);
      if (classes.length) return el.tagName.toLowerCase() + '.' + classes.join('.');
    }
    return el.tagName.toLowerCase();
  }

  // 마우스 오버
  document.addEventListener('mouseover', function(e) {
    if (!selectorMode) return;
    const el = e.target;
    const rect = el.getBoundingClientRect();
    const overlay = createHighlight();
    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
  });

  // 클릭
  document.addEventListener('click', function(e) {
    if (!selectorMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    const selector = getSelector(e.target);
    const text = e.target.textContent?.trim().substring(0, 50) || '';
    
    // 부모 창에 선택된 selector 전송
    window.parent.postMessage({
      type: 'selectorSelected',
      selector: selector,
      text: text,
    }, '*');
  }, true);
})();
</script>
`;

    // </head> 앞에 스크립트 주입
    html = html.replace('</head>', selectorScript + '</head>');

    // base 태그 추가 (상대 경로 리소스 로드용)
    const baseUrl = new URL(url);
    const baseTag = `<base href="${baseUrl.origin}">`;
    html = html.replace('<head>', '<head>' + baseTag);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}





