# STOXEN — Design Specification
> **Version:** 1.0  
> **Date:** February 22, 2026  
> **Design References:** SwiftHaul Logistics (Landing Page) · ACRU Finance Dashboard (App UI)

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
| **Plus Jakarta Sans** | Primary UI font — headings, body, labels | `'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif` |
| **Clash Display** | Large display numbers on dashboard stats | `'Clash Display', 'Plus Jakarta Sans', sans-serif` |
| **DM Mono** | Monospaced — quantities, SKUs, prices, codes | `'DM Mono', 'Fira Code', 'Courier New', monospace` |

### 3.2 Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|---------------|-------|
| `display-xl` | 72px / 4.5rem | 800 | 1.0 | -2px | Landing hero heading |
| `display-lg` | 48px / 3rem | 700 | 1.1 | -1.5px | Section headings (landing) |
| `display-md` | 36px / 2.25rem | 700 | 1.2 | -1px | Dashboard stat numbers (Clash Display) |
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

## 7. Landing Page — Section-by-Section Design

### 7.1 Navbar

| Property | Value |
|----------|-------|
| Position | Sticky top, z-index 50 |
| Height | 64px |
| Background | White with `backdrop-blur` |
| Border | Bottom 1px `#e5e7eb` |
| Padding | 0 80px (desktop), 0 20px (mobile) |
| Max width | 1280px centered |

**Left — Logo:**
- Text "St**ox**en" where "ox" is teal `#0d9488`
- Font: 24px, weight 700

**Center — Nav Links:**
- Items: Features · Modules · Login · Pricing · Contact Us
- Font: 14px, weight 500, color `#6b7280`
- Hover: color `#111827`
- Active: color `#0d9488`

**Right — CTAs:**
- "Login" → ghost button, teal border + text
- "Get Started →" → teal filled button

**Mobile (< 768px):**
- Hamburger menu icon replaces nav links
- Slide-in drawer from right

### 7.2 Hero Section

| Property | Value |
|----------|-------|
| Padding | 80px 0 (desktop) |
| Layout | 2 columns — 55% text / 45% visual |
| Gap | 48px |

**Left Column:**
1. **Eyebrow badge:** Teal pill — "🚀 #1 Free Warehouse Management System"
2. **Heading (display-xl):**
   - Line 1: "Fast. Accurate." — `#111827`
   - Line 2: "Smart Warehouse" — `#111827`
   - Line 3: "**Solutions.**" — `#0d9488`, weight 800
3. **Subtext (body-lg):** Gray `#6b7280`, max-width 480px
4. **CTA Row:** (gap 16px)
   - Primary: Dark filled "Get Started Free →"
   - Secondary: Ghost outlined "See Live Demo"
5. **Trust Row:** 4 stacked avatars + "500+ businesses use Stoxen"

**Right Column:**
1. Browser mockup frame (rounded-2xl, shadow-xl, border gray-200)
2. Inside: Mini dashboard preview showing:
   - Product count card
   - Stock value card
   - Mini bar chart
   - Alerts mini-panel
3. Floating badge (top-right): "🔔 Low Stock Alert — Steel Pipes"
   - White bg, shadow-xl, rounded-lg, padding 12px 16px
4. Floating badge (bottom-left): "✅ Order #DO-1042 Completed"
   - Same floating card style

### 7.3 Stats Strip

| Property | Value |
|----------|-------|
| Background | `#111827` |
| Radius | 16px |
| Margin | 0 auto, max-width 1100px |
| Padding | 48px 64px |
| Layout | 4 columns, equal width |

Each stat column:
- Number: Teal `#0d9488`, 48px Clash Display, weight 700
- Label: White `#ffffff`, 14px, weight 400, opacity 0.8
- Separator: 1px vertical line `rgba(255,255,255,0.1)` between columns

Stats:
1. **10+** — Modules Built-in
2. **50+** — Features Available
3. **100%** — Free to Start
4. **0** — Excel Sheets Needed

### 7.4 Features Section

| Property | Value |
|----------|-------|
| Padding | 96px 0 |
| Layout | 2 columns — 40% left text / 60% right cards |

**Left Column:**
- Eyebrow: `[OUR FEATURES]` teal uppercase pill
- Heading: "End-to-End **Warehouse Management**" (display-lg)
- Subtext paragraph in gray
- Link: "[ Our Modules ] →" teal text

**Right Column (2×2 Grid + Featured card):**
1. **Featured Card** (spans full width, dark bg `#111827`):
   - Shows 2 product items with status badges
   - "Low Stock" amber badge, "Out of Stock" red badge
   - Product names + quantities in white text

2. **4 Feature Cards** (2×2 grid):
   - Each card: white bg, rounded-lg, padding 24px
   - Teal icon (24px) in teal-50 circle
   - Title: heading-sm
   - Description: body-sm, gray-500
   - Cards: Transactions, Suppliers, Analytics, Reports

### 7.5 Modules Section (Services)

| Property | Value |
|----------|-------|
| Padding | 96px 0 |
| Background | `#f9fafb` |

**Header Row:**
- Left: Eyebrow + "Built for Every **Warehouse**" (display-lg)
- Right: "[ All Modules ]" teal link

**3-Column Card Grid:**
Each card:
- Image area: 180px tall, gradient background
  - Card 1: Teal gradient (Inventory Management)
  - Card 2: Gray gradient (Order Management)
  - Card 3: Dark gradient (Reports & Analytics)
- Body: White bg, padding 24px
  - Title: heading-md
  - Description: body-md, gray-500
  - Link: "Learn more →" teal, weight 500

### 7.6 About / Excellence Section

| Property | Value |
|----------|-------|
| Padding | 96px 0 |
| Layout | 2 columns — 50/50 |

**Left — Image Mosaic (2×2 grid):**
- 3 images of warehouse operations
- Bottom span-2 image with dark overlay
- Badge on image: "50+" teal number + "Features Built-in"

**Right — Text Content:**
- Eyebrow: `[About Us]` teal pill
- Heading: "Excellence in **Warehouse Intelligence**"
- "Stoxen" in teal accent
- Paragraph description in gray
- CTA: "Know more →" teal filled button

### 7.7 Comparison Table

| Property | Value |
|----------|-------|
| Max width | 900px centered |
| Padding | 96px 0 |

**Header row:** Dark `#111827` background
- Columns: Feature | **Stoxen** (teal) | Excel | Basic Apps

**10 Feature Rows:** (alternating hover)
| Feature | Stoxen | Excel | Basic Apps |
|---------|--------|-------|-----------|
| Real-time stock tracking | ✓ | ✗ | Partial |
| Complete transaction audit trail | ✓ | ✗ | ✗ |
| Role-based access control | ✓ | ✗ | ✗ |
| Supplier management & history | ✓ | ✗ | Partial |
| Automatic low stock alerts | ✓ | ✗ | ✗ |
| Batch & expiry date tracking | ✓ | ✗ | ✗ |
| PDF & CSV report export | ✓ | Partial | ✗ |
| Visual analytics dashboard | ✓ | ✗ | Partial |
| Order lifecycle management | ✓ | ✗ | ✗ |
| 100% Free | ✓ | ✓ | ✗ |

**Value Indicators:**
- ✓ Green check (`#22c55e`) = Full support
- ✗ Gray cross (`#9ca3af`) = Not available
- "Partial" Amber pill = Partially available

### 7.8 FAQ Section

| Property | Value |
|----------|-------|
| Padding | 96px 0 |
| Layout | 60% accordion / 40% CTA card |

**Left — Accordion:**
- Heading: "FAQs" — teal display-lg
- 4 items:
  1. *How does stock quantity update automatically?* (open by default)
  2. *Can multiple users login at the same time?*
  3. *Is my warehouse data safe and private?*
  4. *How do I generate and download reports?*
- Active item: Teal text, teal left border 3px, bg teal-50
- Toggle icon: Lucide ChevronDown, rotates 180° when open
- Answer text: gray-500, body-md

**Right — Help Card:**
- Dark background `#111827`
- Rounded-xl, padding 32px
- Heading: "Still need help?" white
- Subtext: muted white `rgba(255,255,255,0.6)`
- CTA: White filled button "Contact Us"

### 7.9 Footer

| Property | Value |
|----------|-------|
| Background | `#111827` |
| Padding | 64px 80px 32px |

**Top Grid (4 columns):**

| Column | Content |
|--------|---------|
| **Brand** | "Stoxen" logo (teal accent), tagline "Smart Stock. Zero Chaos.", subtext "Moving Goods. Powering Businesses." |
| **About** | Home, Get Started, FAQs |
| **Modules** | Inventory, Orders, Reports, Suppliers, Transactions |
| **Contact** | Email, Phone, Social icons (Facebook, Instagram, Twitter, LinkedIn) |

Link style: `rgba(255,255,255,0.6)`, hover: `#ffffff`

**Bottom Bar:**
- Left: © 2026 Stoxen. All rights reserved.
- Right: Tech stack pills — React · Node.js · MySQL

**Massive Faded Text:**
- "STOXEN" in 200px+ font
- Color: `rgba(255,255,255,0.03)`
- Centered, overflow hidden

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
| Sidebar width | 240px (collapsed: 64px) |
| Right panel width | 280px |
| Main content | `calc(100vw - 240px - 280px)` |
| Content max-width | No max — fluid |
| Content padding | 24px |
| Gap between cards | 24px |

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

**Collapsed State (64px width):**
- Icons only, centered
- Tooltip on hover showing label
- Logo shows icon only

### 8.3 Topbar

| Property | Value |
|----------|-------|
| Height | 64px |
| Background | Transparent (on top of gray-100 page bg) |
| Padding | 0 24px |
| Display | flex, space-between, align-center |

**Left:**
- Page title: "Dashboard" heading-xl, `#111827`
- Subtitle: "Good morning, Admin 👋" body-md, `#6b7280`

**Right (flex, gap 16px):**
- Search input: 240px, rounded-full, gray-100 bg, icon left
- Bell icon button: With teal notification dot (8px, top-right)
- Settings gear icon button
- Divider: 1px vertical gray-200
- User avatar (36px) + Name + Email (truncated) + ChevronDown

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
│  Value (display-md, Clash Display)    │
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
- Centered card (max 420px), white bg, shadow-lg, rounded-xl
- Logo at top center
- Email input + Password input + "Login" teal button full-width
- Error message in red below form
- Background: subtle teal gradient or gray-100

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
| `xl` | ≥ 1280px | Full 3-column layout |
| `lg` | 1024–1279px | Right panel hidden, main takes full width |
| `md` | 768–1023px | Sidebar collapses to 64px icon-only |
| `sm` | 640–767px | Sidebar becomes slide-out drawer, single column content |
| `xs` | < 640px | Full mobile — stacked cards, hamburger menu |

**Mobile Adaptations:**
- Stats cards: 2×2 grid on tablet, stacked on mobile
- Tables: Horizontal scroll with sticky first column
- Charts: Reduced height (200px)
- Right panel: Collapsed into tabs below main content
- Sidebar: Off-canvas drawer with overlay

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

*End of Design Specification — Stoxen v1.0*
