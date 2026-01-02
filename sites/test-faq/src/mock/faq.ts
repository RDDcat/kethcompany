export type FaqPost = {
  no: number;
  title: string;
  author: string;
  createdAt: string; // YYYY-MM-DD
  views: number;
  content: string;
};

export const faqPosts: FaqPost[] = [
  {
    no: 43,
    title: '[공지] 서비스 이용약관 변경 안내',
    author: '관리자',
    createdAt: '2024-12-20',
    views: 1523,
    content: `안녕하세요, KETHcompany입니다.

2025년 1월 1일부터 서비스 이용약관이 변경됩니다.

## 주요 변경 사항
- 개인정보 처리방침 강화
- 서비스 이용 제한 정책 명확화
- 환불 규정 세부 조항 추가

변경된 약관은 아래 링크에서 확인하실 수 있습니다.

문의사항은 고객센터로 연락 바랍니다.
감사합니다.`
  },
  {
    no: 42,
    title: '회원가입은 어떻게 하나요?',
    author: '고객지원',
    createdAt: '2024-12-18',
    views: 892,
    content: `회원가입 방법을 안내드립니다.

1. 홈페이지 우측 상단의 '회원가입' 버튼 클릭
2. 이메일 주소 입력 및 인증
3. 비밀번호 설정
4. 필수 정보 입력 (이름, 연락처)
5. 이용약관 동의
6. 가입 완료

※ SNS 계정(구글, 카카오, 네이버)으로도 간편 가입이 가능합니다.`
  },
  {
    no: 41,
    title: '비밀번호를 잊어버렸어요',
    author: '고객지원',
    createdAt: '2024-12-17',
    views: 756,
    content: `비밀번호 찾기 방법입니다.

1. 로그인 페이지에서 '비밀번호 찾기' 클릭
2. 가입 시 등록한 이메일 입력
3. 발송된 인증 메일 확인
4. 새 비밀번호 설정

※ 인증 메일이 오지 않는 경우 스팸함을 확인해주세요.
※ 24시간 내 3회 이상 실패 시 일시적으로 차단될 수 있습니다.`
  },
  {
    no: 40,
    title: '결제 수단 변경은 어디서 하나요?',
    author: '결제담당',
    createdAt: '2024-12-15',
    views: 445,
    content: `결제 수단 변경 방법을 안내드립니다.

마이페이지 > 결제관리 > 결제 수단 변경

지원되는 결제 수단:
- 신용카드/체크카드
- 계좌이체
- 카카오페이
- 네이버페이
- 토스

기존 정기결제 수단 변경 시 다음 결제일부터 적용됩니다.`
  },
  {
    no: 39,
    title: '환불 정책이 궁금해요',
    author: '결제담당',
    createdAt: '2024-12-14',
    views: 1102,
    content: `환불 정책 안내입니다.

■ 전액 환불
- 결제 후 7일 이내
- 서비스 미이용 시

■ 부분 환불
- 결제 후 7일 초과~30일 이내
- 이용 일수 차감 후 환불

■ 환불 불가
- 결제 후 30일 초과
- 이벤트/프로모션 결제 상품

환불 처리 기간: 영업일 기준 3~5일`
  },
  {
    no: 38,
    title: '모바일 앱 다운로드 방법',
    author: '고객지원',
    createdAt: '2024-12-12',
    views: 623,
    content: `KETHcompany 앱 다운로드 안내

■ Android
Google Play 스토어에서 "KETHcompany" 검색

■ iOS
App Store에서 "KETHcompany" 검색

※ 최소 요구 사양
- Android 8.0 이상
- iOS 13.0 이상

앱 설치 후 웹과 동일한 계정으로 로그인하시면 됩니다.`
  },
  {
    no: 37,
    title: '알림 설정은 어떻게 변경하나요?',
    author: '고객지원',
    createdAt: '2024-12-11',
    views: 234,
    content: `알림 설정 변경 방법입니다.

마이페이지 > 설정 > 알림 설정

변경 가능한 알림:
- 이메일 알림
- 푸시 알림
- SMS 알림
- 마케팅 수신 동의

각 항목별로 ON/OFF 설정이 가능합니다.`
  },
  {
    no: 36,
    title: '탈퇴 후 재가입이 가능한가요?',
    author: '고객지원',
    createdAt: '2024-12-10',
    views: 567,
    content: `탈퇴 후 재가입 관련 안내입니다.

회원 탈퇴 후 30일간 동일한 이메일로 재가입이 제한됩니다.

■ 탈퇴 시 삭제되는 정보
- 개인정보
- 이용 기록
- 포인트/쿠폰

■ 보존되는 정보 (법적 의무)
- 결제 기록 (5년)
- 서비스 이용 기록 (3개월)

신중하게 결정해주세요.`
  },
  {
    no: 35,
    title: '포인트 적립 기준이 뭔가요?',
    author: '결제담당',
    createdAt: '2024-12-08',
    views: 789,
    content: `포인트 적립 기준 안내입니다.

■ 기본 적립
- 결제 금액의 1%

■ 추가 적립
- 리뷰 작성: 50P
- 출석 체크: 10P/일
- 친구 초대: 500P

■ 등급별 추가 적립
- Silver: +0.5%
- Gold: +1%
- VIP: +2%

※ 포인트 유효기간: 적립일로부터 1년`
  },
  {
    no: 34,
    title: '등급 산정 기준은?',
    author: '고객지원',
    createdAt: '2024-12-07',
    views: 445,
    content: `회원 등급 산정 기준입니다.

■ 등급별 조건 (최근 6개월 기준)
- Bronze: 가입 시 기본
- Silver: 누적 결제 10만원 이상
- Gold: 누적 결제 50만원 이상
- VIP: 누적 결제 100만원 이상

■ 등급 갱신
- 매월 1일 자동 갱신
- 등급 하락 유예 기간 3개월

문의: 고객센터`
  },
  {
    no: 33,
    title: '쿠폰 사용 방법',
    author: '결제담당',
    createdAt: '2024-12-05',
    views: 678,
    content: `쿠폰 사용 방법 안내입니다.

1. 결제 페이지 진입
2. '쿠폰 사용' 클릭
3. 보유 쿠폰 선택 또는 쿠폰 코드 입력
4. '적용' 버튼 클릭

※ 주의사항
- 쿠폰은 중복 사용 불가
- 최소 결제 금액 조건 확인
- 유효기간 확인`
  },
  {
    no: 32,
    title: '고객센터 운영시간',
    author: '관리자',
    createdAt: '2024-12-04',
    views: 1234,
    content: `고객센터 운영시간 안내입니다.

■ 전화 상담
- 평일: 09:00 ~ 18:00
- 점심시간: 12:00 ~ 13:00
- 주말/공휴일 휴무

■ 채팅 상담
- 평일: 09:00 ~ 22:00
- 주말: 10:00 ~ 18:00

■ 이메일 문의
- 24시간 접수 가능
- 답변: 영업일 기준 1~2일

연락처: 1588-0000`
  },
  {
    no: 31,
    title: '서비스 점검 일정 안내',
    author: '관리자',
    createdAt: '2024-12-03',
    views: 345,
    content: `정기 서비스 점검 안내입니다.

■ 점검 일정
- 매주 화요일 02:00 ~ 06:00

■ 점검 중 제한 사항
- 로그인 불가
- 결제 불가
- 일부 페이지 접속 제한

긴급 점검 시 별도 공지 예정입니다.
이용에 참고 부탁드립니다.`
  },
  {
    no: 30,
    title: '개인정보 변경은 어디서?',
    author: '고객지원',
    createdAt: '2024-12-02',
    views: 456,
    content: `개인정보 변경 방법입니다.

마이페이지 > 회원정보 > 정보 수정

변경 가능 항목:
- 비밀번호
- 연락처
- 주소
- 프로필 이미지

변경 불가 항목:
- 이메일 (고객센터 문의 필요)
- 이름 (실명 인증 후 변경 가능)`
  },
  {
    no: 29,
    title: '프리미엄 서비스 혜택',
    author: '마케팅',
    createdAt: '2024-12-01',
    views: 890,
    content: `프리미엄 서비스 혜택 안내입니다.

■ 프리미엄 전용 혜택
- 광고 제거
- 우선 고객 지원
- 전용 콘텐츠 이용
- 포인트 2배 적립
- 월 1회 무료 쿠폰 지급

■ 구독 요금
- 월 9,900원
- 연 99,000원 (17% 할인)

7일 무료 체험 가능!`
  },
  {
    no: 28,
    title: '계정 보안 설정 방법',
    author: '보안담당',
    createdAt: '2024-11-30',
    views: 567,
    content: `계정 보안 강화 방법입니다.

■ 2단계 인증 설정
마이페이지 > 보안 > 2단계 인증

지원 방식:
- SMS 인증
- 이메일 인증
- OTP 앱 (Google Authenticator)

■ 로그인 기록 확인
마이페이지 > 보안 > 로그인 기록

의심스러운 접속 발견 시 즉시 비밀번호를 변경해주세요.`
  },
  {
    no: 27,
    title: '이벤트 당첨자 발표는 언제?',
    author: '마케팅',
    createdAt: '2024-11-28',
    views: 234,
    content: `이벤트 당첨자 발표 안내입니다.

■ 발표 일정
- 이벤트 종료 후 7일 이내
- 공지사항에서 확인 가능

■ 당첨 알림
- 등록된 이메일로 개별 연락
- SMS 알림 (선택 동의자)

■ 경품 수령
- 당첨 발표 후 14일 이내 정보 입력
- 미입력 시 당첨 취소`
  },
  {
    no: 26,
    title: '데이터 백업/복원 방법',
    author: '기술지원',
    createdAt: '2024-11-27',
    views: 345,
    content: `데이터 백업 및 복원 방법입니다.

■ 백업 방법
마이페이지 > 설정 > 데이터 관리 > 백업

■ 복원 방법
마이페이지 > 설정 > 데이터 관리 > 복원

※ 주의사항
- 백업 파일은 30일간 보관
- 복원 시 현재 데이터 덮어쓰기
- 복원 전 현재 데이터 백업 권장`
  },
  {
    no: 25,
    title: '친구 초대 이벤트',
    author: '마케팅',
    createdAt: '2024-11-25',
    views: 1567,
    content: `친구 초대 이벤트 안내입니다!

■ 혜택
- 초대자: 500P
- 피초대자: 1000P + 첫 결제 10% 할인 쿠폰

■ 참여 방법
1. 마이페이지 > 친구 초대
2. 초대 링크 복사
3. 친구에게 공유
4. 친구 가입 완료 시 자동 적립

※ 초대 인원 제한 없음!`
  },
  {
    no: 24,
    title: '앱 오류 신고 방법',
    author: '기술지원',
    createdAt: '2024-11-24',
    views: 123,
    content: `앱 오류 신고 방법입니다.

■ 신고 방법
앱 내 설정 > 고객센터 > 오류 신고

■ 필수 정보
- 기기 정보 (자동 수집)
- 앱 버전
- 오류 발생 상황 설명
- 스크린샷 (선택)

■ 처리 절차
1. 접수 확인 (1일 이내)
2. 원인 분석 (3~5일)
3. 수정 후 업데이트 공지`
  },
  {
    no: 23,
    title: '정기 결제 해지 방법',
    author: '결제담당',
    createdAt: '2024-11-22',
    views: 789,
    content: `정기 결제(구독) 해지 방법입니다.

마이페이지 > 결제관리 > 구독 관리 > 해지

■ 해지 시 유의사항
- 다음 결제일 전까지 서비스 이용 가능
- 해지 후에도 잔여 기간 만료까지 혜택 유지
- 재구독 시 혜택 초기화

문의: 고객센터 1588-0000`
  },
  {
    no: 22,
    title: '다국어 지원 안내',
    author: '고객지원',
    createdAt: '2024-11-20',
    views: 234,
    content: `다국어 지원 안내입니다.

■ 지원 언어
- 한국어 (기본)
- English
- 日本語
- 中文(简体)

■ 언어 변경 방법
앱/웹 하단 > 언어 설정 아이콘

※ 일부 콘텐츠는 한국어만 제공될 수 있습니다.`
  },
  {
    no: 21,
    title: '제휴/협력 문의',
    author: '관리자',
    createdAt: '2024-11-18',
    views: 456,
    content: `제휴 및 협력 문의 안내입니다.

■ 제휴 유형
- 서비스 제휴
- 마케팅 제휴
- 기술 협력
- 투자 문의

■ 문의 방법
이메일: partnership@kethcompany.com

담당자 검토 후 영업일 기준 3~5일 내 회신드립니다.`
  },
  {
    no: 20,
    title: '콘텐츠 저작권 안내',
    author: '법무담당',
    createdAt: '2024-11-15',
    views: 345,
    content: `콘텐츠 저작권 안내입니다.

■ 저작권 귀속
본 서비스의 모든 콘텐츠는 KETHcompany에 귀속됩니다.

■ 이용 제한
- 무단 복제, 배포 금지
- 상업적 이용 금지
- 2차 창작물 제작 시 사전 허가 필요

■ 저작권 침해 신고
legal@kethcompany.com`
  },
  {
    no: 19,
    title: '세금계산서 발급 방법',
    author: '결제담당',
    createdAt: '2024-11-13',
    views: 678,
    content: `세금계산서 발급 안내입니다.

■ 발급 조건
- 사업자 회원만 가능
- 결제 완료 후 신청

■ 신청 방법
마이페이지 > 결제관리 > 세금계산서 신청

■ 필요 정보
- 사업자등록번호
- 상호명
- 대표자명
- 사업자 이메일

발급 기간: 신청 후 영업일 기준 1~2일`
  },
  {
    no: 18,
    title: '현금영수증 발급 방법',
    author: '결제담당',
    createdAt: '2024-11-11',
    views: 456,
    content: `현금영수증 발급 안내입니다.

■ 자동 발급 설정
마이페이지 > 결제관리 > 현금영수증 설정

■ 발급 유형
- 소득공제용 (개인)
- 지출증빙용 (사업자)

■ 필요 정보
- 휴대폰 번호 또는
- 현금영수증 카드번호 또는
- 사업자등록번호

기존 결제건 발급: 고객센터 문의`
  },
  {
    no: 17,
    title: '배송 조회 방법',
    author: '고객지원',
    createdAt: '2024-11-09',
    views: 567,
    content: `배송 조회 방법 안내입니다.

■ 조회 경로
마이페이지 > 주문내역 > 배송조회

■ 배송 상태
- 상품준비중
- 배송중
- 배송완료

■ 배송 기간
- 일반배송: 2~3일
- 특급배송: 1~2일

※ 도서산간 지역은 1~2일 추가 소요`
  },
  {
    no: 16,
    title: '교환/반품 신청 방법',
    author: '고객지원',
    createdAt: '2024-11-07',
    views: 890,
    content: `교환/반품 신청 방법입니다.

■ 신청 경로
마이페이지 > 주문내역 > 교환/반품 신청

■ 신청 기간
- 수령 후 7일 이내

■ 교환/반품 불가 사유
- 사용 흔적이 있는 경우
- 구성품 누락/훼손
- 신청 기간 초과

처리 기간: 수거 후 영업일 기준 3~5일`
  },
  {
    no: 15,
    title: 'API 연동 문의',
    author: '기술지원',
    createdAt: '2024-11-05',
    views: 234,
    content: `API 연동 문의 안내입니다.

■ API 문서
https://api.kethcompany.com/docs

■ API 키 발급
개발자센터 > API 관리 > 키 발급

■ 지원 API
- 인증 API
- 결제 API
- 데이터 조회 API

기술 문의: dev-support@kethcompany.com`
  },
  {
    no: 14,
    title: '접근성 지원 안내',
    author: '고객지원',
    createdAt: '2024-11-03',
    views: 123,
    content: `웹 접근성 지원 안내입니다.

■ 지원 기능
- 화면 낭독기 호환
- 키보드 네비게이션
- 고대비 모드
- 텍스트 크기 조절

■ 설정 방법
하단 > 접근성 설정

지속적으로 접근성을 개선하고 있습니다.
불편사항은 고객센터로 알려주세요.`
  },
  {
    no: 13,
    title: '브라우저 호환성 안내',
    author: '기술지원',
    createdAt: '2024-11-01',
    views: 345,
    content: `지원 브라우저 안내입니다.

■ 권장 브라우저
- Chrome (최신 버전)
- Safari (최신 버전)
- Firefox (최신 버전)
- Edge (최신 버전)

■ 미지원 브라우저
- Internet Explorer 전 버전

최적의 이용을 위해 최신 버전 브라우저를 사용해주세요.`
  },
  {
    no: 12,
    title: '캐시/쿠키 삭제 방법',
    author: '기술지원',
    createdAt: '2024-10-30',
    views: 567,
    content: `브라우저 캐시/쿠키 삭제 방법입니다.

■ Chrome
설정 > 개인정보 및 보안 > 인터넷 사용 기록 삭제

■ Safari
환경설정 > 개인 정보 보호 > 웹사이트 데이터 관리

■ Firefox
설정 > 개인 정보 및 보안 > 쿠키 및 사이트 데이터

페이지 오류 발생 시 캐시 삭제 후 재시도해주세요.`
  },
  {
    no: 11,
    title: '북마크/즐겨찾기 기능',
    author: '고객지원',
    createdAt: '2024-10-28',
    views: 234,
    content: `북마크/즐겨찾기 기능 안내입니다.

■ 저장 방법
콘텐츠 상세 페이지 > 북마크 아이콘 클릭

■ 확인 방법
마이페이지 > 북마크

■ 폴더 관리
- 폴더 생성/삭제 가능
- 최대 20개 폴더
- 폴더당 100개 항목 저장 가능`
  },
  {
    no: 10,
    title: '알림 미수신 해결 방법',
    author: '기술지원',
    createdAt: '2024-10-25',
    views: 456,
    content: `알림 미수신 해결 방법입니다.

■ 확인 사항
1. 앱 알림 설정 확인
2. 기기 알림 권한 확인
3. 방해 금지 모드 해제
4. 절전 모드 해제

■ 앱 재설치
위 방법으로 해결되지 않을 경우
앱 삭제 후 재설치를 권장합니다.

지속적 문제 시 고객센터 문의`
  },
  {
    no: 9,
    title: '다크 모드 설정 방법',
    author: '고객지원',
    createdAt: '2024-10-23',
    views: 789,
    content: `다크 모드 설정 방법입니다.

■ 설정 경로
앱: 설정 > 디스플레이 > 다크 모드
웹: 우측 상단 테마 아이콘

■ 옵션
- 라이트 모드
- 다크 모드
- 시스템 설정 따르기

다크 모드는 눈의 피로를 줄여줍니다.`
  },
  {
    no: 8,
    title: '기프트 카드 사용 방법',
    author: '결제담당',
    createdAt: '2024-10-20',
    views: 345,
    content: `기프트 카드 사용 방법입니다.

■ 등록 방법
마이페이지 > 결제관리 > 기프트 카드 등록

■ 등록 정보
- 카드 번호 (16자리)
- PIN 번호 (4자리)

■ 사용 방법
결제 시 기프트 카드 잔액 자동 차감

※ 잔액 부족 시 다른 결제 수단과 병용 가능`
  },
  {
    no: 7,
    title: '프로필 사진 변경 방법',
    author: '고객지원',
    createdAt: '2024-10-18',
    views: 234,
    content: `프로필 사진 변경 방법입니다.

■ 변경 경로
마이페이지 > 프로필 > 사진 변경

■ 이미지 규격
- 형식: JPG, PNG
- 크기: 최대 5MB
- 권장 해상도: 200x200px 이상

■ 기본 이미지
삭제 시 기본 아바타로 설정됩니다.`
  },
  {
    no: 6,
    title: '닉네임 변경 안내',
    author: '고객지원',
    createdAt: '2024-10-15',
    views: 456,
    content: `닉네임 변경 안내입니다.

■ 변경 경로
마이페이지 > 프로필 > 닉네임 변경

■ 변경 규칙
- 2~10자 이내
- 한글, 영문, 숫자 가능
- 특수문자 불가
- 30일에 1회 변경 가능

※ 부적절한 닉네임은 관리자에 의해 변경될 수 있습니다.`
  },
  {
    no: 5,
    title: '문의 내역 확인 방법',
    author: '고객지원',
    createdAt: '2024-10-12',
    views: 123,
    content: `문의 내역 확인 방법입니다.

■ 확인 경로
마이페이지 > 고객센터 > 내 문의 내역

■ 조회 가능 항목
- 문의 일시
- 문의 유형
- 처리 상태
- 답변 내용

문의 후 영업일 기준 1~2일 내 답변 드립니다.`
  },
  {
    no: 4,
    title: '리뷰 작성 가이드',
    author: '고객지원',
    createdAt: '2024-10-10',
    views: 567,
    content: `리뷰 작성 가이드입니다.

■ 작성 조건
- 구매/이용 확정 후 작성 가능
- 구매일로부터 30일 이내

■ 작성 방법
마이페이지 > 주문내역 > 리뷰 작성

■ 혜택
- 텍스트 리뷰: 30P
- 포토 리뷰: 50P

※ 부적절한 리뷰는 삭제될 수 있습니다.`
  },
  {
    no: 3,
    title: '서비스 장애 대응 안내',
    author: '기술지원',
    createdAt: '2024-10-08',
    views: 890,
    content: `서비스 장애 대응 안내입니다.

■ 장애 인지
- 실시간 모니터링 시스템 운영
- 고객 신고 접수

■ 대응 프로세스
1. 장애 인지 및 원인 파악
2. 긴급 복구 조치
3. 공지사항 게시
4. 사후 분석 및 재발 방지

장애 발생 시 최대한 신속하게 복구하겠습니다.`
  },
  {
    no: 2,
    title: '베타 테스트 참여 방법',
    author: '마케팅',
    createdAt: '2024-10-05',
    views: 456,
    content: `베타 테스트 참여 방법입니다.

■ 신청 방법
공지사항의 베타 테스트 모집 글에서 신청

■ 선정 기준
- 서비스 이용 이력
- 피드백 기여도
- 신청서 내용

■ 참여 혜택
- 신규 기능 우선 체험
- 베타 테스터 뱃지
- 포인트 지급`
  },
  {
    no: 1,
    title: 'KETHcompany 서비스 소개',
    author: '관리자',
    createdAt: '2024-10-01',
    views: 2345,
    content: `안녕하세요, KETHcompany입니다!

저희 서비스는 사용자에게 최고의 경험을 제공하기 위해 
끊임없이 노력하고 있습니다.

■ 주요 서비스
- 맞춤형 콘텐츠 추천
- 간편한 결제 시스템
- 24시간 고객 지원

■ 비전
"모든 사용자에게 가치 있는 서비스를"

앞으로도 KETHcompany를 응원해주세요!`
  }
];

// 페이지당 게시물 수
export const POSTS_PER_PAGE = 10;

// 정렬 키 타입
export type SortKey = 'headnum' | 'views' | 'date';
export type SortDirection = 'asc' | 'desc';

// 정렬 함수
export function sortPosts(posts: FaqPost[], sortKey: SortKey, direction: SortDirection): FaqPost[] {
  return [...posts].sort((a, b) => {
    let comparison = 0;
    switch (sortKey) {
      case 'headnum':
        comparison = a.no - b.no;
        break;
      case 'views':
        comparison = a.views - b.views;
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return direction === 'desc' ? -comparison : comparison;
  });
}

// 검색 함수
export function searchPosts(posts: FaqPost[], keyword: string): FaqPost[] {
  if (!keyword.trim()) return posts;
  const lowerKeyword = keyword.toLowerCase();
  return posts.filter(
    post =>
      post.title.toLowerCase().includes(lowerKeyword) ||
      post.content.toLowerCase().includes(lowerKeyword)
  );
}

// 페이지네이션 함수
export function paginatePosts(posts: FaqPost[], page: number): FaqPost[] {
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  return posts.slice(startIndex, startIndex + POSTS_PER_PAGE);
}

// 특정 게시물 찾기
export function findPostByNo(no: number): FaqPost | undefined {
  return faqPosts.find(post => post.no === no);
}

// 이전/다음 게시물 찾기
export function findAdjacentPosts(no: number, sortedPosts: FaqPost[]): { prev?: FaqPost; next?: FaqPost } {
  const currentIndex = sortedPosts.findIndex(post => post.no === no);
  if (currentIndex === -1) return {};
  
  return {
    prev: currentIndex > 0 ? sortedPosts[currentIndex - 1] : undefined,
    next: currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : undefined
  };
}

// 전체 페이지 수 계산
export function getTotalPages(posts: FaqPost[]): number {
  return Math.ceil(posts.length / POSTS_PER_PAGE);
}







