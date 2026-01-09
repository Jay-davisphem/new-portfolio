
# Agent instructions: Next.js portfolio (design-accurate, JSON-driven, client-only admin)

You are building a personal portfolio website in this repository.

The UI must match `portfolio-design.png` **to the letter** (layout, spacing, typography, components, and responsive breakpoints). Treat the image as the source of truth.

This project must use **Next.js** for SEO.

There is **no backend**.
All portfolio content comes from a **single JSON file hosted on GitHub**. That JSON is **downloaded before the experience renders**, saved into the visitor device **localStorage**, and then used as the app’s data source.
No hardcoded portfolio content in components (except fallback placeholders for first ever load / error states).

An **admin experience** must exist so the owner can log in and update skills, images, projects, and experience using forms. Admin must edit the same JSON-shaped data in localStorage. Since there’s no backend, “saving” means updating localStorage and providing an **Export JSON** flow to copy/download the updated JSON to commit back to GitHub.

Animations and scrolling polish are required, but must be efficient and performance-minded.

---

## Non‑negotiable requirements

1. **Design fidelity**
	 - Implement sections and UI exactly like `portfolio-design.png`.
	 - Desktop + mobile layouts must mirror the image.
	 - Use a consistent spacing system; don’t “approximate”.
	 - Do not change copy hierarchy: headings, subheadings, button styles, cards, icons.
	 - Implement the navigation items seen (e.g., Home, About, Personal Photo, Contact, “See My Work”).

2. **Data-driven only**
	 - All content must come from the downloaded GitHub JSON that is stored in localStorage.
	 - Components should render from a typed `PortfolioData` object.
	 - Only allow minimal safe UI fallbacks when data is missing.

3. **Client-only admin**
	 - Provide an admin login gate.
	 - Provide forms to edit every content area.
	 - Provide import/export JSON.
	 - No server, no database.

4. **SEO via Next.js**
	 - Use Next.js metadata APIs and semantic HTML.
	 - Ensure share previews and structured data where applicable.
	 - Avoid client-only rendering for the entire site unless unavoidable; prefer SSR/SSG where feasible.
		 - Because the JSON is fetched from GitHub, use a strategy that keeps the public site indexable:
			 - Prefer fetching the JSON at build time or server-side when possible, *while still* caching it into localStorage on the client for subsequent loads.
			 - If the JSON URL is only known at runtime, implement a server-side fetch route that proxies it (still no DB).

5. **Smooth scroll + efficient animations**
	 - Use GPU-friendly transforms (translate/opacity), avoid layout thrash.
	 - Respect `prefers-reduced-motion`.
	 - Keep animation libraries lightweight; if using Framer Motion, scope it carefully.
	 - Lighthouse performance should not be degraded by animations.

---

## Product “contract” (what we’re building)

### Public site
- Input: `PortfolioData` loaded from GitHub JSON (and cached in localStorage).
- Output: a single-page portfolio matching `portfolio-design.png` with sections:
	- Header/nav with CTA button
	- Hero (avatar + headline + primary CTA)
	- Featured projects grid cards
	- Skills & expertise list/grid
	- Newsletter/email capture block (client-only)
	- Footer links + social icons
	- Mobile nav (hamburger)
- Error modes:
	- First load: show a skeleton while JSON downloads.
	- Fetch failure: show graceful error + “Retry” + render last cached localStorage data if available.

### Admin
- Input: admin password/passphrase (never stored in plaintext).
- Output: forms that edit the `PortfolioData` in localStorage, plus export/import.
- Security model: best-effort client-only (not “real security”):
	- Use WebCrypto to hash passphrase + store only salted hash in localStorage.
	- Use session-only unlock state (sessionStorage) with short inactivity timeout.
	- Make it clear that anyone with device access can bypass; this is acceptable given constraints.

---

## Data sourcing & caching rules

### JSON source
- The JSON is hosted on GitHub (raw URL).
- Use an environment variable for the URL:
	- `NEXT_PUBLIC_PORTFOLIO_JSON_URL` (raw GitHub URL)

### Local caching
- localStorage keys (exact):
	- `portfolio:data:v1` → stringified `PortfolioData`
	- `portfolio:etag:v1` → ETag (if provided)
	- `portfolio:lastFetchedAt:v1` → epoch ms
	- `portfolio:admin:hash:v1` → password hash blob (base64)
	- `portfolio:admin:salt:v1` → salt (base64)

### Fetch timing
- On first visit:
	1) Show skeleton
	2) Fetch JSON
	3) Validate JSON shape
	4) Save to localStorage
	5) Render
- On subsequent visits:
	1) Read localStorage and render immediately
	2) Revalidate in background (If-None-Match with ETag when possible)
	3) If new data arrives, update UI with subtle non-jarring transition

### Validation
- Validate data before saving:
	- required keys exist
	- arrays are arrays
	- URLs are valid where required
	- images must be HTTPS
	- strip any executable HTML; treat strings as plain text
- If validation fails:
	- don’t overwrite cached data
	- surface error in a non-intrusive toast/banner

---

## JSON schema (shape)

Implement and use this base shape (extend as needed, but keep backward compatibility):

- `version`: string (e.g. "1")
- `profile`:
	- `name`: string
	- `roleHeadline`: string (e.g. "I craft digital experiences.")
	- `heroCtaText`: string (e.g. "See My Work")
	- `avatarImage`:
		- `src`: string (absolute URL)
		- `alt`: string
- `navigation`: array of `{ label: string; href: string }`
- `featuredProjects`:
	- `title`: string (e.g. "FEATURED PROJECTS")
	- `items`: array of
		- `title`: string
		- `description`: string
		- `image`:
			- `src`: string
			- `alt`: string
		- `ctaLabel`: string (e.g. "View Case Study")
		- `ctaHref`: string
- `skills`:
	- `title`: string (e.g. "SKILLS & EXPERTISE")
	- `items`: array of
		- `label`: string
		- `icon`: string (icon key, e.g. "uiux", "frontend")
- `newsletter`:
	- `enabled`: boolean
	- `title`: string
	- `description`: string
	- `placeholder`: string (email input placeholder)
	- `buttonText`: string
- `footer`:
	- `columns`: array of `{ title: string; links: { label: string; href: string }[] }`
	- `social`: array of `{ type: string; href: string }`
	- `copyright`: string

Notes:
- Keep `href` values absolute or site-relative.
- Images in JSON should be CDNs/hosted assets (GitHub raw URLs are allowed but may be slow; allow either).

---

## Design & UX details taken from `portfolio-design.png`

Implement these faithfully:

- **Header**
	- Left: name/brand ("Alex" in sample; must be data-driven)
	- Center/right: nav links (Home/About/Personal Photo/Contact)
	- Primary button: “See My Work”
	- Mobile: hamburger menu with slide-out or dropdown

- **Hero**
	- Large avatar card on the left
	- Hero headline on right: "Hi, I’m {name}. I craft digital experiences."
	- Primary CTA below headline

- **Featured projects**
	- Section heading style matches image
	- 3-card grid on desktop, stacked on mobile
	- Each card contains image, title, description, CTA link

- **Skills & expertise**
	- Icon chips/pills or mini-cards matching image
	- Keep icon + label aligned and consistent

- **Newsletter block**
	- Email field + subscribe button, same alignment and spacing
	- No actual backend submission; store email in localStorage and show success toast
	- Provide optional `mailto:` action as fallback

- **Footer**
	- 3 columns (About Us / Company / Contact) with links
	- Social icons row
	- Bottom copyright line

---

## Animation + scrolling guidelines

- Use subtle entrance animations:
	- hero text fade/slide
	- cards stagger in when in viewport
	- hover lift on project cards
	- button micro-interactions
- Use IntersectionObserver (or library helper) to trigger animations.
- Avoid animating height/width; prefer `transform` and `opacity`.
- Include `prefers-reduced-motion` support: disable non-essential animations.
- Keep scroll smooth:
	- use CSS `scroll-behavior: smooth` for anchor links
	- provide section IDs matching nav hrefs

---

## Editable admin features (must build)

### Routes
- `/admin` login
- `/admin/editor` content editor (requires auth)

### Editor capabilities
- Edit profile (name/headline/avatar)
- Add/edit/reorder featured projects
- Add/edit/reorder skills (select icon key)
- Edit footer columns + links
- Toggle newsletter section

### Import / export
- Export:
	- Download JSON file
	- Copy to clipboard
- Import:
	- Paste JSON text
	- Upload JSON file
	- Validate and then write to localStorage

### Images
- Store images as URLs in JSON.
- Provide an optional helper in admin:
	- Accept image URL
	- Live preview thumbnail
	- Validate HTTPS and common image extensions

---

## Engineering constraints & conventions

- Prefer Next.js App Router.
- Prefer TypeScript.
- Prefer Tailwind CSS for fast, consistent styling.
- Use a component structure like:
	- `src/app` routes
	- `src/components` presentational components
	- `src/lib` data fetching, validation, storage, auth utilities
	- `src/styles` for globals

### Accessibility
- Semantic landmarks (`header`, `main`, `section`, `footer`).
- All images have `alt`.
- Buttons and links are keyboard accessible.
- Color contrast meets WCAG AA.

### Performance
- Optimize images (Next `<Image>` where feasible).
- Code split heavy admin/editor dependencies.
- Keep animation library imports scoped.

---

## Quality gates (must pass before you finish)

Report these as PASS/FAIL after changes:
- Build
- Lint/Typecheck
- Tests

Minimum tests to add when implementing:
- JSON validation unit tests (good + bad)
- localStorage caching behavior tests (load cached vs fetch)
- admin auth utility tests (hash/verify)

---

## What “done” means

- Public portfolio renders from GitHub JSON, caches to localStorage, revalidates.
- UI matches `portfolio-design.png` precisely on desktop and mobile.
- Smooth scrolling and performant animations exist.
- Admin login + editor can update all content, and export JSON for GitHub.
- SEO metadata is correct and pages are indexable.

