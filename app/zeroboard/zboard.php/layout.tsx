import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - KETHcompany',
  description: 'KETHcompany FAQ board - 자주 묻는 질문과 답변을 확인하세요.',
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="canonical" href="/zeroboard/zboard.php?id=FAQ" />
      {children}
    </>
  );
}

