import Reveal from "./Reveal";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export default function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-line bg-ink text-white">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-32 md:px-8 md:pb-20 md:pt-44">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
            {eyebrow}
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-display md:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
