import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://kethcompany.com"
  ),
  title: {
    default: "케쓰 KETH — AI로 서비스를 만드는 팀",
    template: "%s — 케쓰 KETH",
  },
  description:
    "케쓰(KETH)는 AI로 다양한 서비스를 만드는 팀입니다. 지금은 사람을 돕는 AI 상담 서비스를 만들고 있습니다. 함께 만들어갈 동료를 소개합니다.",
  keywords: [
    "케쓰",
    "KETH",
    "AI",
    "AI 상담",
    "채용",
    "AI 스타트업",
    "프로덕트 팀",
  ],
  openGraph: {
    title: "케쓰 KETH — AI로 서비스를 만드는 팀",
    description:
      "케쓰(KETH)는 AI로 다양한 서비스를 만드는 팀입니다. 지금은 사람을 돕는 AI 상담 서비스를 만들고 있습니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "케쓰 KETH",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
