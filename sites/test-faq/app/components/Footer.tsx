import Link from "next/link";
import { NAV_ITEMS } from "./nav";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-white">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-display">
                KETH
              </span>
              <span className="text-sm text-white/50">케쓰</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              AI로 다양한 서비스를 만드는 팀. 지금은 사람을 돕는 AI 상담 서비스를
              만들고 있습니다.
            </p>
          </div>

          <nav className="flex flex-col gap-3">
            <span className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
              Explore
            </span>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/45 md:flex-row md:items-center md:justify-between">
          <p>© {2026} KETH. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white/80"
            >
              개인정보처리방침
            </Link>
            <span>AI로 서비스를 만드는 팀, 케쓰</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
