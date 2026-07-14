export type NavItem = {
  label: string;
  href: string;
  ko: string;
};

// jype 구조 미러링 — News / Apply / My Page(로그인) 제외
export const NAV_ITEMS: NavItem[] = [
  { label: "People & Culture", href: "/articles", ko: "구성원 이야기" },
  { label: "Work & Life", href: "/benefits", ko: "일과 삶" },
  { label: "Process & FAQ", href: "/faqs", ko: "채용 절차·FAQ" },
  { label: "Notice", href: "/notices", ko: "공지사항" },
];
