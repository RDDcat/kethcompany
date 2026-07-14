import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-5">
      <div className="text-center">
        <p className="text-7xl font-extrabold tracking-display text-ink md:text-8xl">
          404
        </p>
        <p className="mt-6 text-lg text-muted">
          찾으시는 페이지를 만나지 못했습니다.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </section>
  );
}
