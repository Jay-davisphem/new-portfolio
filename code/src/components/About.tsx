import { Reveal } from "@/components/motion/Reveal";

export type AboutCard = {
  title: string;
  description: string;
};

export function About(props: {
  title: string;
  description: string;
  cards: AboutCard[];
}) {
  return (
    <section className="pt-10 md:pt-12" id="about">
      <div className="container-shell">
        <Reveal as="div" className="surface px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-start">
            <div>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{props.title}</h2>
              <p className="mt-3 text-sm leading-6 text-(--muted)">{props.description}</p>
            </div>

            <div className="grid gap-4">
              {props.cards.map((c, idx) => (
                <Reveal
                  key={c.title}
                  as="div"
                  className="rounded-2xl border border-(--border) bg-(--surface) px-5 py-4"
                  style={{ transitionDelay: `${Math.min(220, idx * 70)}ms` }}
                >
                  <h3 className="text-sm font-semibold tracking-tight">{c.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-(--muted)">{c.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
