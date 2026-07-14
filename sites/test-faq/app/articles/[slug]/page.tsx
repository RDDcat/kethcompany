import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cultureBlock } from "../../lib/content";
import Reveal from "../../components/Reveal";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return cultureBlock.stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = cultureBlock.stories.find((s) => s.slug === slug);
  if (!story) return { title: "구성원 이야기" };
  return {
    title: `${story.name} · ${story.role}`,
    description: story.title,
  };
}

export default async function ArticleDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const story = cultureBlock.stories.find((s) => s.slug === slug);
  if (!story) notFound();

  const idx = cultureBlock.stories.findIndex((s) => s.slug === slug);
  const next = cultureBlock.stories[(idx + 1) % cultureBlock.stories.length];

  return (
    <article>
      <section className="border-b border-line bg-ink text-white">
        <div className="mx-auto max-w-3xl px-5 pb-16 pt-32 md:px-8 md:pb-24 md:pt-44">
          <Reveal>
            <Link
              href="/articles"
              className="text-sm font-medium text-white/50 transition-colors hover:text-white"
            >
              ← People & Culture
            </Link>
            <span className="mt-8 inline-block rounded-full border border-white/25 px-3 py-1 text-xs font-semibold text-white/70">
              {story.role}
            </span>
            <h1 className="mt-6 text-3xl font-extrabold leading-[1.2] tracking-display md:text-5xl">
              {story.title}
            </h1>
            <p className="mt-6 text-lg font-semibold text-white/80">
              {story.name}
            </p>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <p className="border-l-2 border-ink pl-6 text-2xl font-semibold leading-snug tracking-display text-ink md:text-3xl">
              “{story.quote}”
            </p>
            <p className="mt-12 whitespace-pre-line text-lg leading-[1.9] text-ink/90">
              {story.body}
            </p>
          </Reveal>

          <div className="mt-20 border-t border-line pt-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-subtle">
              다음 이야기
            </span>
            <Link
              href={`/articles/${next.slug}`}
              className="group mt-4 flex items-center justify-between gap-6"
            >
              <span>
                <span className="block text-sm text-muted">{next.role}</span>
                <span className="mt-1 block text-xl font-bold tracking-display text-ink">
                  {next.title}
                </span>
              </span>
              <span className="flex-none text-subtle transition-colors group-hover:text-ink">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
