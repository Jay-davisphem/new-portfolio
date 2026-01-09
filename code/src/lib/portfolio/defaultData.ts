import type { PortfolioData } from "./types";

// Placeholder only. Real content must come from GitHub JSON / localStorage.
export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  version: "1",
  profile: {
    name: "—",
    roleHeadline: "Loading portfolio…",
    heroCtaText: "See My Work",
    avatarImage: {
      // Use https placeholder to satisfy validators; can be swapped immediately after fetch.
      src: "https://via.placeholder.com/600x600.png?text=Avatar",
      alt: "Avatar placeholder",
    },
  },
  navigation: [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Personal Photo", href: "#photo" },
    { label: "Contact", href: "#contact" },
  ],
  featuredProjects: {
    title: "FEATURED PROJECTS",
    items: [],
  },
  skills: {
    title: "SKILLS & EXPERTISE",
    items: [],
  },
  newsletter: {
    enabled: true,
    title: "Hi, I’m —.\nI craft digital experiences.",
    description:
      "This is a placeholder block while your GitHub JSON loads. Replace in your portfolio JSON.",
    placeholder: "Type your email",
    buttonText: "Subscribe",
  },
  footer: {
    columns: [],
    social: [],
    copyright: "© " + new Date().getFullYear() + " My Personal Portfolio",
  },
};
