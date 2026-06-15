# Atlanta TV Mount Pro — Image Reference Guide

All images are stored locally under `public/images/` and served from the root
path `/images/...`.  To replace any image, drop your file into the folder shown
and use the exact filename listed.  The site will pick it up automatically on
the next page load — no code changes required.

---

## Logo

| File path | Used in | Displayed size | Notes |
|-----------|---------|---------------|-------|
| `/images/logo/logo.png` | Header (desktop + mobile), Footer, Admin login screen, Admin sidebar, Admin mobile header | `h-12` (normal) / `h-8` (scrolled) in Header · `h-12` in Footer · `h-10` in Admin login · `h-7` in Admin sidebar · `h-6` in Admin mobile header | Transparent-background PNG recommended. Width scales automatically. Minimum source width: **300 px**. |

---

## Hero Carousel (Home page full-screen slides)

| File path | Slide | Displayed size | Recommended source size |
|-----------|-------|---------------|------------------------|
| `/images/hero/hero-tv-mounting.jpg` | Slide 1 — "Professional TV Mounting" | Full viewport width × 100dvh (fills screen) | **1920 × 1080 px** minimum, landscape |
| `/images/hero/hero-drywall.jpg` | Slide 2 — "Drywall Repair Experts" | Full viewport width × 100dvh | **1920 × 1080 px** minimum, landscape |
| `/images/hero/hero-painting.jpg` | Slide 3 — "Professional Painting" | Full viewport width × 100dvh | **1920 × 1080 px** minimum, landscape |

> Images have a dark gradient overlay applied in CSS so the white text is readable.
> High-contrast subjects work best.  Avoid images with important details in the
> top-left or bottom-right corners (nav and CTA buttons overlap those areas).

---

## Page Hero Banners (inner pages)

Each inner page has a full-width banner rendered by `PageHero.jsx`.
Dimensions: **full viewport width × 380 px** (fixed height, `object-cover`).

| File path | Page | Alt text |
|-----------|------|----------|
| `/images/about/about-hero.jpg` | About page hero + story section image | "Professional handyman at work" |
| `/images/pages/page-team.jpg` | Team page hero | "Professional technicians at work" |
| `/images/pages/page-testimonials.jpg` | Testimonials page hero | "Happy homeowner" |
| `/images/pages/page-projects.jpg` | Projects page hero | "Professional project work" |
| `/images/pages/page-contact.jpg` | Contact page hero | "Atlanta cityscape" |

> **Recommended source size:** 1920 × 760 px (landscape).
> The banner is cropped to 380 px tall on desktop and centres the image.
> Keep important subjects in the vertical middle of the image.

---

## Services

Used on the **Services page** (alternating image/text cards, `min-h-[300px]`)
and on the **Home page** featured services section.

| File path | Service | Displayed size |
|-----------|---------|---------------|
| `/images/services/service-tv-mounting.jpg` | TV Mounting | `min-h-[300px]`, `object-cover`, 50 % of card width on desktop |
| `/images/services/service-drywall.jpg` | Drywall Repair | same |
| `/images/services/service-painting.jpg` | Painting | same |
| `/images/services/service-carpentry.jpg` | Carpentry | same |
| `/images/services/service-flooring.jpg` | Flooring | same |
| `/images/services/service-plumbing.jpg` | Plumbing | same |
| `/images/services/service-electrical.jpg` | Light Electrical | same |

> **Recommended source size:** 900 × 600 px (3:2 landscape).
> `service-tv-mounting.jpg` and `service-drywall.jpg` are also used as
> featured-service card backgrounds on the Home page (same file, different
> context).

---

## Team Member Photos

Used on the **Team page** in a square card (`aspect-square`, `object-cover`).

| File path | Member (static fallback) | Displayed size |
|-----------|--------------------------|---------------|
| `/images/team/team-1.jpg` | Marcus Thompson | Square, ~280 × 280 px rendered |
| `/images/team/team-2.jpg` | James Rodriguez | same |
| `/images/team/team-3.jpg` | Kevin Patel | same |
| `/images/team/team-4.jpg` | Andre Williams | same |
| `/images/team/team-placeholder.jpg` | Default when no photo is set in PocketBase | same |

> **Recommended source size:** 600 × 600 px (square, 1:1).
> Face should be centred.  The card crops the image to a perfect square.
> When a team member is added via the Admin panel and has a PocketBase photo URL,
> that URL takes precedence over these static files.

---

## Admin Panel

| File path | Used in | Displayed size |
|-----------|---------|---------------|
| `/images/admin/admin-avatar.jpg` | Admin profile section default avatar | 96 × 96 px (rounded circle) |

> **Recommended source size:** 200 × 200 px (square).
> Shown only when no custom avatar is set.

---

## Folder structure summary

```
public/
└── images/
    ├── logo/
    │   └── logo.png                  ← Site logo (all instances)
    ├── hero/
    │   ├── hero-tv-mounting.jpg      ← Hero slide 1 + Services hero
    │   ├── hero-drywall.jpg          ← Hero slide 2
    │   └── hero-painting.jpg         ← Hero slide 3
    ├── about/
    │   └── about-hero.jpg            ← About page hero + story image
    ├── services/
    │   ├── service-tv-mounting.jpg
    │   ├── service-drywall.jpg
    │   ├── service-painting.jpg
    │   ├── service-carpentry.jpg
    │   ├── service-flooring.jpg
    │   ├── service-plumbing.jpg
    │   └── service-electrical.jpg
    ├── team/
    │   ├── team-1.jpg
    │   ├── team-2.jpg
    │   ├── team-3.jpg
    │   ├── team-4.jpg
    │   └── team-placeholder.jpg      ← Fallback for missing team photos
    ├── pages/
    │   ├── page-team.jpg
    │   ├── page-testimonials.jpg
    │   ├── page-projects.jpg
    │   └── page-contact.jpg
    └── admin/
        └── admin-avatar.jpg          ← Admin profile default avatar
```

---

## How to replace an image

1. Prepare your replacement file at the recommended dimensions.
2. Name it **exactly** as shown in the table above (same filename, same extension).
3. Drop it into the correct folder under `public/images/`.
4. Reload the page in your browser — the new image will appear immediately.

No code changes are needed unless you want to change the filename or path,
in which case update the corresponding `src` value in the component listed in
the "Used in" column.

---

## Notes on image format

- **Logo:** PNG with transparency is strongly recommended.
- **Hero / page heroes:** JPG is fine.  Keep file size under 400 KB for fast
  load times.  Use a tool like [Squoosh](https://squoosh.app) or
  [TinyJPG](https://tinyjpg.com) to compress before uploading.
- **Service / team images:** JPG, 150–250 KB target.
- **WebP** is supported by all modern browsers and will produce smaller files
  if your tooling can output it — just rename the `src` path accordingly.
