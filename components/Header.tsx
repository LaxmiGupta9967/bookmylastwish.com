



import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { View } from '../App';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';

const NAV_LINKS = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Methodology', href: '#methodology' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Cascade', href: '#cascade' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'FAQ/Blog', href: '#faq' },
    { name: 'Contact', href: '#contact' },
];

const newLogoSrc = "https://i.postimg.cc/cHRcgdk6/Whats-App-Image-2025-11-15-at-2-24-19-PM-removebg-preview.png";

interface HeaderProps {
    setView: (view: View) => void;
    session: Session | null;
    view: View;
}

const Header: React.FC<HeaderProps> = ({ setView, session, view }) => {
    const [isSticky, setSticky] = useState(false);
    const [activeSection, setActiveSection] = useState('#home');
    const [isMenuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Make sticky sooner for a smoother feel
            setSticky(window.scrollY > 20);

            if (view !== 'home') return;

            const sections = NAV_LINKS.map(link => document.querySelector<HTMLElement>(link.href));
            const scrollPosition = window.scrollY + 100; // Adjusted offset for slim header
            let currentSection = '#home';
            for (const section of sections) {
                if (section && section.offsetTop <= scrollPosition && section.offsetTop + section.offsetHeight > scrollPosition) {
                    currentSection = `#${section.id}`;
                    break;
                }
            }
             setActiveSection(currentSection);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [view]);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        
        if (view !== 'home') {
            setView('home');
             setTimeout(() => {
                const element = document.querySelector(href);
                if (element) {
                    const headerOffset = 70; // Match new header height
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }, 100);
        } else {
             const element = document.querySelector(href);
             if (element) {
                 const headerOffset = 70;
                 const elementPosition = element.getBoundingClientRect().top;
                 const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                 window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
             }
        }
        
        setMenuOpen(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setView('home');
        setMenuOpen(false);
    };

    const AuthButtons: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
        const baseMobileClasses = "w-full text-center font-sans text-sm font-semibold py-2 rounded-md transition-colors duration-300";
        const baseDesktopClasses = "font-sans text-sm font-medium transition-all duration-300 group cursor-pointer text-white hover:text-golden";

        if (session) {
            // --- LOGGED-IN STATE ---
            const desktopActiveClasses = "font-medium transition-colors duration-300 cursor-default bg-golden text-deep-blue px-3 py-1.5 rounded-full text-xs";
            const mobileActiveClasses = `${baseMobileClasses} bg-golden text-deep-blue cursor-default`;

            const LogoutLink = (
                <a onClick={handleLogout} className={isMobile ? baseMobileClasses + " text-white hover:bg-white/10" : baseDesktopClasses}>
                    Logout
                </a>
            );

            if (view === 'dashboard') {
                return (
                    <>
                        <span className={isMobile ? mobileActiveClasses : desktopActiveClasses}>Dashboard</span>
                        {LogoutLink}
                    </>
                );
            }

            return (
                 <>
                    <a onClick={() => { setView('dashboard'); setMenuOpen(false); }} className={isMobile ? baseMobileClasses + " text-white hover:bg-white/10" : baseDesktopClasses}>
                        Dashboard
                    </a>
                    {LogoutLink}
                </>
            );
        }

        if (!SUPABASE_CONFIGURED) {
            return null;
        }

        const effectiveClasses = isMobile ? baseMobileClasses + " text-white hover:bg-white/10" : baseDesktopClasses;

        return (
            <>
                 <a onClick={() => { setView('login'); setMenuOpen(false); }} className={effectiveClasses}>
                    Login
                </a>
                <a onClick={() => { setView('signup'); setMenuOpen(false); }} className={`${effectiveClasses} ${!isMobile ? 'border border-white/30 px-4 py-1.5 rounded-full hover:bg-white hover:text-deep-blue' : ''}`}>
                    Sign Up
                </a>
            </>
        );
    };
    
    const homeNavLinks = NAV_LINKS.map((link) => (
        <a
            key={link.name}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className={`font-sans text-sm font-medium transition-all duration-300 relative group cursor-pointer ${activeSection === link.href && view === 'home' ? 'text-golden' : 'text-white hover:text-golden'}`}
        >
            {link.name}
            <span className={`absolute -bottom-1 left-0 block h-0.5 transition-all duration-300 ${activeSection === link.href  && view === 'home' ? 'bg-golden w-full' : 'bg-golden w-0 group-hover:w-full'}`}></span>
        </a>
    ));

    // Dynamic classes for the sticky effect
    const headerClasses = `w-full fixed top-0 left-0 z-50 transition-all duration-300 ease-in-out border-b border-white/5 ${
        isSticky || isMenuOpen || view === 'dashboard' 
            ? 'bg-deep-blue/95 backdrop-blur-sm shadow-md py-2' 
            : 'bg-transparent py-4'
    }`;

    return (
        <header className={headerClasses}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo Area - Increased size */}
                    <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="flex items-center flex-shrink-0">
                        <img 
                            src={newLogoSrc} 
                            alt="Book My Last Wishes Logo" 
                            className={`w-auto transition-all duration-300 ${isSticky ? 'h-16' : 'h-24'}`} 
                        />
                    </a>
                    
                    {/* Desktop Nav - Tightened spacing */}
                    <nav className="hidden lg:flex items-center space-x-6">
                        {(view === 'home' || view === 'dashboard') ? (
                            <>
                                {homeNavLinks}
                                <div className="flex items-center space-x-4 pl-4 border-l border-white/20">
                                    <AuthButtons />
                                </div>
                            </>
                        ) : (
                             <div className="flex items-center space-x-4">
                                <AuthButtons />
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-1.5 rounded-md text-white hover:bg-white/10 focus:outline-none" aria-label="Toggle menu">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out bg-deep-blue/95 backdrop-blur-md ${isMenuOpen ? 'max-h-screen border-t border-white/10 shadow-lg' : 'max-h-0'}`}>
                <nav className="flex flex-col space-y-1 pt-2 pb-4 px-4">
                    {(view === 'home' || view === 'dashboard') && NAV_LINKS.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className={`w-full text-center font-sans text-sm font-medium py-2 rounded-md transition-colors duration-300 cursor-pointer ${activeSection === link.href && view === 'home' ? 'text-deep-blue bg-golden' : 'text-white hover:bg-white/10'}`}
                        >
                            {link.name}
                        </a>
                    ))}
                    
                    <div className={`${(view === 'home' || view === 'dashboard') ? 'border-t border-white/20 pt-3 mt-2' : ''} space-y-2`}>
                        <AuthButtons isMobile={true} />
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;