import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Package, BarChart3, Truck,
    Bell, Users, ShieldCheck, Menu, X, ChevronDown,
} from 'lucide-react';

const PILLARS = [96, 90, 85, 80, 74, 68, 60, 50, 36, 22, 36, 50, 60, 68, 74, 80, 85, 90, 96];

const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'Modules', href: '#modules' },
    { label: 'About', href: '#about' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
];

const FEATURES = [
    { icon: Package, label: 'Inventory Control', desc: 'Real-time stock tracking with SKU, batch & expiry management.' },
    { icon: Truck, label: 'Order Fulfilment', desc: 'Purchase & dispatch orders tracked from pending to delivered.' },
    { icon: BarChart3, label: 'Reports & Analytics', desc: 'Instant PDF/CSV reports for inventory, transactions & suppliers.' },
    { icon: Bell, label: 'Smart Alerts', desc: 'Automated low-stock, overdue order & expiry notifications.' },
    { icon: Users, label: 'Supplier CRM', desc: 'Manage supplier relationships, contacts & purchase history.' },
    { icon: ShieldCheck, label: 'Role-Based Access', desc: 'Granular permissions — Admin, Manager & Staff roles built-in.' },
];

const TRUSTED = ['SAP', 'Oracle', 'Zoho', 'QuickBooks', 'Shopify', 'WooCommerce', 'Tally', 'Stripe'];

/* ─── reusable container ─── */
const Container = ({ children, className = '' }) => (
    <div className={`mx-auto w-full max-w-6xl px-6 md:px-12 lg:px-16 ${className}`}>
        {children}
    </div>
);

/* ─── reusable section label ─── */
const SectionLabel = ({ children }) => (
    <span className="mb-3 inline-block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-teal-400">
        [ {children} ]
    </span>
);

export function StoxenLanding() {
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const featuresRef = useRef(null);
    const howRef = useRef(null);
    const [featVisible, setFeatVisible] = useState(false);
    const [howVisible, setHowVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => {
        const make = (ref, setter) => {
            const el = ref.current;
            if (!el) return;
            const obs = new IntersectionObserver(
                ([e]) => { if (e.isIntersecting) setter(true); },
                { threshold: 0.08 }
            );
            obs.observe(el);
            return () => obs.disconnect();
        };
        const c1 = make(featuresRef, setFeatVisible);
        const c2 = make(howRef, setHowVisible);
        return () => { c1?.(); c2?.(); };
    }, []);

    return (
        <>
            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes glowPulse {
          0%,100% { opacity:.72; transform:translateX(-50%) scale(1);    }
          50%      { opacity:1;   transform:translateX(-50%) scale(1.07); }
        }
        .fade-up     { animation: fadeUp .85s ease-out forwards; }
        .d1 { animation-delay:160ms; }
        .d2 { animation-delay:300ms; }
        .d3 { animation-delay:440ms; }
        .d4 { animation-delay:580ms; }
        .card-lift { transition: transform .3s ease, box-shadow .3s ease; }
        .card-lift:hover { transform:translateY(-6px); box-shadow:0 24px 48px rgba(13,148,136,.2); }
      `}</style>

            <div className="w-full bg-black text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

                {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
                <section className="relative isolate flex h-screen min-h-[520px] sm:min-h-[680px] w-full flex-col overflow-hidden bg-black">

                    {/* Background gradient dome */}
                    <div aria-hidden className="absolute inset-0 -z-30" style={{
                        backgroundImage: [
                            'radial-gradient(80% 55% at 50% 52%, rgba(13,148,136,.42) 0%, rgba(15,118,110,.36) 25%, rgba(10,26,38,.42) 58%, rgba(0,0,0,.94) 80%, #000 92%)',
                            'radial-gradient(75% 50% at 10% 0%,  rgba(99,210,200,.32) 0%, rgba(13,148,136,.22) 36%, transparent 66%)',
                            'radial-gradient(60% 42% at 90% 18%, rgba(56,189,248,.20) 0%, transparent 58%)',
                            'linear-gradient(to bottom, rgba(0,0,0,.28), transparent 38%)',
                        ].join(','),
                        backgroundColor: '#000',
                    }} />

                    {/* Vignette */}
                    <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(140%_120%_at_50%_0%,transparent_52%,rgba(0,0,0,.92))]" />

                    {/* Grid */}
                    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.22] mix-blend-screen" style={{
                        backgroundImage: [
                            'repeating-linear-gradient(90deg, rgba(255,255,255,.09) 0 1px, transparent 1px 96px)',
                            'repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 1px, transparent 1px 24px)',
                            'repeating-radial-gradient(80% 55% at 50% 52%, rgba(13,220,200,.09) 0 1px, transparent 1px 120px)',
                        ].join(','),
                    }} />

                    {/* ── Navbar ── */}
                    <header className="relative z-50 w-full">
                        <div
                            className="w-full transition-all duration-300"
                            style={scrolled ? {
                                background: 'rgba(0,0,0,.82)',
                                backdropFilter: 'blur(18px)',
                                borderBottom: '1px solid rgba(255,255,255,.07)',
                            } : {}}
                        >
                            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 md:px-12">
                                {/* Logo */}
                                <Link to="/" className="flex items-center gap-2.5">
                                    <img src="/warehouse-logo.svg" alt="Stoxen" className="h-7 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
                                    <span className="font-syne text-[1.15rem] font-bold tracking-tight">
                                        St<span className="text-teal-400">ox</span>en
                                    </span>
                                </Link>

                                {/* Desktop nav — perfectly centered in remaining space */}
                                <nav className="hidden items-center gap-7 text-[0.875rem] text-white/65 md:flex">
                                    {NAV_LINKS.map(l => (
                                        <a key={l.label} href={l.href}
                                            className="transition-colors hover:text-white">
                                            {l.label}
                                        </a>
                                    ))}
                                </nav>

                                {/* CTA buttons */}
                                <div className="hidden items-center gap-3 md:flex">
                                    <Link to="/login"
                                        className="rounded-full px-4 py-2 text-[0.875rem] text-white/65 transition hover:text-white">
                                        Login
                                    </Link>
                                    <Link to="/signup"
                                        className="inline-flex items-center gap-1.5 rounded-full bg-teal-500 px-5 py-2.5 text-[0.875rem] font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400">
                                        Get Started <ArrowRight size={14} strokeWidth={2.5} />
                                    </Link>
                                </div>

                                {/* Mobile hamburger */}
                                <button
                                    onClick={() => setMobileOpen(!mobileOpen)}
                                    className="md:hidden rounded-full bg-white/10 p-2.5">
                                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                                </button>
                            </div>

                            {/* Mobile dropdown */}
                            {mobileOpen && (
                                <div className="w-full border-t border-white/10 bg-black/92 px-6 pb-6 pt-4 md:hidden">
                                    <nav className="space-y-1">
                                        {NAV_LINKS.map(l => (
                                            <a key={l.label} href={l.href}
                                                onClick={() => setMobileOpen(false)}
                                                className="block rounded-lg px-3 py-2.5 text-[0.9rem] text-white/65 hover:bg-white/5 hover:text-white">
                                                {l.label}
                                            </a>
                                        ))}
                                    </nav>
                                    <div className="mt-5 flex gap-3">
                                        <Link to="/login"
                                            className="flex-1 rounded-full border border-white/20 py-3 text-center text-[0.875rem] text-white/75">
                                            Login
                                        </Link>
                                        <Link to="/signup"
                                            className="flex-1 rounded-full bg-teal-500 py-3 text-center text-[0.875rem] font-semibold text-white">
                                            Get Started
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* ── Hero copy — vertically and horizontally centered ── */}
                    <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
                        <div className="w-full max-w-3xl text-center">

                            {/* Badge */}
                            <div className={`flex justify-center ${mounted ? 'fade-up' : 'opacity-0'}`}>
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-white/55 ring-1 ring-white/10 backdrop-blur-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                                    Warehouse Management · Free &amp; Open
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className={`mt-6 font-syne text-[2.6rem] font-bold leading-[1.06] tracking-[-0.03em] sm:text-[3.25rem] md:text-[4rem] lg:text-[4.5rem] ${mounted ? 'fade-up d1' : 'opacity-0'}`}>
                                Fast. Reliable.{' '}
                                <span className="text-teal-400">Smart</span>
                                <br />
                                Warehouse Management
                            </h1>

                            {/* Subline */}
                            <p className={`mx-auto mt-6 max-w-lg text-[1rem] leading-relaxed text-white/55 md:text-[1.05rem] ${mounted ? 'fade-up d2' : 'opacity-0'}`}>
                                Track every item, manage every order, and control your entire warehouse —
                                in one powerful, intuitive platform built for speed.
                            </p>

                            {/* CTAs */}
                            <div className={`mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row ${mounted ? 'fade-up d3' : 'opacity-0'}`}>
                                <Link to="/login"
                                    className="inline-flex h-12 items-center gap-2 rounded-full bg-teal-500 px-8 text-[0.9rem] font-semibold text-white shadow-xl shadow-teal-500/25 transition hover:bg-teal-400">
                                    Start for Free <ArrowRight size={16} strokeWidth={2.5} />
                                </Link>
                                <a href="#features"
                                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/18 px-8 text-[0.9rem] font-semibold text-white/75 backdrop-blur transition hover:border-white/35 hover:text-white">
                                    See Features <ChevronDown size={15} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Pillar silhouette */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[50vh]">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/88 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-[1px] px-[1px]">
                            {PILLARS.map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-black"
                                    style={{
                                        height: mounted ? `${h}%` : '0%',
                                        transition: 'height 1.1s ease-in-out',
                                        transitionDelay: `${Math.abs(i - Math.floor(PILLARS.length / 2)) * 55}ms`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════
            FEATURES
        ══════════════════════════════════════ */}
                <section id="features" className="relative w-full bg-[#030e0d] py-16 md:py-20 lg:py-24">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(13,148,136,.13),transparent)]" />

                    <div ref={featuresRef}>
                        <Container>
                            {/* Section header */}
                            <div className={`mx-auto mb-10 max-w-lg text-center transition-all duration-700 ${featVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <SectionLabel>What We Offer</SectionLabel>
                                <h2 className="mt-1 font-syne text-3xl font-bold tracking-tight md:text-[2.5rem]">
                                    Everything your warehouse{' '}
                                    <span className="text-teal-400">needs</span>
                                </h2>
                                <p className="mt-4 text-[0.95rem] leading-relaxed text-white/48">
                                    From stock entry to final dispatch — every operation handled with precision.
                                </p>
                            </div>

                            {/* Cards — equal height via grid */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {FEATURES.map(({ icon: Icon, label, desc }, i) => (
                                    <div
                                        key={i}
                                        className="card-lift flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 backdrop-blur-sm"
                                        style={{
                                            opacity: featVisible ? 1 : 0,
                                            transform: featVisible ? 'translateY(0)' : 'translateY(28px)',
                                            transition: `opacity .6s ease ${i * 85}ms, transform .6s ease ${i * 85}ms, box-shadow .3s ease`,
                                        }}
                                    >
                                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/14 ring-1 ring-teal-500/22">
                                            <Icon size={20} className="text-teal-400" />
                                        </div>
                                        <h3 className="font-syne text-[1rem] font-bold text-white mb-2">{label}</h3>
                                        <p className="text-[0.855rem] leading-relaxed text-white/48">{desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className={`mt-10 flex justify-center transition-all duration-700 delay-500 ${featVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                                <Link to="/login"
                                    className="inline-flex h-12 items-center gap-2 rounded-full bg-teal-500 px-8 text-[0.9rem] font-semibold text-white shadow-lg shadow-teal-500/22 transition hover:bg-teal-400">
                                    Explore All Features <ArrowRight size={15} />
                                </Link>
                            </div>
                        </Container>
                    </div>
                </section>

                {/* ══════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════ */}
                <section id="modules" className="w-full bg-black py-28 md:py-36">
                    <div ref={howRef}>
                        <Container>
                            <div className={`mx-auto mb-16 max-w-lg text-center transition-all duration-700 ${howVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <SectionLabel>How Stoxen Works</SectionLabel>
                                <h2 className="mt-1 font-syne text-3xl font-bold tracking-tight md:text-[2.5rem]">
                                    Simple. Powerful. Zero chaos.
                                </h2>
                            </div>

                            {/* 3-panel grid — equal heights, gap-separated */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                {[
                                    { step: '01', title: 'Add Your Inventory', desc: 'Import or manually add products with SKU, categories, batch numbers and warehouses in minutes.' },
                                    { step: '02', title: 'Track Every Movement', desc: 'Stock-in, stock-out, transfers and adjustments are logged with timestamps and attribution.' },
                                    { step: '03', title: 'Gain Full Visibility', desc: 'Real-time dashboard, instant alerts and one-click reports keep you in control 24/7.' },
                                ].map(({ step, title, desc }, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8 md:p-10"
                                        style={{
                                            opacity: howVisible ? 1 : 0,
                                            transform: howVisible ? 'translateY(0)' : 'translateY(28px)',
                                            transition: `opacity .65s ease ${i * 110}ms, transform .65s ease ${i * 110}ms`,
                                        }}
                                    >
                                        <div className="font-syne text-[4rem] font-bold leading-none text-teal-500/18 mb-6">{step}</div>
                                        <h3 className="font-syne text-lg font-bold text-white mb-3">{title}</h3>
                                        <p className="text-[0.875rem] leading-relaxed text-white/42">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </Container>
                    </div>
                </section>

                {/* ══════════════════════════════════════
            CTA BANNER
        ══════════════════════════════════════ */}
                <section id="about" className="relative w-full overflow-hidden bg-teal-600 py-24 md:py-28">
                    {/* subtle grid overlay */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[0.08]"
                        style={{ backgroundImage: 'repeating-linear-gradient(90deg,rgba(255,255,255,.5) 0 1px,transparent 1px 52px),repeating-linear-gradient(0deg,rgba(255,255,255,.5) 0 1px,transparent 1px 52px)' }}
                    />
                    <Container className="relative">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="font-syne text-3xl font-bold leading-tight text-white md:text-[2.6rem]">
                                Ready to take control of your warehouse?
                            </h2>
                            <p className="mx-auto mt-5 max-w-xl text-[1rem] leading-relaxed text-teal-100/75 md:text-[1.05rem]">
                                Join thousands of businesses that trust Stoxen. No credit card needed — start free today.
                            </p>
                            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Link to="/signup"
                                    className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-8 text-[0.9rem] font-bold text-teal-700 shadow-2xl transition hover:bg-teal-50">
                                    Get Started Free <ArrowRight size={15} />
                                </Link>
                                <a href="mailto:stoxen@gmail.com"
                                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-8 text-[0.9rem] font-semibold text-white transition hover:border-white/60">
                                    Contact Us
                                </a>
                            </div>
                        </div>
                    </Container>
                </section>

                {/* ══════════════════════════════════════
            FAQ
        ══════════════════════════════════════ */}
                <FAQAccordion />

                {/* ══════════════════════════════════════
            FOOTER
        ══════════════════════════════════════ */}
                <footer id="contact" className="relative w-full overflow-hidden bg-black border-t border-white/[0.06]">
                    <Container className="pt-16 pb-10">
                        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5 mb-14">
                            {/* Brand */}
                            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <img src="/warehouse-logo.svg" alt="Stoxen" className="h-6 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
                                    <span className="font-syne text-[1.1rem] font-bold">
                                        St<span className="text-teal-400">ox</span>en
                                    </span>
                                </div>
                                <p className="text-[0.8rem] leading-relaxed text-white/32 max-w-[210px]">
                                    A modern warehouse management platform for businesses that value speed and accuracy.
                                </p>
                                <p className="mt-4 text-[0.7rem] italic text-white/18">Moving Goods. Powering Businesses.</p>
                            </div>

                            {[
                                { heading: 'Product', links: ['Features', 'Modules', 'Reports', 'Alerts'] },
                                { heading: 'Company', links: ['About', 'FAQs', 'Get Started', 'Home'] },
                                { heading: 'Contact', links: ['stoxen@gmail.com', '+91 98765 43210'] },
                                { heading: 'Social', links: ['Twitter', 'LinkedIn', 'Instagram', 'GitHub'] },
                            ].map(({ heading, links }) => (
                                <div key={heading}>
                                    <h4 className="mb-5 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/28">{heading}</h4>
                                    <ul className="space-y-3">
                                        {links.map(l => (
                                            <li key={l}>
                                                <a href="#" className="text-[0.8rem] text-white/38 transition hover:text-white/75">{l}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-white/[0.06] pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <p className="text-[0.75rem] text-white/22">© 2026 Stoxen. All rights reserved.</p>
                            <p className="text-[0.75rem] text-white/18">Built for warehouses that never stop.</p>
                        </div>
                    </Container>
                </footer>
            </div>
        </>
    );
}

/* ══════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════ */
const FAQS = [
    { q: 'Is Stoxen really free?', a: 'Yes — Stoxen is completely free with no credit card required. Sign up and go.' },
    { q: 'How many warehouses can I manage?', a: 'Multiple warehouses, each with its own inventory, users and settings.' },
    { q: 'Can I export reports?', a: 'Export inventory, transaction and supplier reports as PDF or CSV with one click.' },
    { q: 'Is there a mobile app?', a: 'Stoxen is fully responsive and works great on phones and tablets.' },
    { q: 'How do I add my team?', a: 'Invite members as Admins, Managers or Staff — each with role-based access.' },
];

function FAQAccordion() {
    const [open, setOpen] = useState(null);
    const ref = useRef(null);
    const [vis, setVis] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setVis(true); },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <section id="faq" className="w-full bg-[#030e0d] py-28 md:py-36">
            <div ref={ref}>
                <Container>
                    <div className={`mx-auto mb-14 max-w-lg text-center transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <SectionLabel>FAQ</SectionLabel>
                        <h2 className="mt-1 font-syne text-3xl font-bold tracking-tight md:text-[2.5rem]">Common questions</h2>
                    </div>

                    <div className="mx-auto max-w-2xl space-y-2.5">
                        {FAQS.map(({ q, a }, i) => (
                            <div
                                key={i}
                                className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]"
                                style={{
                                    opacity: vis ? 1 : 0,
                                    transform: vis ? 'translateY(0)' : 'translateY(22px)',
                                    transition: `opacity .6s ease ${i * 80}ms, transform .6s ease ${i * 80}ms`,
                                }}
                            >
                                <button
                                    onClick={() => setOpen(open === i ? null : i)}
                                    className="flex w-full items-center justify-between px-6 py-5 text-left text-[0.95rem] font-medium text-white/80 hover:text-white cursor-pointer"
                                >
                                    {q}
                                    <span className={`ml-4 shrink-0 text-xl leading-none text-teal-400 transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`}>
                                        +
                                    </span>
                                </button>
                                <div style={{ maxHeight: open === i ? '220px' : '0', overflow: 'hidden', transition: 'max-height .4s ease' }}>
                                    <p className="px-6 pb-6 text-[0.875rem] leading-relaxed text-white/45">{a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </div>
        </section>
    );
}

export default StoxenLanding;
