import { Link } from 'react-router-dom'
import { Equal, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import React from 'react'
import { cn } from '@/lib/utils'

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'Modules', href: '#modules' },
    { name: 'About', href: '#about' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
]

export const Header = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header>
            <nav
                data-state={menuState ? 'active' : undefined}
                className="fixed left-0 top-0 w-full z-50 px-4 sm:px-6">
                <div className={cn(
                    'mx-auto mt-2 max-w-[1320px] px-6 transition-all duration-300 lg:px-10',
                    isScrolled && 'bg-white/80 max-w-5xl rounded-2xl border border-gray-200/80 backdrop-blur-xl shadow-lg shadow-black/[0.03] lg:px-6'
                )}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 lg:gap-0 py-3">
                        {/* Logo + Mobile toggle */}
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                to="/"
                                aria-label="home"
                                className="flex gap-2.5 items-center">
                                <img
                                    src="/warehouse-logo.svg"
                                    alt="Stoxen"
                                    className="h-7 w-auto"
                                    style={{ filter: 'brightness(0) saturate(100%) invert(14%) sepia(30%) saturate(1200%) hue-rotate(170deg)' }}
                                />
                                <span className="font-syne font-bold text-[1.3rem] tracking-tight text-gray-900">
                                    St<span className="text-teal-600">ox</span>en
                                </span>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Equal className={cn(
                                    'm-auto size-6 duration-200 transition-all',
                                    menuState && 'rotate-180 scale-0 opacity-0'
                                )} />
                                <X className={cn(
                                    'absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200 transition-all',
                                    menuState && 'rotate-0 scale-100 opacity-100'
                                )} />
                            </button>
                        </div>

                        {/* Desktop center nav links */}
                        <div className="absolute inset-0 m-auto hidden size-fit lg:flex items-center">
                            <ul className="flex gap-7 text-[0.875rem]">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <a
                                            href={item.href}
                                            className="text-gray-500 hover:text-gray-900 font-medium block duration-200 transition-colors">
                                            {item.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right side buttons + Mobile dropdown */}
                        <div className={cn(
                            'bg-white mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-2xl border border-gray-200 p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap max-h-[80vh] overflow-y-auto',
                            'lg:m-0 lg:flex lg:w-fit lg:gap-4 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:max-h-none lg:overflow-visible',
                            menuState && 'block'
                        )}>
                            {/* Mobile nav links */}
                            <div className="lg:hidden">
                                <ul className="space-y-5 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <a
                                                href={item.href}
                                                onClick={() => setMenuState(false)}
                                                className="text-gray-600 hover:text-gray-900 font-medium block duration-150">
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-2 sm:space-y-0 md:w-fit">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        'rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                                        isScrolled && 'lg:hidden'
                                    )}>
                                    <Link to="/login">
                                        <span>Login</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(
                                        'rounded-lg bg-[#111827] text-white hover:bg-teal-600 transition-colors',
                                        isScrolled && 'lg:hidden'
                                    )}>
                                    <Link to="/signup">
                                        <span>Sign Up</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(
                                        'rounded-lg bg-[#111827] text-white hover:bg-teal-600 transition-colors gap-1.5',
                                        isScrolled ? 'lg:inline-flex' : 'hidden'
                                    )}>
                                    <Link to="/login">
                                        <span>Get Started</span>
                                        <ArrowRight size={14} strokeWidth={2.5} />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Header
