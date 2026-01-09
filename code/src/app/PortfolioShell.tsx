"use client";

import type { PortfolioData } from "@/lib/portfolio/types";
import { ClientPortfolioBootstrap } from "@/lib/portfolio/ClientPortfolioBootstrap";
import { DEFAULT_PORTFOLIO_DATA } from "@/lib/portfolio/defaultData";
import {
  loadFromLocalStorage,
  validateAndCachePortfolio,
  fetchPortfolioJson,
  type LoadState,
} from "@/lib/portfolio/loaders";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Skills } from "@/components/Skills";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";

export default function PortfolioShell(props: {
  initialData: PortfolioData;
  initialRawJsonText: string | null;
}) {
  const url = process.env.NEXT_PUBLIC_PORTFOLIO_JSON_URL;

  // Local state is kept here (client-only), avoiding passing functions from RSC.
  const initialState = useMemo<LoadState>(() => {
    if (!url) {
      return {
        status: "error",
        data: props.initialData,
        message: "Missing NEXT_PUBLIC_PORTFOLIO_JSON_URL",
      };
    }

    const cached = loadFromLocalStorage();
    if (cached.status === "ready") return cached;

    return { status: "loading", data: props.initialData };
  }, [props.initialData, url]);

  const [state, setState] = useState<LoadState>(initialState);

  useEffect(() => {
    if (!url) return;

    if (props.initialRawJsonText) {
      const cached = validateAndCachePortfolio(props.initialRawJsonText);
      if (cached.status === "ready") queueMicrotask(() => setState(cached));
    }

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetchPortfolioJson({ url, signal: controller.signal });
        if (res.status === "not-modified") return;

        const next = validateAndCachePortfolio(res.raw, res.etag);
        setState(next);
      } catch {
        setState((s) =>
          s.status === "ready"
            ? s
            : { status: "error", data: s.data ?? DEFAULT_PORTFOLIO_DATA, message: "Failed to fetch portfolio JSON." },
        );
      }
    })();

    return () => controller.abort();
  }, [props.initialRawJsonText, url]);

  return (
    <ClientPortfolioBootstrap initialData={props.initialData} initialRawJsonText={props.initialRawJsonText}>
      <main className="min-h-screen">
        {state.status === "error" ? (
          <div className="container-shell pt-6">
            <div className="surface px-6 py-5">
              <p className="text-sm font-semibold">
                {"message" in state ? state.message : "Something went wrong"}
              </p>
              <p className="mt-2 text-sm text-(--muted)">
                If you have cached content, it will still render below.
              </p>
            </div>
          </div>
        ) : null}

        {state.status !== "ready" ? (
          <div className="container-shell pt-10">
            <div className="surface px-6 py-8">
              <p className="text-sm font-semibold">Loading your portfolio…</p>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <div className="h-44 animate-pulse rounded-2xl bg-(--surface-2)" />
                <div className="h-44 animate-pulse rounded-2xl bg-(--surface-2)" />
                <div className="h-44 animate-pulse rounded-2xl bg-(--surface-2)" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <Header
              brand={state.data.profile.name}
              navigation={state.data.navigation}
              primaryCta={{ label: state.data.profile.heroCtaText, href: "#work" }}
            />

            <Hero
              name={state.data.profile.name}
              roleHeadline={state.data.profile.roleHeadline}
              heroCtaText={state.data.profile.heroCtaText}
              avatar={state.data.profile.avatarImage}
              ctaHref="#work"
            />

            <FeaturedProjects
              title={state.data.featuredProjects.title}
              items={state.data.featuredProjects.items}
            />

            <Skills title={state.data.skills.title} items={state.data.skills.items} />

            <Newsletter
              enabled={state.data.newsletter.enabled}
              title={state.data.newsletter.title}
              description={state.data.newsletter.description}
              placeholder={state.data.newsletter.placeholder}
              buttonText={state.data.newsletter.buttonText}
            />

            <Footer
              columns={state.data.footer.columns}
              social={state.data.footer.social}
              copyright={state.data.footer.copyright}
            />
          </>
        )}
      </main>
    </ClientPortfolioBootstrap>
  );
}
