import { Reveal } from "@/components/motion/Reveal";

export type ExperienceItem = {
  role: string;
  company: string;
  location?: string;
  start: string;
  end: string;
  highlights: string[];
};

export function Experience(props: { title: string; items: ExperienceItem[] }) {
  if (!props.items.length) return null;

  return (
    <section className="pt-10 md:pt-12" id="experience">
      <div className="container-shell">
        <Reveal as="h2" className="text-sm font-semibold tracking-[0.18em] text-(--muted)">
          {props.title}
        </Reveal>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {props.items.map((item, idx) => (
            <Reveal
              key={`${item.company}:${item.role}:${item.start}`}
              as="article"
              className="surface px-6 py-6"
              style={{ transitionDelay: `${Math.min(240, idx * 70)}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold tracking-tight">{item.role}</h3>
                  <p className="mt-1 text-sm text-(--muted)">
                    <span className="font-semibold text-(--foreground)">{item.company}</span>
                    {item.location ? <span className="text-(--muted)"> · {item.location}</span> : null}
                  </p>
                </div>
                <p className="text-xs font-semibold text-(--muted)">
                  {item.start} — {item.end}
                </p>
              </div>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-(--muted)">
                {item.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
