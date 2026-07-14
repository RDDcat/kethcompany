import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { notices } from "../../lib/content";
import Reveal from "../../components/Reveal";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return notices.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const notice = notices.find((n) => n.slug === slug);
  if (!notice) return { title: "공지사항" };
  return { title: notice.title, description: notice.body.slice(0, 100) };
}

export default async function NoticeDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const notice = notices.find((n) => n.slug === slug);
  if (!notice) notFound();

  return (
    <article>
      <section className="border-b border-line bg-ink text-white">
        <div className="mx-auto max-w-3xl px-5 pb-14 pt-32 md:px-8 md:pb-20 md:pt-44">
          <Reveal>
            <Link
              href="/notices"
              className="text-sm font-medium text-white/50 transition-colors hover:text-white"
            >
              ← Notice
            </Link>
            <div className="mt-8 flex items-center gap-4">
              <span className="rounded-full border border-white/25 px-3 py-1 text-xs font-semibold text-white/70">
                {notice.category}
              </span>
              <time className="text-sm text-white/50">{notice.date}</time>
            </div>
            <h1 className="mt-6 text-3xl font-extrabold leading-[1.25] tracking-display md:text-4xl">
              {notice.title}
            </h1>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="whitespace-pre-line text-lg leading-[1.9] text-ink/90">
              {notice.body}
            </p>
          </Reveal>
          <div className="mt-16 border-t border-line pt-8">
            <Link
              href="/notices"
              className="text-sm font-semibold text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              ← 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
