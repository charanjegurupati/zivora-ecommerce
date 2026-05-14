export const SectionHeading = ({ eyebrow, title, description, align = "left" }) => (
  <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
    {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
    <h2 className="display-title text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
      {title}
    </h2>
    {description ? (
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
    ) : null}
  </div>
);
