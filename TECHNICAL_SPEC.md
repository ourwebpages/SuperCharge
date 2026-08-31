# Technical Specification

## Project: SuperCharge — Interactive 3D Studio Website

**Version:** 1.0
**Companion to:** `PRD.md`, `AI\\\_BUILD\\\_GUIDELINES.md`

\---

## 1\. Tech Stack

|Layer|Choice|Rationale|
|-|-|-|
|Framework|Next.js (React)|Fast routing, SSR/SSG for SEO on non-3D content, strong hackathon velocity|
|3D Rendering|Three.js via React Three Fiber (R3F)|Declarative 3D in React, large ecosystem, faster to build/debug than raw Three.js|
|3D Helpers|@react-three/drei|Prebuilt helpers (camera controls, loaders, environment maps, text) that save build time|
|Animation|GSAP (with ScrollTrigger) + React Three Fiber's `useFrame`|GSAP for timeline/scroll-driven sequencing; `useFrame` for per-frame 3D updates|
|Styling|Tailwind CSS|Fast, consistent utility styling for non-canvas UI (nav, text, forms)|
|State Management|React Context or Zustand (lightweight)|Avoid Redux overhead; only needed for loading state, scene state, active section|
|Forms/Backend|Formspree, Resend, or a minimal serverless function|Fast to integrate without building a full backend|
|Hosting|Vercel|Native Next.js support, fast deploys, good for live demo reliability|
|3D Assets|glTF/GLB format, optimized via `gltf-transform` or Draco compression|Smallest file size with broad support in Three.js loaders|

If the builder is more comfortable with vanilla Three.js (no React), the same architecture applies conceptually — replace R3F components with direct Three.js scene/renderer setup and use vanilla JS modules instead of React components.

\---

## 2\. Architecture Overview

```
Browser
  └── Next.js App
        ├── Static/SSR pages (SEO shell, meta tags, fallback content)
        ├── Canvas Layer (React Three Fiber)
        │     ├── Scene Manager (controls active scene/section state)
        │     ├── Camera Rig (scroll or state-driven camera movement)
        │     ├── Lighting Setup
        │     ├── Models/Geometry per section
        │     └── Post-processing (bloom, DOF — used sparingly)
        ├── DOM UI Layer (overlaid on canvas)
        │     ├── Navigation
        │     ├── Section text content (About, Work, Services, Contact)
        │     └── Loading Screen
        └── API Routes (contact form handling)
```

The DOM UI layer sits above the WebGL canvas using CSS layering (`position: fixed`/`absolute` with appropriate z-index), not inside the 3D scene, so text remains crisp, accessible, and SEO-crawlable.

\---

## 3\. Folder Structure

```
/app
  /components
    /canvas          -> all R3F components (Scene, Camera, Models, Lights)
    /ui              -> DOM components (Nav, Sections, Buttons, Forms)
    /layout          -> Loading screen, page shell
  /hooks             -> custom hooks (useScrollProgress, useDeviceCapability)
  /lib               -> utilities (asset loader config, analytics, form handler)
  /public
    /models          -> .glb/.gltf assets
    /textures         -> compressed image/texture assets
  /styles            -> global Tailwind config/overrides
  /api
    /contact         -> serverless function for form submission
  page.tsx           -> main landing/route entry
  layout.tsx         -> root layout, metadata, fonts
```

\---

## 4\. Page / Section Breakdown

### 4.1 Hero

* **3D content:** Single centerpiece object or particle/geometry field representing the brand concept.
* **Camera:** Static or slow idle motion (subtle parallax on cursor move).
* **UI overlay:** Name/title, one-line positioning statement, scroll-down indicator.
* **Interaction:** Cursor-reactive lighting or subtle object rotation tied to pointer position.

### 4.2 About

* **3D content:** Continuation of the same environment (avoid a hard scene cut) — camera moves to a new vantage point.
* **UI overlay:** Bio copy, optional skill/tool cluster rendered as small 3D icons or tags.

### 4.3 Work / Portfolio

* **3D content:** Each project represented as a distinct object/node in the scene; scrolling or clicking moves the camera to focus on each.
* **UI overlay:** Project title, short description, outcome, external link — appears when a node is focused.
* **Interaction:** Click/tap to "open" a project node for detail view; click again or navigate away to close.

### 4.4 Services / Capabilities

* **3D content:** Optional — can be a lighter-weight section with reduced 3D complexity to conserve performance budget.
* **UI overlay:** 3–5 capability cards with concise descriptions.

### 4.5 Contact

* **3D content:** Return to a calmer variant of the hero environment, signaling closure of the journey.
* **UI overlay:** Contact form or direct email/social links.
* **Functionality:** Form submits to serverless endpoint; success/error state shown inline.

### 4.6 Loading Screen

* Shows real asset load progress using `useProgress` from drei (or equivalent manual tracking in vanilla Three.js).
* Fades out only after critical assets for the hero are ready; remaining assets can lazy-load in the background.

\---

## 5\. Camera \& Scroll System

* Recommended approach: scroll position mapped to a normalized `0–1` progress value.
* GSAP ScrollTrigger (or a custom scroll listener) drives:

  * Camera position/rotation along a predefined path
  * Object opacity/scale transitions between sections
  * DOM overlay fade in/out synced to camera focus
* Scroll should be smoothed (lerped) rather than directly 1:1 with raw scroll delta, to avoid jarring motion.
* Provide a non-scroll fallback (e.g., next/prev buttons or swipe) for accessibility and mobile.

\---

## 6\. Performance Budget

|Asset Type|Budget|
|-|-|
|Total initial JS bundle (gzipped)|< 500KB excluding 3D assets|
|3D models (compressed, initial view)|< 3MB combined|
|Textures|Use compressed formats (KTX2/Basis where possible); max 2K resolution unless justified|
|Draw calls|Keep under \~100 for the primary scene where feasible|
|Polygon count|Budget per hero object: under 50k triangles unless performance testing shows headroom|
|Target frame rate|60fps desktop/discrete GPU, 30fps minimum on integrated graphics/mobile|

Testing checklist before demo:

* \[ ] Test on a non-development machine (not just the builder's high-spec laptop)
* \[ ] Run Chrome DevTools Performance profile during scroll-heavy interaction
* \[ ] Run Lighthouse audit (performance, accessibility, SEO)
* \[ ] Test with throttled CPU (4x slowdown) to simulate lower-end hardware

\---

## 7\. Responsive \& Fallback Strategy

* Detect device capability (e.g., via a lightweight check of GPU tier, `navigator.hardwareConcurrency`, or screen width) to decide scene complexity tier: **full**, **reduced**, or **static fallback**.
* **Reduced tier:** simplify geometry, disable post-processing, reduce particle counts.
* **Static fallback:** replace canvas with high-quality static renders/images of the same scenes, preserving all text content and navigation.
* Always respect `prefers-reduced-motion`: disable camera auto-motion and large parallax effects when set.

\---

## 8\. Accessibility Requirements

* All DOM UI must be keyboard-navigable (tab order matches visual order).
* Canvas-only interactions (e.g., clicking a 3D project node) must have an equivalent DOM control (e.g., a hidden or visible list of project links) so screen reader users are not blocked.
* Color contrast for all overlay text: minimum WCAG AA (4.5:1 for body text).
* Provide `alt`/ARIA labeling for the static fallback images.

\---

## 9\. SEO Requirements

* Use Next.js metadata API for title, description, and Open Graph/Twitter card tags per route.
* Ensure semantic HTML (headings, landmarks) exists in the DOM overlay layer even though the primary visual is a canvas.
* Provide a text-based sitemap of content (About, Work, Services, Contact) crawlable independent of WebGL execution.

\---

## 10\. Deployment Checklist

* \[ ] Environment variables (form API keys, etc.) set in hosting platform, not committed to repo
* \[ ] Custom domain (if available) configured
* \[ ] 404 page styled consistently with site (not default framework error page)
* \[ ] Analytics (optional) added post-hackathon, not required for v1
* \[ ] Final smoke test on production URL, not just local/staging

\---

## 11\. Testing Matrix

|Device/Browser|Priority|Notes|
|-|-|-|
|Desktop Chrome (discrete GPU)|Critical|Primary demo environment assumption|
|Desktop Chrome (integrated GPU/laptop)|Critical|Represents judge hardware realistically|
|Desktop Safari/Firefox|High|Catch WebGL/shader inconsistencies|
|Mobile Safari (iOS)|High|Common judge/reviewer secondary check|
|Mobile Chrome (Android, mid-range)|Medium|Validate fallback tier triggers correctly|

\---

## 12\. Content Management Approach

Content (text, project entries, section copy) must be editable without touching component or 3D logic. This keeps updates fast during the hackathon and afterward, even for someone not comfortable in React/Three.js code.

### 12.1 Single Content File

All copy lives in one file: `/lib/content.ts`. Components import from it and render — they never contain hardcoded text.

```ts
// lib/content.ts
export const content = {
  hero: {
    title: "Your Name / Studio",
    subtitle: "A one-line statement of what you do.",
  },
  about: {
    // Plain text is fine here...
    bio: "Short bio paragraph goes here.",
    // ...or raw HTML when you need bold, links, or line breaks:
    bioHtml: "<p>I build <strong>interactive 3D experiences</strong> for brands who want to stand out.</p>",
  },
  work: \\\[
    {
      id: "project-1",
      title: "Project Name",
      description: "What the project was and the problem it solved.",
      outcome: "The result, in one sentence.",
      link: "https://example.com",
    },
    // Add or remove entries here — the Work section renders whatever is in this array.
  ],
  services: \\\[
    { title: "Service One", description: "What this offering includes." },
  ],
  contact: {
    email: "you@example.com",
    socials: \\\[
      { label: "GitHub", url: "https://github.com/yourname" },
      { label: "LinkedIn", url: "https://linkedin.com/in/yourname" },
    ],
  },
};
```

### 12.2 Rendering HTML Fields

For any field that contains formatted HTML (like `bioHtml` above), render it with `dangerouslySetInnerHTML` in a small wrapper component:

```tsx
// components/ui/RichText.tsx
export function RichText({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ \\\_\\\_html: html }} />;
}
```

```tsx
// usage inside the About section
<RichText html={content.about.bioHtml} />
```

This is safe here because the HTML is content you write yourself, not something submitted by site visitors. Never pass user-submitted input (e.g. contact form fields) through `dangerouslySetInnerHTML`.

### 12.3 What This Gets You

* Adding a new project: add one object to the `work` array — no component changes needed.
* Rewriting the hero line or bio: edit a string in `content.ts` — no need to find it inside a component file.
* Occasional custom formatting (a bolded phrase, an inline link) inside a paragraph: write it as HTML in a `\\\*Html` field and it renders as-is.
* Rearranging section order still requires editing the page layout itself — this approach solves content editing, not structural/layout changes.

### 12.4 Optional Upgrade Path (Post-Hackathon)

If ongoing content editing becomes frequent, `/lib/content.ts` can later be replaced with a headless CMS (e.g., Sanity, Contentful) or MDX files per section without changing how components consume the data — they'd still just receive the same shaped object.

\---

## 13\. Open Technical Decisions

* \[ ] Single continuous 3D scene vs. discrete per-section scenes (continuous is more impressive but harder to optimize)
* \[ ] Whether custom shaders are used (adds visual distinctiveness but increases build risk/time)
* \[ ] Contact form backend choice (Formspree for speed vs. custom serverless function for control)

