import Reveal from "./Reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  invert?: boolean;
  align?: "left" | "center";
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  invert = false,
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <Reveal
      className={`flex flex-col gap-4 ${centered ? "items-center text-center" : ""}`}
    >
      <span
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${
          invert ? "text-white/45" : "text-subtle"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`max-w-2xl text-3xl font-bold leading-[1.25] tracking-display md:text-[2.6rem] ${
          invert ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`max-w-xl text-base leading-relaxed md:text-lg ${
            invert ? "text-white/65" : "text-muted"
          }`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
