"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readPortfolioJsonRaw, writePortfolioJsonRaw } from "@/lib/storage/localStorage";
import { DEFAULT_PORTFOLIO_DATA } from "@/lib/portfolio/defaultData";
import { validatePortfolioData } from "@/lib/validation/portfolioValidation";
import type { PortfolioData } from "@/lib/portfolio/types";
import type { FeaturedProject, FooterColumn, FooterSocial, NavigationItem, SkillItem } from "@/lib/portfolio/types";
import {
  configureAdminPassphrase,
  getAdminConfigStatus,
  isAdminUnlocked,
  setAdminUnlocked,
  touchAdminActivity,
  verifyAdminPassphrase,
} from "@/lib/admin/auth";
import { arrayApply } from "@/lib/admin/editorUtils";
import { Field, TextArea, TextInput, Toggle } from "@/components/admin/Field";
import { ImageUrlField } from "@/components/admin/ImageUrlField";

const IDLE_TIMEOUT_MS = 10 * 60 * 1000;

function downloadJson(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AdminEditorClient() {
  const initialMode = useMemo<"setup" | "login" | "editor">(() => {
    const status = getAdminConfigStatus();
    const sessionUnlocked = isAdminUnlocked({ timeoutMs: IDLE_TIMEOUT_MS });
    if (sessionUnlocked) return "editor";
    return status === "configured" ? "login" : "setup";
  }, []);

  const [passphrase, setPassphrase] = useState("");
  const [mode, setMode] = useState<"setup" | "login" | "editor">(initialMode);
  const [message, setMessage] = useState<string | null>(null);

  const [draft, setDraft] = useState<PortfolioData>(() => {
    const raw = readPortfolioJsonRaw();
    if (!raw) return DEFAULT_PORTFOLIO_DATA;
    try {
      const parsed = JSON.parse(raw) as unknown;
      const validated = validatePortfolioData(parsed);
      return validated.ok ? validated.value : DEFAULT_PORTFOLIO_DATA;
    } catch {
      return DEFAULT_PORTFOLIO_DATA;
    }
  });

  const [activeTab, setActiveTab] = useState<
    "profile" | "navigation" | "projects" | "skills" | "newsletter" | "footer" | "importExport"
  >("profile");

  const unlocked = useMemo(() => isAdminUnlocked({ timeoutMs: IDLE_TIMEOUT_MS }), []);

  // Initial mode comes from initialMode memo above (avoid setState in effects).

  // Activity tracking + auto-lock on idle.
  useEffect(() => {
    if (!unlocked) return;

    const onActivity = () => touchAdminActivity();
    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    window.addEventListener("scroll", onActivity, { passive: true });

    const timer = window.setInterval(() => {
      if (!isAdminUnlocked({ timeoutMs: IDLE_TIMEOUT_MS })) {
        setAdminUnlocked(false);
        setMode("login");
        setMessage("Session locked due to inactivity.");
      }
    }, 1500);

    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("scroll", onActivity);
      window.clearInterval(timer);
    };
  }, [unlocked]);

  // (No separate "already unlocked" effect; handled in initial-mode effect above.)

  function lockNow() {
    setAdminUnlocked(false);
    setMode(getAdminConfigStatus() === "configured" ? "login" : "setup");
    setMessage("Locked.");
    setPassphrase("");
  }

  async function onSubmitPassphrase() {
    setMessage(null);

    if (passphrase.trim().length < 6) {
      setMessage("Passphrase must be at least 6 characters.");
      return;
    }

    if (mode === "setup") {
      await configureAdminPassphrase(passphrase);
      setAdminUnlocked(true);
      setMode("editor");
      setPassphrase("");
      setMessage("Passphrase saved. You’re unlocked.");
      return;
    }

    const res = await verifyAdminPassphrase(passphrase);
    if (!res.ok) {
      setMessage(res.reason === "not-configured" ? "No passphrase configured yet." : "Invalid passphrase.");
      return;
    }

    setAdminUnlocked(true);
    setMode("editor");
    setPassphrase("");
    setMessage("Unlocked.");
  }

  function validateDraft(value: PortfolioData): { ok: true; value: PortfolioData } | { ok: false; errors: string[] } {
    const r = validatePortfolioData(value as unknown);
    if (!r.ok) return { ok: false, errors: r.errors };
    return { ok: true, value: r.value };
  }

  if (mode !== "editor") {
    return (
      <main className="min-h-screen">
        <div className="container-shell pt-10">
          <div className="surface px-6 py-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {mode === "setup" ? "Set Admin Passphrase" : "Admin Login"}
                </h1>
                <p className="mt-2 text-sm text-(--muted)">
                  {mode === "setup"
                    ? "No passphrase is configured on this device yet. Create one to protect the editor."
                    : "Enter your passphrase to unlock editing. Your session will auto-lock after inactivity."}
                </p>
              </div>
            </div>

            {message ? <p className="mt-4 text-sm font-semibold">{message}</p> : null}

            <div className="mt-6">
              <label className="text-sm font-semibold" htmlFor="admin-pass">
                Passphrase
              </label>
              <input
                id="admin-pass"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="mt-2 h-12 w-full rounded-[999px] border border-(--border) bg-(--surface) px-4 text-sm outline-none focus:ring-2 focus:ring-(--accent)/30"
                placeholder={mode === "setup" ? "Create a passphrase" : "Enter passphrase"}
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button type="button" className="btn-primary" onClick={onSubmitPassphrase}>
                  {mode === "setup" ? "Create passphrase" : "Unlock"}
                </button>
                {mode === "login" ? (
                  <button type="button" className="btn-ghost" onClick={() => setMode("setup")}>
                    Reset on this device
                  </button>
                ) : null}
              </div>

              <p className="mt-4 text-xs text-(--muted)">
                Note: this is best-effort client-only security. Anyone with device access could bypass it.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container-shell pt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Editor</h1>
            <p className="mt-1 text-sm text-(--muted)">
              Edit the JSON stored in localStorage. Export it and commit back to GitHub.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn-ghost" aria-label="View portfolio">
              View portfolio
            </Link>
            <button type="button" className="btn-ghost" onClick={lockNow}>
              Lock
            </button>
          </div>
        </div>

        {message ? <div className="surface px-5 py-4"><p className="text-sm font-semibold">{message}</p></div> : null}

        <div className="surface mt-4 px-6 py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  const r = validateDraft(draft);
                  if (!r.ok) {
                    setMessage("Draft is invalid:\n" + r.errors.slice(0, 8).join("\n"));
                    return;
                  }
                  writePortfolioJsonRaw(JSON.stringify(r.value, null, 2));
                  setMessage("Saved to localStorage.");
                }}
              >
                Save
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  const r = validateDraft(draft);
                  if (!r.ok) {
                    setMessage("Draft is invalid:\n" + r.errors.slice(0, 8).join("\n"));
                    return;
                  }
                  const text = JSON.stringify(r.value, null, 2);
                  navigator.clipboard
                    .writeText(text)
                    .then(() => setMessage("Copied JSON to clipboard."))
                    .catch(() => setMessage("Failed to copy to clipboard."));
                }}
              >
                Copy JSON
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  const r = validateDraft(draft);
                  if (!r.ok) {
                    setMessage("Draft is invalid:\n" + r.errors.slice(0, 8).join("\n"));
                    return;
                  }
                  downloadJson("portfolio.json", JSON.stringify(r.value, null, 2));
                  setMessage("Downloaded portfolio.json");
                }}
              >
                Download JSON
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  const r = validateDraft(draft);
                  if (!r.ok) {
                    setMessage("Draft is invalid:\n" + r.errors.slice(0, 8).join("\n"));
                    return;
                  }
                  const text = JSON.stringify(r.value, null, 2);
                  downloadJson("portfolio.json", text);
                  setMessage("Downloaded portfolio.json");
                }}
              >
                Export
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {([
              ["profile", "Profile"],
              ["navigation", "Navigation"],
              ["projects", "Projects"],
              ["skills", "Skills"],
              ["newsletter", "Newsletter"],
              ["footer", "Footer"],
              ["importExport", "Import/Export"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={key === activeTab ? "btn-primary" : "btn-ghost"}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-10">
            {activeTab === "profile" ? (
              <section className="grid gap-6">
                <h2 className="text-lg font-semibold">Profile</h2>
                <Field label="Name">
                  <TextInput
                    value={draft.profile.name}
                    onChange={(name) => setDraft((d) => ({ ...d, profile: { ...d.profile, name } }))}
                    placeholder="Your name"
                  />
                </Field>

                <Field label="Role headline" hint="Used in the hero headline">
                  <TextInput
                    value={draft.profile.roleHeadline}
                    onChange={(roleHeadline) => setDraft((d) => ({ ...d, profile: { ...d.profile, roleHeadline } }))}
                    placeholder="I craft digital experiences."
                  />
                </Field>

                <Field label="Hero CTA text">
                  <TextInput
                    value={draft.profile.heroCtaText}
                    onChange={(heroCtaText) => setDraft((d) => ({ ...d, profile: { ...d.profile, heroCtaText } }))}
                    placeholder="See My Work"
                  />
                </Field>

                <ImageUrlField
                  label="Avatar"
                  src={draft.profile.avatarImage.src}
                  alt={draft.profile.avatarImage.alt}
                  onChange={(avatarImage) => setDraft((d) => ({ ...d, profile: { ...d.profile, avatarImage } }))}
                />
              </section>
            ) : null}

            {activeTab === "navigation" ? (
              <section className="grid gap-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        navigation: arrayApply<NavigationItem>(d.navigation, {
                          type: "add",
                          value: { label: "New", href: "#" + String(d.navigation.length + 1) },
                        }),
                      }))
                    }
                  >
                    Add item
                  </button>
                </div>

                <div className="grid gap-4">
                  {draft.navigation.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-(--border) bg-(--surface) p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold">Item {index + 1}</div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn-ghost"
                            disabled={index === 0}
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                navigation: arrayApply(d.navigation, { type: "move", from: index, to: index - 1 }),
                              }))
                            }
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            disabled={index === draft.navigation.length - 1}
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                navigation: arrayApply(d.navigation, { type: "move", from: index, to: index + 1 }),
                              }))
                            }
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                navigation: arrayApply(d.navigation, { type: "remove", index }),
                              }))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Label">
                          <TextInput
                            value={item.label}
                            onChange={(label) =>
                              setDraft((d) => ({
                                ...d,
                                navigation: arrayApply(d.navigation, {
                                  type: "update",
                                  index,
                                  value: { ...item, label },
                                }),
                              }))
                            }
                          />
                        </Field>
                        <Field label="Href" hint="Use #about, /path, or https:// URL">
                          <TextInput
                            value={item.href}
                            onChange={(href) =>
                              setDraft((d) => ({
                                ...d,
                                navigation: arrayApply(d.navigation, {
                                  type: "update",
                                  index,
                                  value: { ...item, href },
                                }),
                              }))
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTab === "projects" ? (
              <section className="grid gap-6">
                <div className="grid gap-3">
                  <h2 className="text-lg font-semibold">Featured projects</h2>
                  <Field label="Section title">
                    <TextInput
                      value={draft.featuredProjects.title}
                      onChange={(title) => setDraft((d) => ({ ...d, featuredProjects: { ...d.featuredProjects, title } }))}
                    />
                  </Field>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        featuredProjects: {
                          ...d.featuredProjects,
                          items: arrayApply<FeaturedProject>(d.featuredProjects.items, {
                            type: "add",
                            value: {
                              title: "New project",
                              description: "Describe it…",
                              image: { src: "https://via.placeholder.com/1200x800.png?text=Project", alt: "Project image" },
                              ctaLabel: "View",
                              ctaHref: "#", 
                            },
                          }),
                        },
                      }))
                    }
                  >
                    Add project
                  </button>
                </div>

                <div className="grid gap-4">
                  {draft.featuredProjects.items.map((p, index) => (
                    <div key={index} className="rounded-2xl border border-(--border) bg-(--surface) p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold">Project {index + 1}</div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn-ghost"
                            disabled={index === 0}
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                featuredProjects: {
                                  ...d.featuredProjects,
                                  items: arrayApply(d.featuredProjects.items, { type: "move", from: index, to: index - 1 }),
                                },
                              }))
                            }
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            disabled={index === draft.featuredProjects.items.length - 1}
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                featuredProjects: {
                                  ...d.featuredProjects,
                                  items: arrayApply(d.featuredProjects.items, { type: "move", from: index, to: index + 1 }),
                                },
                              }))
                            }
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                featuredProjects: {
                                  ...d.featuredProjects,
                                  items: arrayApply(d.featuredProjects.items, { type: "remove", index }),
                                },
                              }))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4">
                        <Field label="Title">
                          <TextInput
                            value={p.title}
                            onChange={(title) =>
                              setDraft((d) => ({
                                ...d,
                                featuredProjects: {
                                  ...d.featuredProjects,
                                  items: arrayApply(d.featuredProjects.items, {
                                    type: "update",
                                    index,
                                    value: { ...p, title },
                                  }),
                                },
                              }))
                            }
                          />
                        </Field>

                        <Field label="Description">
                          <TextArea
                            value={p.description}
                            onChange={(description) =>
                              setDraft((d) => ({
                                ...d,
                                featuredProjects: {
                                  ...d.featuredProjects,
                                  items: arrayApply(d.featuredProjects.items, {
                                    type: "update",
                                    index,
                                    value: { ...p, description },
                                  }),
                                },
                              }))
                            }
                          />
                        </Field>

                        <ImageUrlField
                          label="Project image"
                          src={p.image.src}
                          alt={p.image.alt}
                          onChange={(image) =>
                            setDraft((d) => ({
                              ...d,
                              featuredProjects: {
                                ...d.featuredProjects,
                                items: arrayApply(d.featuredProjects.items, {
                                  type: "update",
                                  index,
                                  value: { ...p, image },
                                }),
                              },
                            }))
                          }
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="CTA label">
                            <TextInput
                              value={p.ctaLabel}
                              onChange={(ctaLabel) =>
                                setDraft((d) => ({
                                  ...d,
                                  featuredProjects: {
                                    ...d.featuredProjects,
                                    items: arrayApply(d.featuredProjects.items, {
                                      type: "update",
                                      index,
                                      value: { ...p, ctaLabel },
                                    }),
                                  },
                                }))
                              }
                            />
                          </Field>
                          <Field label="CTA href">
                            <TextInput
                              value={p.ctaHref}
                              onChange={(ctaHref) =>
                                setDraft((d) => ({
                                  ...d,
                                  featuredProjects: {
                                    ...d.featuredProjects,
                                    items: arrayApply(d.featuredProjects.items, {
                                      type: "update",
                                      index,
                                      value: { ...p, ctaHref },
                                    }),
                                  },
                                }))
                              }
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTab === "skills" ? (
              <section className="grid gap-6">
                <div className="grid gap-3">
                  <h2 className="text-lg font-semibold">Skills</h2>
                  <Field label="Section title">
                    <TextInput
                      value={draft.skills.title}
                      onChange={(title) => setDraft((d) => ({ ...d, skills: { ...d.skills, title } }))}
                    />
                  </Field>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        skills: {
                          ...d.skills,
                          items: arrayApply<SkillItem>(d.skills.items, {
                            type: "add",
                            value: { label: "New skill", icon: "frontend" },
                          }),
                        },
                      }))
                    }
                  >
                    Add skill
                  </button>
                </div>

                <div className="grid gap-4">
                  {draft.skills.items.map((s, index) => (
                    <div key={index} className="rounded-2xl border border-(--border) bg-(--surface) p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold">Skill {index + 1}</div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn-ghost"
                            disabled={index === 0}
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                skills: { ...d.skills, items: arrayApply(d.skills.items, { type: "move", from: index, to: index - 1 }) },
                              }))
                            }
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            disabled={index === draft.skills.items.length - 1}
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                skills: { ...d.skills, items: arrayApply(d.skills.items, { type: "move", from: index, to: index + 1 }) },
                              }))
                            }
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                skills: { ...d.skills, items: arrayApply(d.skills.items, { type: "remove", index }) },
                              }))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Label">
                          <TextInput
                            value={s.label}
                            onChange={(label) =>
                              setDraft((d) => ({
                                ...d,
                                skills: {
                                  ...d.skills,
                                  items: arrayApply(d.skills.items, { type: "update", index, value: { ...s, label } }),
                                },
                              }))
                            }
                          />
                        </Field>
                        <Field label="Icon key" hint="Must match an icon key in components/icons.tsx">
                          <TextInput
                            value={s.icon}
                            onChange={(icon) =>
                              setDraft((d) => ({
                                ...d,
                                skills: {
                                  ...d.skills,
                                  items: arrayApply(d.skills.items, { type: "update", index, value: { ...s, icon } }),
                                },
                              }))
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTab === "newsletter" ? (
              <section className="grid gap-6">
                <h2 className="text-lg font-semibold">Newsletter</h2>
                <Toggle
                  checked={draft.newsletter.enabled}
                  onChange={(enabled) => setDraft((d) => ({ ...d, newsletter: { ...d.newsletter, enabled } }))}
                  label="Enabled"
                />

                <Field label="Title">
                  <TextArea
                    value={draft.newsletter.title}
                    onChange={(title) => setDraft((d) => ({ ...d, newsletter: { ...d.newsletter, title } }))}
                    placeholder="Title..."
                  />
                </Field>

                <Field label="Description">
                  <TextArea
                    value={draft.newsletter.description}
                    onChange={(description) => setDraft((d) => ({ ...d, newsletter: { ...d.newsletter, description } }))}
                    placeholder="Description..."
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Placeholder">
                    <TextInput
                      value={draft.newsletter.placeholder}
                      onChange={(placeholder) => setDraft((d) => ({ ...d, newsletter: { ...d.newsletter, placeholder } }))}
                    />
                  </Field>
                  <Field label="Button text">
                    <TextInput
                      value={draft.newsletter.buttonText}
                      onChange={(buttonText) => setDraft((d) => ({ ...d, newsletter: { ...d.newsletter, buttonText } }))}
                    />
                  </Field>
                </div>
              </section>
            ) : null}

            {activeTab === "footer" ? (
              <section className="grid gap-6">
                <h2 className="text-lg font-semibold">Footer</h2>
                <Field label="Copyright">
                  <TextInput
                    value={draft.footer.copyright}
                    onChange={(copyright) => setDraft((d) => ({ ...d, footer: { ...d.footer, copyright } }))}
                  />
                </Field>

                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Columns</h3>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        footer: {
                          ...d.footer,
                          columns: arrayApply<FooterColumn>(d.footer.columns, {
                            type: "add",
                            value: { title: "New column", links: [{ label: "Link", href: "#" }] },
                          }),
                        },
                      }))
                    }
                  >
                    Add column
                  </button>
                </div>

                <div className="grid gap-4">
                  {draft.footer.columns.map((c, index) => (
                    <div key={index} className="rounded-2xl border border-(--border) bg-(--surface) p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold">Column {index + 1}</div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn-ghost"
                            disabled={index === 0}
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                footer: { ...d.footer, columns: arrayApply(d.footer.columns, { type: "move", from: index, to: index - 1 }) },
                              }))
                            }
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            disabled={index === draft.footer.columns.length - 1}
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                footer: { ...d.footer, columns: arrayApply(d.footer.columns, { type: "move", from: index, to: index + 1 }) },
                              }))
                            }
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                footer: { ...d.footer, columns: arrayApply(d.footer.columns, { type: "remove", index }) },
                              }))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4">
                        <Field label="Title">
                          <TextInput
                            value={c.title}
                            onChange={(title) =>
                              setDraft((d) => ({
                                ...d,
                                footer: {
                                  ...d.footer,
                                  columns: arrayApply(d.footer.columns, { type: "update", index, value: { ...c, title } }),
                                },
                              }))
                            }
                          />
                        </Field>

                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">Links</div>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => {
                              const next = { ...c, links: [...c.links, { label: "New link", href: "#" }] };
                              setDraft((d) => ({
                                ...d,
                                footer: { ...d.footer, columns: arrayApply(d.footer.columns, { type: "update", index, value: next }) },
                              }));
                            }}
                          >
                            Add link
                          </button>
                        </div>

                        <div className="grid gap-3">
                          {c.links.map((l, li) => (
                            <div key={li} className="grid gap-3 rounded-2xl border border-(--border) p-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                              <Field label="Label">
                                <TextInput
                                  value={l.label}
                                  onChange={(label) => {
                                    const links = c.links.map((x, i) => (i === li ? { ...x, label } : x));
                                    const next = { ...c, links };
                                    setDraft((d) => ({
                                      ...d,
                                      footer: { ...d.footer, columns: arrayApply(d.footer.columns, { type: "update", index, value: next }) },
                                    }));
                                  }}
                                />
                              </Field>
                              <Field label="Href">
                                <TextInput
                                  value={l.href}
                                  onChange={(href) => {
                                    const links = c.links.map((x, i) => (i === li ? { ...x, href } : x));
                                    const next = { ...c, links };
                                    setDraft((d) => ({
                                      ...d,
                                      footer: { ...d.footer, columns: arrayApply(d.footer.columns, { type: "update", index, value: next }) },
                                    }));
                                  }}
                                />
                              </Field>
                              <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => {
                                  const links = c.links.filter((_, i) => i !== li);
                                  const next = { ...c, links };
                                  setDraft((d) => ({
                                    ...d,
                                    footer: { ...d.footer, columns: arrayApply(d.footer.columns, { type: "update", index, value: next }) },
                                  }));
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Social</h3>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        footer: {
                          ...d.footer,
                          social: arrayApply<FooterSocial>(d.footer.social, { type: "add", value: { type: "github", href: "https://" } }),
                        },
                      }))
                    }
                  >
                    Add social
                  </button>
                </div>

                <div className="grid gap-3">
                  {draft.footer.social.map((s, index) => (
                    <div key={index} className="grid gap-3 rounded-2xl border border-(--border) p-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
                      <Field label="Type">
                        <TextInput
                          value={s.type}
                          onChange={(type) =>
                            setDraft((d) => ({
                              ...d,
                              footer: {
                                ...d.footer,
                                social: arrayApply(d.footer.social, { type: "update", index, value: { ...s, type } }),
                              },
                            }))
                          }
                        />
                      </Field>
                      <Field label="Href">
                        <TextInput
                          value={s.href}
                          onChange={(href) =>
                            setDraft((d) => ({
                              ...d,
                              footer: {
                                ...d.footer,
                                social: arrayApply(d.footer.social, { type: "update", index, value: { ...s, href } }),
                              },
                            }))
                          }
                        />
                      </Field>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            footer: { ...d.footer, social: arrayApply(d.footer.social, { type: "remove", index }) },
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTab === "importExport" ? (
              <section className="grid gap-6">
                <h2 className="text-lg font-semibold">Import / Export</h2>

                <div className="flex flex-wrap gap-3">
                  <label className="btn-ghost cursor-pointer">
                    <input
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        file
                          .text()
                          .then((t) => {
                            try {
                              const parsed = JSON.parse(t) as unknown;
                              const validated = validatePortfolioData(parsed);
                              if (!validated.ok) {
                                setMessage("Import failed:\n" + validated.errors.slice(0, 10).join("\n"));
                                return;
                              }
                              setDraft(validated.value);
                              setMessage("Imported into draft (not saved yet).\nClick Save to persist.");
                            } catch {
                              setMessage("Import failed: invalid JSON.");
                            }
                          })
                          .catch(() => setMessage("Failed to read file."));
                      }}
                    />
                    Import JSON file
                  </label>

                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setDraft(DEFAULT_PORTFOLIO_DATA);
                      setMessage("Reset draft to defaults (not saved yet).\nClick Save to persist.");
                    }}
                  >
                    Reset draft
                  </button>

                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      const text = JSON.stringify(draft, null, 2);
                      downloadJson("portfolio.json", text);
                      setMessage("Downloaded portfolio.json");
                    }}
                  >
                    Download current draft
                  </button>
                </div>

                <Field label="Raw JSON (read-only)" hint="For debugging only; edit via the forms above.">
                  <textarea
                    readOnly
                    value={JSON.stringify(draft, null, 2)}
                    className="mt-2 h-[50vh] w-full resize-y rounded-2xl border border-(--border) bg-(--surface) p-4 font-mono text-[12px] leading-5 outline-none"
                  />
                </Field>
              </section>
            ) : null}
          </div>

          <div className="mt-6 text-xs text-(--muted)">
            Tip: click Save to write to localStorage. Then refresh the home page to see changes.
          </div>
        </div>
      </div>
    </main>
  );
}
