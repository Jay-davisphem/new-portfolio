import type { PortfolioData } from "../portfolio/types";
import { isValidHref, isValidHttpsUrl, sanitizePlainText } from "./sanitize";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function validatePortfolioData(raw: unknown): ValidationResult<PortfolioData> {
  const errors: string[] = [];

  if (!isRecord(raw)) {
    return { ok: false, errors: ["Root JSON must be an object"] };
  }

  const version = sanitizePlainText(raw.version);
  if (!version) errors.push("version is required");

  const profileRaw = raw.profile;
  if (!isRecord(profileRaw)) {
    errors.push("profile must be an object");
  }

  const profile = isRecord(profileRaw)
    ? {
        name: sanitizePlainText(profileRaw.name),
        roleHeadline: sanitizePlainText(profileRaw.roleHeadline),
        heroCtaText: sanitizePlainText(profileRaw.heroCtaText),
        avatarImage: (() => {
          const img = profileRaw.avatarImage;
          if (!isRecord(img)) {
            errors.push("profile.avatarImage must be an object");
            return { src: "", alt: "" };
          }
          const src = sanitizePlainText(img.src);
          const alt = sanitizePlainText(img.alt);
          if (!isValidHttpsUrl(src)) errors.push("profile.avatarImage.src must be https URL");
          if (!alt) errors.push("profile.avatarImage.alt is required");
          return { src, alt };
        })(),
      }
    : {
        name: "",
        roleHeadline: "",
        heroCtaText: "",
        avatarImage: { src: "", alt: "" },
      };

  if (!profile.name) errors.push("profile.name is required");
  if (!profile.roleHeadline) errors.push("profile.roleHeadline is required");
  if (!profile.heroCtaText) errors.push("profile.heroCtaText is required");

  const navigation = asArray(raw.navigation)
    .map((item, index) => {
      if (!isRecord(item)) {
        errors.push(`navigation[${index}] must be an object`);
        return { label: "", href: "" };
      }
      const label = sanitizePlainText(item.label);
      const href = asString(item.href).trim();
      if (!label) errors.push(`navigation[${index}].label is required`);
      if (!href || !isValidHref(href)) errors.push(`navigation[${index}].href must be a valid URL or /path`);
      return { label, href };
    });

  const featuredProjectsRaw = raw.featuredProjects;
  if (!isRecord(featuredProjectsRaw)) errors.push("featuredProjects must be an object");

  const featuredProjects = isRecord(featuredProjectsRaw)
    ? {
        title: sanitizePlainText(featuredProjectsRaw.title),
        items: asArray(featuredProjectsRaw.items).map((p, index) => {
          if (!isRecord(p)) {
            errors.push(`featuredProjects.items[${index}] must be an object`);
            return {
              title: "",
              description: "",
              image: { src: "", alt: "" },
              ctaLabel: "",
              ctaHref: "",
            };
          }
          const title = sanitizePlainText(p.title);
          const description = sanitizePlainText(p.description);
          const ctaLabel = sanitizePlainText(p.ctaLabel);
          const ctaHref = asString(p.ctaHref).trim();

          const imageRaw = p.image;
          let image = { src: "", alt: "" };
          if (!isRecord(imageRaw)) {
            errors.push(`featuredProjects.items[${index}].image must be an object`);
          } else {
            const src = sanitizePlainText(imageRaw.src);
            const alt = sanitizePlainText(imageRaw.alt);
            if (!isValidHttpsUrl(src)) errors.push(`featuredProjects.items[${index}].image.src must be https URL`);
            if (!alt) errors.push(`featuredProjects.items[${index}].image.alt is required`);
            image = { src, alt };
          }

          if (!title) errors.push(`featuredProjects.items[${index}].title is required`);
          if (!description) errors.push(`featuredProjects.items[${index}].description is required`);
          if (!ctaLabel) errors.push(`featuredProjects.items[${index}].ctaLabel is required`);
          if (!ctaHref || !isValidHref(ctaHref)) errors.push(`featuredProjects.items[${index}].ctaHref must be a valid URL or /path`);

          return { title, description, image, ctaLabel, ctaHref };
        }),
      }
    : { title: "", items: [] };

  if (!featuredProjects.title) errors.push("featuredProjects.title is required");

  const skillsRaw = raw.skills;
  if (!isRecord(skillsRaw)) errors.push("skills must be an object");

  const skills = isRecord(skillsRaw)
    ? {
        title: sanitizePlainText(skillsRaw.title),
        items: asArray(skillsRaw.items).map((s, index) => {
          if (!isRecord(s)) {
            errors.push(`skills.items[${index}] must be an object`);
            return { label: "", icon: "" };
          }
          const label = sanitizePlainText(s.label);
          const icon = sanitizePlainText(s.icon);
          if (!label) errors.push(`skills.items[${index}].label is required`);
          if (!icon) errors.push(`skills.items[${index}].icon is required`);
          return { label, icon };
        }),
      }
    : { title: "", items: [] };

  if (!skills.title) errors.push("skills.title is required");

  const newsletterRaw = raw.newsletter;
  if (!isRecord(newsletterRaw)) errors.push("newsletter must be an object");

  const newsletter = isRecord(newsletterRaw)
    ? {
        enabled: Boolean(newsletterRaw.enabled),
        title: sanitizePlainText(newsletterRaw.title),
        description: sanitizePlainText(newsletterRaw.description),
        placeholder: sanitizePlainText(newsletterRaw.placeholder),
        buttonText: sanitizePlainText(newsletterRaw.buttonText),
      }
    : { enabled: false, title: "", description: "", placeholder: "", buttonText: "" };

  if (newsletter.enabled) {
    if (!newsletter.title) errors.push("newsletter.title is required when enabled");
    if (!newsletter.placeholder) errors.push("newsletter.placeholder is required when enabled");
    if (!newsletter.buttonText) errors.push("newsletter.buttonText is required when enabled");
  }

  const footerRaw = raw.footer;
  if (!isRecord(footerRaw)) errors.push("footer must be an object");

  const footer = isRecord(footerRaw)
    ? {
        columns: asArray(footerRaw.columns).map((c, index) => {
          if (!isRecord(c)) {
            errors.push(`footer.columns[${index}] must be an object`);
            return { title: "", links: [] };
          }
          const title = sanitizePlainText(c.title);
          if (!title) errors.push(`footer.columns[${index}].title is required`);
          const links = asArray(c.links).map((l, li) => {
            if (!isRecord(l)) {
              errors.push(`footer.columns[${index}].links[${li}] must be an object`);
              return { label: "", href: "" };
            }
            const label = sanitizePlainText(l.label);
            const href = asString(l.href).trim();
            if (!label) errors.push(`footer.columns[${index}].links[${li}].label is required`);
            if (!href || !isValidHref(href)) errors.push(`footer.columns[${index}].links[${li}].href must be valid`);
            return { label, href };
          });
          return { title, links };
        }),
        social: asArray(footerRaw.social).map((s, index) => {
          if (!isRecord(s)) {
            errors.push(`footer.social[${index}] must be an object`);
            return { type: "", href: "" };
          }
          const type = sanitizePlainText(s.type);
          const href = asString(s.href).trim();
          if (!type) errors.push(`footer.social[${index}].type is required`);
          if (!href || !isValidHref(href)) errors.push(`footer.social[${index}].href must be valid`);
          return { type, href };
        }),
        copyright: sanitizePlainText(footerRaw.copyright),
      }
    : { columns: [], social: [], copyright: "" };

  if (!footer.copyright) errors.push("footer.copyright is required");

  const value: PortfolioData = {
    version,
    profile,
    navigation,
    featuredProjects,
    skills,
    newsletter,
    footer,
  };

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value };
}
