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
import { About } from "@/components/About";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Skills } from "@/components/Skills";
import { Experience, type ExperienceItem } from "@/components/Experience";
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

            <About
              title="What I do"
              description="I'm a Computer Engineering graduate (4.40/5.00 CGPA) focused on full-stack engineering and context-aware AI systems. I work as an AI Model Quality Analyst at Turing (model evaluation, data curation, debugging) and I'm actively learning Model Context Protocol (MCP) and multi-agent orchestration to build reliable LLM-powered products. Open to internships and collaborative projects."
              cards={[
                {
                  title: "Full-stack product engineering",
                  description:
                    "I build fast, accessible web apps with React/Next.js, solid APIs, and production-ready workflows.",
                },
                {
                  title: "AI quality & reliability",
                  description:
                    "I evaluate model outputs, curate data, and debug issues to make ML systems safer and more consistent.",
                },
                {
                  title: "Learning MCP & multi-agent systems",
                  description:
                    "I’m growing expertise in context management and agent orchestration to ship reliable LLM-powered features.",
                },
              ]}
            />

            <FeaturedProjects
              title={state.data.featuredProjects.title}
              items={state.data.featuredProjects.items}
            />

            <Skills title={state.data.skills.title} items={state.data.skills.items} />

            <Experience
              title="EXPERIENCE"
              items={getDefaultExperience()}
            />

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

function getDefaultExperience(): ExperienceItem[] {
  // NOTE: The current JSON schema doesn't include an experience section yet.
  // We render a reasonable default based on the resume data until we extend the schema.
  return [
    {
      role: "AI Model Quality Analyst",
      company: "Turing",
      location: "Remote",
      start: "Feb 2025",
      end: "Present",
      highlights: [
        "Trained and tuned ML models for optimal performance.",
        "Reviewed model code for quality, compliance, and reliability.",
        "Curated and annotated datasets to improve model outputs.",
        "Led debugging and troubleshooting across models and pipelines.",
      ],
    },
    {
      role: "System Engineer",
      company: "Africa Centre of Excellence (OAU ICT-Driven Knowledge Park)",
      location: "Ile-Ife, Nigeria",
      start: "Mar 2024",
      end: "Sep 2024",
      highlights: [
        "Built an Arduino-based motor-controlled robot using DC motors and H-Bridge circuits.",
        "Developed an ESP32 smart electricity monitor using PZEM modules.",
        "Created a React.js frontend with Firebase authentication and real-time analytics.",
      ],
    },
    {
      role: "ReactJS Frontend Lead",
      company: "Sandsstores",
      location: "Remote (Pennsylvania, USA)",
      start: "Apr 2023",
      end: "Jan 2024",
      highlights: [
        "Led frontend development using Next.js, Tailwind CSS, and Zustand.",
        "Deployed to Vercel with AWS S3 integration and custom domain setup.",
        "Improved performance and UX by resolving complex UI and state issues.",
      ],
    },
    {
      role: "Software Engineer Intern",
      company: "Zuri Inc",
      location: "Lagos, Nigeria",
      start: "May 2022",
      end: "Aug 2022",
      highlights: [
        "Coordinated ~10 interns to deliver a Favicon Generator web app.",
        "Designed PostgreSQL database schema and supported cloud migration prototyping.",
        "Managed GitHub projects and resolved code conflicts.",
      ],
    },
  ];
}
