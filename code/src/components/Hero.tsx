import type { PortfolioImage } from "@/lib/portfolio/types";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";

export function Hero(props: {
  name: string;
  roleHeadline: string;
  heroCtaText: string;
  avatar: PortfolioImage;
  ctaHref: string;
}) {
  return (
    <section className="pt-10 md:pt-14" id="home">
      <div className="container-shell">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
          <Reveal as="div" className="surface overflow-hidden p-4 md:p-5">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl">
              <Image
                src={props.avatar.src}
                alt={props.avatar.alt}
                fill
                sizes="(max-width: 768px) 100vw, 520px"
                className="object-cover"
                priority
              />
            </div>
          </Reveal>

          <Reveal as="div" className="md:pl-2" style={{ transitionDelay: "90ms" }}>
            <p className="text-sm font-semibold tracking-wide text-(--muted)">Hi, I’m {props.name}.</p>
            <h1 className="mt-3 text-balance text-[38px] font-semibold leading-[1.12] tracking-tight md:text-[54px]">
              {props.roleHeadline}
            </h1>
            <div className="mt-6">
              <Link className="btn-primary" href={props.ctaHref}>
                {props.heroCtaText}
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
