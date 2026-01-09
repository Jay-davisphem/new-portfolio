import type { FeaturedProject } from "@/lib/portfolio/types";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@/components/icons";

export function FeaturedProjects(props: {
  title: string;
  items: FeaturedProject[];
}) {
  return (
    <section className="pt-14 md:pt-18" id="work">
      <div className="container-shell">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-(--muted)">
            {props.title}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {props.items.map((p) => (
            <article key={p.title} className="surface overflow-hidden">
              <div className="relative aspect-16/10 w-full overflow-hidden">
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  className="object-cover transition-transform duration-300 will-change-transform hover:scale-[1.03]"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-6 text-(--muted)">{p.description}</p>
                <div className="mt-4">
                  <Link
                    className="inline-flex items-center gap-2 text-sm font-semibold"
                    href={p.ctaHref}
                    target={p.ctaHref.startsWith("http") ? "_blank" : undefined}
                    rel={p.ctaHref.startsWith("http") ? "noreferrer" : undefined}
                  >
                    {p.ctaLabel}
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
