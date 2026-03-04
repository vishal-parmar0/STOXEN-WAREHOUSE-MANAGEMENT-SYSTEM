# STOXEN — Design Specification

## Project Status (as of 2026)

All v1.0 modules, pages, and UI/UX described in this document are implemented in the current codebase. See PRD.md for backend/API status. The landing page, dashboard, and all app pages match the design system, color palette, spacing, and component library below. Any empty directories (e.g., components/landing) are intentional (monolithic landing component).

---
> **Version:** 2.0  
> **Date:** February 22, 2026  
> **Design References:** Dark minimal SaaS landing (animated-stoxen-landing) · Clean dashboard layout with responsive mobile drawer

---

## 1. Design Philosophy

Stoxen follows a **clean, minimal SaaS design** philosophy combining:
- **SwiftHaul Logistics** visual language for the public-facing landing page — bold typography, full-width sections, generous whitespace, dark/teal accent palette
- **ACRU Finance Dashboard** layout patterns for the authenticated application — 3-column layout, card-based stats, sidebar navigation, right info panel

### Core Principles
1. **Clarity over decoration** — Every element serves a purpose
2. **Consistency** — Same patterns, spacing, colors everywhere
3. **Hierarchy** — Important numbers are large; labels are small
4. **Accessibility** — 4.5:1+ contrast ratios, focus states, keyboard navigation
5. **Responsiveness** — Works from 375px mobile to 1920px desktop

---

## 2. Color System

### 2.1 Brand Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Teal 600** (Primary) | `#0d9488` | 13, 148, 136 | Primary buttons, active states, links, accent highlights |
| **Teal 700** | `#0f766e` | 15, 118, 110 | Button hover, active nav border |
| **Teal 500** | `#14b8a6` | 20, 184, 166 | Chart bars, progress indicators |
| **Teal 100** | `#ccfbf1` | 204, 251, 241 | Light teal backgrounds, hover states |
| **Teal 50** | `#f0fdfa` | 240, 253, 250 | Active nav item background, subtle tint |

### 2.2 Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Gray 900** | `#111827` | Page headings, hero text, dark sections, footer |
| **Gray 800** | `#1f2937` | Subheadings, sidebar dark variant |
| **Gray 700** | `#374151` | Body text (strong) |
| **Gray 500** | `#6b7280` | Muted text, labels, descriptions |
| **Gray 400** | `#9ca3af` | Placeholder text, disabled states |
| **Gray 200** | `#e5e7eb` | Borders, dividers, table lines |
| **Gray 100** | `#f3f4f6` | Page background, table row hover |
| **Gray 50** | `#f9fafb` | Section backgrounds, card subtle bg |
| **White** | `#ffffff` | Cards, modals, inputs, sidebar |

### 2.3 Semantic Colors

| Purpose | Color | Hex | Usage |
|---------|-------|-----|-------|
| **Success** | Green 500 | `#22c55e` | Stock IN badge, positive change, completed status |
| **Success Light** | Green 50 | `#f0fdf4` | Success badge background |
| **Warning** | Amber 500 | `#f59e0b` | Low stock badge, expiry warning, caution |
| **Warning Light** | Amber 50 | `#fffbeb` | Warning badge background |
| **Danger** | Red 500 | `#ef4444` | Out of stock, stock OUT badge, delete actions, errors |
| **Danger Light** | Red 50 | `#fef2f2` | Error badge background |
| **Info** | Blue 500 | `#3b82f6` | Informational, stock value card |
| **Info Light** | Blue 50 | `#eff6ff` | Info badge background |

### 2.4 Chart Colors (Recharts Palette)

```
Teal     : #0d9488  (primary series)
Teal-100 : #ccfbf1  (secondary/inactive bars)
Blue     : #3b82f6  (alternate series)
Amber    : #f59e0b  (warning data)
Green    : #22c55e  (positive data)
Red      : #ef4444  (negative data)
Gray-300 : #d1d5db  (grid lines, axis)
```

---

## 3. Typography

### 3.1 Font Families

| Font | Usage | Fallback Stack |
|------|-------|---------------|
| **Syne** | Landing page headings, hero headline, section titles, logo text, stats numbers | `'Syne', system-ui, sans-serif` |
| **Plus Jakarta Sans** | Primary UI font — body text, dashboard, labels, all non-heading text | `'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif` |
| **DM Mono** | Monospaced — quantities, SKUs, prices, codes | `'DM Mono', 'Fira Code', 'Courier New', monospace` |

All three fonts are loaded via Google Fonts in `index.css`. The landing page uses the `font-syne` utility class for display headings.

### 3.2 Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|---------------|-------|
| `display-xl` | 72px / 4.5rem | 800 | 1.0 | -2px | Landing hero heading |
| `display-lg` | 48px / 3rem | 700 | 1.1 | -1.5px | Section headings (landing) |
| `display-md` | 36px / 2.25rem | 700 | 1.2 | -1px | Dashboard stat numbers |
| `heading-xl` | 30px / 1.875rem | 700 | 1.3 | -0.5px | Page titles |
| `heading-lg` | 24px / 1.5rem | 600 | 1.3 | -0.5px | Card headers, section titles |
| `heading-md` | 20px / 1.25rem | 600 | 1.4 | 0 | Sub-section titles |
| `heading-sm` | 16px / 1rem | 600 | 1.4 | 0 | Card titles, nav items |
| `body-lg` | 16px / 1rem | 400 | 1.6 | 0 | Body text, paragraphs |
| `body-md` | 14px / 0.875rem | 400 | 1.5 | 0 | Default UI text, table cells |
| `body-sm` | 12px / 0.75rem | 400 | 1.4 | 0.2px | Labels, badges, captions |
| `body-xs` | 11px / 0.6875rem | 500 | 1.3 | 0.3px | Overline text, eyebrow labels |
| `mono-lg` | 20px / 1.25rem | 500 | 1.2 | 0 | Quantities, prices (DM Mono) |
| `mono-md` | 14px / 0.875rem | 400 | 1.4 | 0 | SKU codes, small numbers (DM Mono) |

---

## 4. Spacing System

Based on Tailwind's 4px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon padding, tight gaps |
| `space-2` | 8px | Badge padding, inline gaps |
| `space-3` | 12px | Small card padding, input padding-x |
| `space-4` | 16px | Standard gap, card padding, nav item padding |
| `space-5` | 20px | Section sub-gaps |
| `space-6` | 24px | Card padding (main), form field gaps |
| `space-8` | 32px | Section padding inner |
| `space-10` | 40px | Section padding vertical |
| `space-12` | 48px | Large section gaps |
| `space-16` | 64px | Landing page section vertical spacing |
| `space-20` | 80px | Hero section vertical padding |
| `space-24` | 96px | Landing page section vertical padding |

---

## 5. Border & Shadow System

### 5.1 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Badges, small pills |
| `rounded-md` | 6px | Inputs, buttons |
| `rounded-lg` | 8px | Cards, dropdowns |
| `rounded-xl` | 12px | Modal, large cards |
| `rounded-2xl` | 16px | Hero image frame, landing cards |
| `rounded-full` | 9999px | Avatars, pill badges, circular icons |

### 5.2 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Inputs, subtle lift |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` | Modals, floating panels |
| `shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` | Hero floating badges |

### 5.3 Borders

| Usage | Style |
|-------|-------|
| Default border | `1px solid #e5e7eb` |
| Active/focused input | `2px solid #0d9488` |
| Error input | `2px solid #ef4444` |
| Sidebar right border | `1px solid #e5e7eb` |
| Right panel left border | `1px solid #e5e7eb` |
| Table row border | `1px solid #f3f4f6` |

---

## 6. Component Library

### 6.1 Buttons

#### Primary Button
```
Background  : #0d9488 (teal-600)
Hover       : #0f766e (teal-700)
Text        : #ffffff
Padding     : 10px 20px
Border      : none
Radius      : 6px
Font        : 14px, weight 500
Shadow      : shadow-sm
Transition  : all 150ms ease
```

#### Secondary / Ghost Button
```
Background  : transparent
Hover       : #f0fdfa (teal-50)
Text        : #0d9488 (teal-600)
Border      : 1px solid #0d9488
Padding     : 10px 20px
Radius      : 6px
```

#### Dark Button (Landing Page)
```
Background  : #111827
Hover       : #1f2937
Text        : #ffffff
Padding     : 12px 24px
Radius      : 6px
```

#### Danger Button
```
Background  : #ef4444
Hover       : #dc2626
Text        : #ffffff
Padding     : 10px 20px
Radius      : 6px
```

#### Icon Button
```
Background  : transparent
Hover       : #f3f4f6
Size        : 36px × 36px
Radius      : 6px
Icon size   : 18px
```

### 6.2 Inputs

```
Background  : #ffffff
Border      : 1px solid #e5e7eb
Focus       : 2px solid #0d9488, ring: 0 0 0 3px rgba(13,148,136,0.1)
Text        : #111827
Placeholder : #9ca3af
Padding     : 10px 12px
Radius      : 6px
Font size   : 14px
Height      : 40px
Label       : 14px, weight 500, color #374151, margin-bottom 6px
Error text  : 12px, color #ef4444, margin-top 4px
```

### 6.3 Cards

#### Standard Card
```
Background  : #ffffff
Border      : 1px solid #e5e7eb
Radius      : 8px
Padding     : 24px
Shadow      : none (or shadow-sm on hover)
```

#### Stat Card (Dashboard)
```
Background  : #ffffff
Border      : 1px solid #e5e7eb
Radius      : 8px
Padding     : 20px
Top accent  : 3px solid [color based on card type]
              Teal for products, Blue for value,
              Amber for low stock, Green for orders
```

#### Dark Card (Landing Page)
```
Background  : #111827
Border      : none
Radius      : 16px
Padding     : 32px
Text        : #ffffff
```

### 6.4 Badges / Pills

| Type | Background | Text | Border |
|------|-----------|------|--------|
| **Stock IN** | `#f0fdf4` | `#22c55e` | none |
| **Stock OUT** | `#fef2f2` | `#ef4444` | none |
| **Adjustment** | `#fffbeb` | `#f59e0b` | none |
| **Pending** | `#fffbeb` | `#f59e0b` | none |
| **Approved** | `#eff6ff` | `#3b82f6` | none |
| **Processing** | `#f0fdfa` | `#0d9488` | none |
| **Completed** | `#f0fdf4` | `#22c55e` | none |
| **Cancelled** | `#f3f4f6` | `#6b7280` | none |
| **Low Stock** | `#fffbeb` | `#f59e0b` | none |
| **Out of Stock** | `#fef2f2` | `#ef4444` | none |
| **Admin** | `#f0fdfa` | `#0d9488` | none |
| **Manager** | `#eff6ff` | `#3b82f6` | none |
| **Staff** | `#f3f4f6` | `#374151` | none |
| **Teal Pill** (Landing) | `#f0fdfa` | `#0d9488` | `1px solid #ccfbf1` |

```
All badges:
  Padding     : 2px 8px
  Radius      : 9999px
  Font        : 12px, weight 500
  Display     : inline-flex, align-center
```

### 6.5 Tables

```
Header row:
  Background  : #f9fafb
  Font        : 12px, weight 600, #6b7280, uppercase
  Padding     : 12px 16px
  Border-bottom: 1px solid #e5e7eb

Body row:
  Background  : #ffffff
  Hover       : #f9fafb
  Font        : 14px, #374151
  Padding     : 12px 16px
  Border-bottom: 1px solid #f3f4f6

Striped alt   : Not used (hover only)
```

### 6.6 Modal / Dialog

```
Overlay       : rgba(0, 0, 0, 0.5), backdrop-blur: 2px
Container     : #ffffff, max-width 520px, radius 12px, shadow-xl
Header        : padding 24px 24px 0, heading-lg
Body          : padding 16px 24px
Footer        : padding 0 24px 24px, flex, justify-end, gap 12px
Close button  : top-right, 36x36px icon button
Animation     : fade-in 150ms + scale from 0.95
```

### 6.7 Sidebar Navigation Item

```
Default:
  Padding       : 10px 16px
  Radius        : 6px
  Font          : 14px, weight 400, #6b7280
  Icon          : 18px, #9ca3af
  Margin        : 2px 0

Hover:
  Background    : #f9fafb
  Text          : #374151
  Icon          : #374151

Active:
  Background    : #f0fdfa
  Text          : #0d9488
  Icon          : #0d9488
  Font weight   : 500
  Left border   : 3px solid #0d9488 (on the nav item itself or sidebar edge)
  
Badge:
  Background    : #0d9488
  Text          : #ffffff
  Font          : 11px, weight 600
  Padding       : 1px 6px
  Radius        : full
  min-width     : 20px
  text-align    : center
```

### 6.8 Avatar

```
Size variants:
  sm : 32px × 32px
  md : 40px × 40px
  lg : 48px × 48px

Style:
  Radius        : 9999px (circle)
  Background    : #0d9488 (teal)
  Text          : #ffffff, weight 600
  Border        : 2px solid #ffffff
  
Stacked group:
  Overlapping avatars with -8px margin-left
  z-index increasing left to right
```

---

## 7. Landing Page — Single Component Design

The entire landing page is built as a **single monolithic component** (`animated-stoxen-landing.jsx`, ~540 lines) rather than split into separate section files. The `components/landing/` directory exists but is **empty**. A separate `navbar.jsx` component exists with a light/scroll-morphing variant but is not used by the landing page.

### 7.1 Inline Dark Navbar (Landing Only)

| Property | Value |
|----------|-------|
| Position | Fixed top, z-index 50 |
| Height | ~72px (py-5) |
| Background | Transparent initially; on scroll: `rgba(0,0,0,0.65)` with `backdrop-blur(18px)` |
| Border | On scroll: `1px solid rgba(255,255,255,0.07)` |
| Padding | `px-6 md:px-12`, max-width `7xl` centered |

**Left — Logo:**
- Warehouse building SVG logo (`/warehouse-logo.svg`) inverted to white via CSS filter
- Text "St**ox**en" where "ox" is `teal-400`
- Font: Syne, `1.15rem`, `font-bold`, `tracking-tight`

**Center — Nav Links:**
- Items: Features · Modules · About · FAQs · Contact
- Font: `0.875rem`, color `white/65`
- Hover: `white`
- Hidden below `md` breakpoint

**Right — CTAs:**
- "Login" → rounded-full ghost link, `white/65` text
- "Get Started →" → rounded-full teal-500 filled button with `shadow-lg shadow-teal-500/30`
- Both CTAs point to `/login` and `/signup` respectively

**Mobile (≤ 768px):**
- Hamburger/X toggle button with `bg-white/10` rounded-full
- Dropdown panel: `bg-black/92` with nav links + Login/Get Started buttons side by side

### 7.2 Hero Section

| Property | Value |
|----------|-------|
| Height | `min-h-[520px] sm:min-h-[680px]` (full viewport feel) |
| Background | Pure black `#000` with animated gradient dome (radial-gradient from `teal-500/30` and `teal-400/10`) + pillar silhouette SVG |
| Layout | Single column, centered text |

**Content (centered):**
1. **Eyebrow badge:** `bg-white/[0.06] border border-white/[0.1]` pill — "Warehouse Management · Free & Open"
2. **Heading (Syne, bold):**
   - Line 1: "Warehouse" — white, `text-[2.8rem] sm:text-[3.6rem] md:text-[4.5rem] lg:text-[5.5rem]`
   - Line 2: "Management" — gradient text (`teal-300` to `teal-500`)
3. **Subtext:** `text-white/50`, max-width `36rem`, `text-base sm:text-lg`
4. **CTA Row (flex, gap-3):**
   - Primary: Dark `bg-white text-black` pill button — "Get Started" → `/signup`
   - Secondary: `border border-white/20 text-white` pill button — "Login" → `/login`
5. **Stats strip (below hero text):**
   - 3 inline stats separated by `·`: "10+ Modules", "50+ Features", "100k+ Transactions"
   - Font: Syne, `text-white/25`, numbers in `text-white/60 font-bold`
6. **Trusted-by / Integrates banner:**
   - Muted text: "integrates with your workflow" + placeholder brand names
   - Positioned at bottom with large padding

**No right column** — this is a single-column centered hero (not the 2-column split from v1 design).

**No floating badges** — removed in favor of cleaner minimal look.

### 7.3 Features Section ("What We Offer")

| Property | Value |
|----------|-------|
| Padding | `py-16 md:py-20 lg:py-24` (compact — fits on single viewport) |
| Background | Black `#000` |
| Layout | Single column, 3-column card grid |

**Header:**
- Eyebrow: `▀ What We Offer` in teal-400 uppercase
- Heading: "Everything your warehouse needs" in Syne, white
- Subtext: white/40

**6 Feature Cards (3×2 grid, `gap-4`):**
Each card: `bg-white/[0.04] border border-white/[0.07]`, rounded-xl, `p-5`
- Icon: gradient teal circle (`h-10 w-10`), white Lucide icon inside
- Title: white, font-semibold
- Description: white/45, text-sm

Cards:
1. **Inventory Control** — Package icon
2. **Order Fulfilment** — ClipboardList icon
3. **Reports & Analytics** — BarChart3 icon
4. **Smart Alerts** — Bell icon
5. **Supplier CRM** — Truck icon
6. **Role-Based Access** — Shield icon

IntersectionObserver-driven staggered fade-in animation on scroll.

**CTA below cards:** `mt-10`, "Get Started Free" teal-500 pill button → `/signup`

### 7.4 How It Works Section ("Modules")

| Property | Value |
|----------|-------|
| Padding | `py-20 md:py-28` |
| Background | Black `#000` |

**Header:**
- Eyebrow: `▀ How It Works` in teal-400
- Heading: Syne, white

**3-Step Grid (responsive: 1 col → 3 cols):**
Each step card: `bg-white/[0.04] border border-white/[0.07]`, rounded-2xl, `p-7`
- Step number: `text-teal-400 font-bold` (01, 02, 03)
- Icon: `bg-gradient-to-br from-teal-500 to-teal-700`, rounded-xl, white Lucide icon
- Title: white, Syne font
- Description: white/45

Steps:
1. **Add Inventory** — Plus icon
2. **Track Movement** — ArrowLeftRight icon
3. **Gain Visibility** — BarChart3 icon

IntersectionObserver-driven staggered animation.

### 7.5 CTA Banner Section

| Property | Value |
|----------|-------|
| Background | `bg-teal-600` |
| Padding | `py-16 md:py-20` |
| Layout | Centered text |

- Heading: Syne, `text-3xl md:text-[2.6rem]`, white, bold
  - "Ready to take control of your warehouse?"
- Subtext: `text-teal-100/75`, max-w-xl
- CTA buttons (flex row):
  - "Get Started Free →" → white filled pill button → `/signup`
  - "Contact Us" → `border-white/30` outlined pill button → `mailto:stoxen@gmail.com`

### 7.6 FAQ Section

| Property | Value |
|----------|-------|
| Padding | `py-20 md:py-28` |
| Background | Black `#000` |

**Header:**
- Eyebrow: `▀ FAQs` in teal-400
- Heading: Syne, white

**Accordion:**
- 5 FAQ items with `FAQAccordion` sub-component
- Active item: `bg-white/[0.06]` background, teal chevron rotation
- Default: `bg-white/[0.03]`, `text-white/80`
- Question font: `text-[0.95rem]`, white
- Answer font: `text-[0.85rem]`, `text-white/50`, `leading-relaxed`
- Chevron: `ChevronDown`, rotates 180° on open

FAQs:
1. Is Stoxen really free?
2. How many warehouses can I manage?
3. Can I export reports?
4. Is there a mobile app?
5. How do I add my team?

### 7.7 Footer

| Property | Value |
|----------|-------|
| Background | Black `#000`, `border-t border-white/[0.06]` |
| Padding | `pt-16 pb-10` |

**Grid (5 columns on large, responsive collapse):**

| Column | Content |
|--------|---------|
| **Brand** | Warehouse logo SVG (inverted) + "Stoxen" (teal accent) + tagline + "Moving Goods. Powering Businesses." |
| **Product** | Dashboard, Inventory, Reports, Analytics |
| **Company** | About, FAQs, Get Started, Home |
| **Contact** | stoxen@gmail.com, +91 934 0459 |
| **Social** | Twitter, LinkedIn, GitHub, Email icons |

Link style: `text-white/30`, hover: `text-white/60`
Copyright: `© 2026 Stoxen · All rights reserved.`

**No massive faded text** — removed in v2 for cleaner look.

---

## 8. Dashboard (App) — Layout Specification

### 8.1 Overall Layout

```
┌──────────────────────────────────────────────────────────────┐
│ 240px Sidebar  │       Main Content Area      │ 280px Panel  │
│                │                               │              │
│  Logo          │  Topbar (search, bell, user)  │  Stock       │
│  ─────────     │  ─────────────────────────── │  Overview    │
│                │                               │              │
│  Navigation    │  Stats Cards (4 cols)         │  Donut       │
│  · Dashboard   │                               │  Chart       │
│  · Inventory   │  Chart + Alerts (2 cols)      │              │
│  · Transactions│                               │  Top         │
│  · Suppliers   │  Recent Transactions Table    │  Suppliers   │
│  · Orders      │                               │              │
│  ─────────     │                               │  Expiry      │
│  · Reports     │                               │  Alerts      │
│  · Alerts      │                               │              │
│  ─────────     │                               │              │
│  · Users       │                               │              │
│  · Settings    │                               │              │
│                │                               │              │
│  ─────────     │                               │              │
│  User Card     │                               │              │
│  Collapse <<   │                               │              │
└──────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Page background | `#f3f4f6` |
| Sidebar width | 240px (collapsed: 64px, mobile drawer: 256px) |
| Main content padding | `p-3 sm:p-4 lg:p-6` |
| Main content margin-left | Desktop: sidebar width; Mobile: 0 |
| Gap between cards | 24px |
| Mobile breakpoint | `< 1024px` (`lg`) triggers mobile drawer mode |

### 8.2 Sidebar (Column 1)

| Property | Value |
|----------|-------|
| Width | 240px fixed |
| Background | `#ffffff` |
| Border | Right 1px `#e5e7eb` |
| Padding | 24px 16px |

**Logo:** "St**ox**en" — 24px bold, teal accent on "ox"

**Navigation Groups:**

**MAIN:**
| Item | Icon (Lucide) | Badge |
|------|--------------|-------|
| Dashboard | `LayoutDashboard` | — |
| Inventory | `Package` | — |
| Transactions | `ArrowLeftRight` | Count (e.g. "19") |
| ↳ History | — | — |
| ↳ Stock IN | — | — |
| ↳ Stock OUT | — | — |
| Suppliers | `Truck` | — |
| Orders | `ClipboardList` | — |

**MANAGEMENT:**
| Item | Icon | Badge |
|------|------|-------|
| Reports | `BarChart3` | — |
| Alerts | `Bell` | Unread count |

**ADMIN ONLY (hidden from staff):**
| Item | Icon | Badge |
|------|------|-------|
| Users | `Users` | — |
| Settings | `Settings` | — |

**Group Separator:** 1px gray-200 line + 16px vertical gap + "MANAGEMENT" / "ADMIN" label in body-xs, gray-400, uppercase

**Bottom Section:**
- User info card: Avatar (32px) + Name + Role badge
- "Collapse sidebar" button: `ChevronsLeft` icon + text

**Collapsed State (64px width — desktop only):**
- Icons only, centered
- Tooltip on hover showing label
- Logo shows icon only
- Collapse toggle hidden on mobile

**Mobile Drawer (below 1024px):**
- Width: 256px, always expanded (never collapsed mode)
- Translation: `-translate-x-full` → `translate-x-0` with `transition-transform duration-300`
- Fixed position, z-50, full height
- X close button at top-right of sidebar
- Navigation clicks auto-close sidebar
- Backdrop: `bg-black/40 backdrop-blur-sm` overlay, click to close

### 8.3 Topbar

| Property | Value |
|----------|-------|
| Height | 64px |
| Background | Transparent (on top of gray-100 page bg) |
| Padding | `px-3 sm:px-4 lg:px-6` |
| Display | flex, space-between, align-center |

**Left:**
- **Mobile only:** Hamburger `Menu` icon button (triggers sidebar drawer)
- Page title: `text-lg sm:text-xl`, `#111827`, truncated on mobile
- Subtitle: "Good morning, Admin 👋" body-md, `#6b7280`

**Right (flex, gap 16px):**
- Search input: 240px, rounded-full, gray-100 bg, icon left — **hidden below `sm`**
- Bell icon button: With teal notification dot (8px, top-right)
- Settings gear icon button
- Divider: 1px vertical gray-200
- User avatar (36px) + Name + Email (truncated) + ChevronDown — **name/email hidden below `md`**

### 8.4 Dashboard Content

#### Row 1 — Stats Cards (4 columns)

| Card | Top Bar Color | Icon | Label | Value Example | Change Example |
|------|-------------|------|-------|--------------|---------------|
| Total Products | Teal `#0d9488` | Package 📦 | "Total Products" | "1,248" | "↑ 12 added this week" (green) |
| Stock Value | Blue `#3b82f6` | DollarSign 💰 | "Stock Value" | "₹4.2L" | "↑ 8.3% this month" (green) |
| Low Stock Items | Amber `#f59e0b` | AlertTriangle ⚠️ | "Low Stock Items" | "23" (amber) | "⚠ Needs attention" (amber) |
| Pending Orders | Green `#22c55e` | ClipboardList 📋 | "Pending Orders" | "47" | "↑ 5 since yesterday" (green) |

Each card structure:
```
┌─ 3px top colored border ──────────────┐
│  [Icon circle]    [Period dropdown]   │
│                                       │
│  Label (body-sm, gray-500)            │
│  Value (display-md, Plus Jakarta Sans)│
│  Change indicator (body-xs)           │
└───────────────────────────────────────┘
```

#### Row 2 — Two Columns (60/40 split)

**Left — Stock Movement Chart:**
- Header: "Stock Movement" heading-md + "7d ▾" period dropdown
- Recharts BarChart:
  - X-axis: Mon, Tue, Wed, Thu, Fri, Sat, Sun
  - Y-axis: Units
  - Bars: `#ccfbf1` (teal-100) default, `#0d9488` (teal-600) for selected/hovered
  - Tooltip: White bg, shadow-md, shows exact units
  - Grid: Horizontal dashed lines, `#e5e7eb`
- Height: 280px

**Right — Active Alerts Panel:**
- Header: "Active Alerts" heading-md
- Alert rows (max 5 visible + scroll):
  ```
  [Colored dot] [Product name]     [Qty badge]
  ```
  - Red dot = Out of Stock (qty = 0)
  - Amber dot = Low Stock (qty ≤ threshold)
  - Blue dot = Order pending
- "View all alerts →" link at bottom

#### Row 3 — Recent Transactions Table

- Header: "Recent Transactions" heading-md + "Last 10 stock movements" body-sm
- "View all →" teal link (right aligned)
- Table: Full width card, 6 columns

| Column | Width | Align | Style |
|--------|-------|-------|-------|
| Date & Time | 18% | Left | body-sm, gray-500 |
| Product | 25% | Left | body-md, gray-900, semi-bold |
| Type | 15% | Left | Badge (IN green, OUT red, ADJ amber) |
| Qty | 12% | Right | DM Mono, +green / -red |
| User | 15% | Left | body-md, with avatar |
| Status | 15% | Center | Colored pill badge |

### 8.5 Right Panel (Column 3)

| Property | Value |
|----------|-------|
| Width | 280px fixed |
| Background | `#ffffff` |
| Border | Left 1px `#e5e7eb` |
| Padding | 24px |
| Overflow | scroll-y (independent scroll) |

**Section 1 — Stock Overview:**
- Title: "Stock Overview" heading-md + "Quick stats" body-xs
- 2×2 mini-card grid (gap 12px):
  | Card | Value |
  |------|-------|
  | Total SKUs | "1,248" |
  | Active Suppliers | "34" |
  | Orders Today | "12" |
  | Expiring Soon | "5" |
- Each mini card: gray-50 bg, rounded-lg, padding 12px, small label + bold value

**Section 2 — Stock Distribution (Donut Chart):**
- Title: "Stock by Category" heading-sm
- Recharts PieChart (donut):
  - innerRadius: 55, outerRadius: 80
  - Segments: In Stock (teal, 64%), Low Stock (teal-100, 16%), Out of Stock (gray-300, 20%)
  - Center label: "64%" in heading-lg
- Legend below: 3 rows with colored dot + label + percentage

**Section 3 — Top Suppliers:**
- Title: "Top Suppliers" heading-sm + "7d ▾" mini dropdown
- List rows (max 5):
  ```
  [Square avatar - initials, teal bg] [Supplier name] [₹ value]
                                       [X products]
  ```
- Avatar: 36px rounded-lg (not circle), teal bg, white initials
- Value: DM Mono, right-aligned

**Section 4 — Expiry Alerts:**
- Title: "Expiring Soon" heading-sm
- Alert rows:
  ```
  [Red/Amber dot] [Product name]      [X days left]
                   [Batch: XXX]
  ```
  - Red (< 7 days), Amber (< 30 days)
  - Days: DM Mono, weight 500

---

## 9. Page-Level Designs

### 9.1 Login Page
- Centered card (max 420px), white bg, shadow-lg, rounded-2xl, padding 32px
- Logo: Teal-600 rounded-xl icon (Package) + "Stoxen" text link to home
- Subtitle: "Sign in to your warehouse"
- Fields: Email input + Password input (with show/hide toggle using Eye/EyeOff icons)
- Error message in red-50 bordered box
- Submit: Full-width teal-600 button with `LogIn` icon, loading spinner
- Demo credentials section: 3 pill buttons (Admin, Manager, Staff) that auto-fill
- Links below card: "Don't have an account? Sign up" (→ `/signup`) + "← Back to home" (→ `/`)
- Background: `bg-gray-100` with subtle `bg-gradient-to-br from-teal-50 via-transparent to-teal-50/30`

### 9.2 Signup Page
- Same visual style as Login Page (centered card, 420px, rounded-2xl)
- Logo: Same as Login
- Subtitle: "Create your account"
- Fields: Full name + Email + Password (with toggle) + Confirm password (with toggle)
- Validation: All fields required, password min 6 chars, passwords must match
- Submit: Full-width teal-600 button with `UserPlus` icon
- Links below: "Already have an account? Sign in" (→ `/login`) + "← Back to home"
- Auth: Calls `register()` from AuthContext → `POST /auth/register` (demo fallback creates mock staff user)

### 9.2 Inventory Page
- Top: "Inventory" heading + "Add Product" teal button
- Filters bar: Search, Category dropdown, Stock status dropdown
- Table: Name, SKU, Category, Qty, Price, Status, Actions
- Status column: In Stock (green), Low Stock (amber), Out (red)
- Actions: View, Edit, Delete (admin only)
- Pagination at bottom

### 9.3 Product Detail Page
- Breadcrumb: Inventory > Product Name
- Left: Product info card (name, SKU, category, supplier, prices, batch, expiry)
- Right: Stock action buttons (Stock IN, Stock OUT, Adjust)
- Bottom: Transaction history table for this product

### 9.4 Transactions Page
- Tabs: All | Stock IN | Stock OUT | Adjustments
- Filters: Date range, Product search
- Table: Date, Product, Type, Qty, Previous → New, User, Notes
- No edit/delete buttons (immutable)

### 9.5 Suppliers Page
- Top: "Suppliers" heading + "Add Supplier" button
- Cards or table view toggle
- Each: Name, Contact, Phone, City, Products supplied count
- Detail page: Supplier info + purchase history

### 9.6 Orders Page
- Tabs: All | Purchase | Dispatch
- Status filter: Pending, Approved, Processing, Completed, Cancelled
- Table: Order #, Type, Supplier/Customer, Date, Status, Value
- Status change via dropdown on detail page

### 9.7 Reports Page
- 5 report cards/tabs: Inventory, Transactions, Low Stock, Suppliers, Orders
- Each: Date range picker + filter options + preview table
- Export buttons: "Download PDF" + "Download CSV"

### 9.8 Alerts Page
- Filter tabs: All | Low Stock | Expiry | Order Status
- Alert rows with read/unread visual distinction
- "Mark all read" button
- Unread: bold text, teal-50 bg; Read: normal

### 9.9 Users Page (Admin only)
- Table: Name, Email, Role, Status, Last Login, Actions
- "Add User" button
- Role badges: Admin (teal), Manager (blue), Staff (gray)
- Toggle active/inactive

### 9.10 Settings Page (Admin only)
- Form sections: Warehouse Info, Alert Configuration
- Save button at bottom
- Fields: Name, Address, Phone, Email, Low Stock Days, Expiry Alert Days

---

## 10. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|---------------|
| `xl` | ≥ 1280px | Full layout — sidebar + main content (right panel visible on dashboard) |
| `lg` | 1024–1279px | Desktop sidebar (collapsible 240px/64px), main fluid |
| `md` | 768–1023px | **Mobile mode** — sidebar becomes slide-out drawer (256px) with overlay |
| `sm` | 640–767px | Single column content, stacked cards |
| `xs` | < 640px | Full mobile — stacked everything, hamburger menu |

**Mobile Adaptations (below 1024px / `lg`):**
- Sidebar: Slide-out drawer from left (`-translate-x-full` → `translate-x-0`), 256px wide, always expanded (never collapsed icon mode), `bg-black/40 backdrop-blur-sm` overlay, X close button
- Topbar: Hamburger `Menu` icon appears, search bar hidden below `sm`, user name hidden below `md`
- Stats cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Right panel (dashboard): Visible on all screens with `grid-cols-1 sm:grid-cols-2 xl:grid-cols-1`
- Page headers: `flex-wrap` with buttons wrapping to new line
- Tabs: `w-full sm:w-fit overflow-x-auto` for horizontal scrolling
- Tables: Horizontal scroll wrapper
- Content padding: `p-3 sm:p-4 lg:p-6`
- Main content margin: `0` on mobile (no sidebar offset)

---

## 11. Motion & Animation

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transitions | Fade in + slide up 8px | 200ms | `ease-out` |
| Modal open | Fade in + scale from 0.95 | 150ms | `ease-out` |
| Modal close | Fade out + scale to 0.95 | 100ms | `ease-in` |
| Sidebar collapse | Width transition | 200ms | `ease-in-out` |
| Dropdown open | Fade in + slide down 4px | 150ms | `ease-out` |
| Hover transitions | Color, background, shadow | 150ms | `ease` |
| Toast notification | Slide in from right | 200ms | `ease-out` |
| Toast dismiss | Fade out + slide right | 150ms | `ease-in` |
| Loading spinner | Rotate 360° | 800ms | `linear`, infinite |
| Skeleton pulse | Opacity 0.5 → 1 | 1500ms | `ease-in-out`, infinite |
| FAQ accordion | Height auto transition | 200ms | `ease-in-out` |
| Chart bars | Scale up from 0 | 400ms | `ease-out`, staggered |
| Count up (stats) | Number increment | 800ms | `ease-out` |
| Floating badges (hero) | Float up/down 8px | 3000ms | `ease-in-out`, infinite |

---

## 12. Iconography

All icons use **Lucide React** library, 18px default size, 1.5px stroke width.

| Context | Icon Name |
|---------|-----------|
| Dashboard | `LayoutDashboard` |
| Inventory | `Package` |
| Transactions | `ArrowLeftRight` |
| Stock IN | `ArrowDownToLine` |
| Stock OUT | `ArrowUpFromLine` |
| Adjustment | `SlidersHorizontal` |
| Suppliers | `Truck` |
| Orders | `ClipboardList` |
| Reports | `BarChart3` |
| Alerts / Bell | `Bell` |
| Users | `Users` |
| Settings | `Settings` |
| Search | `Search` |
| Add / Plus | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| View / Eye | `Eye` |
| Close | `X` |
| Check | `Check` |
| Warning | `AlertTriangle` |
| Info | `Info` |
| Calendar | `Calendar` |
| Download | `Download` |
| Filter | `Filter` |
| Sort ascending | `ArrowUp` |
| Sort descending | `ArrowDown` |
| Chevron down | `ChevronDown` |
| Chevron right | `ChevronRight` |
| Expand sidebar | `ChevronsRight` |
| Collapse sidebar | `ChevronsLeft` |
| Logout | `LogOut` |
| External link | `ExternalLink` |
| More options | `MoreHorizontal` |

---

## 13. Empty, Loading & Error States

### Loading State
- Full-page: Centered "Stoxen" logo + spinning circle beneath
- Component: Skeleton placeholders (gray-200 pulsing rectangles matching content shape)
- Table: 5 skeleton rows with gray bars
- Chart: Gray rectangle skeleton

### Empty State
- Centered illustration area (64px icon in gray-200)
- Heading: "No [items] found" — heading-md, gray-700
- Description: body-md, gray-500
- CTA button if actionable ("Add your first product →")

### Error State
- Red border card or inline message
- Icon: `AlertTriangle` in red
- Message: body-md, red-500
- Retry button if applicable

---

*End of Design Specification — Stoxen v1.0 (Status: All v1.0 UI/UX and modules implemented as of 2026)*
