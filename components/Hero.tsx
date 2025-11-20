import React from 'react';
import { View } from '../App';
import { SUPABASE_CONFIGURED } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

const Leaf = ({ className, style }: { className: string; style?: React.CSSProperties }) => (
  <div className={`absolute text-emerald text-4xl opacity-20 animate-float ${className}`} style={style}>
    🍃
  </div>
);

const SunRay = ({ className }: { className: string }) => (
    <div className={`absolute w-1 h-96 bg-golden/20 transform rotate-45 ${className}`}></div>
);

interface HeroProps {
    setView: (view: View) => void;
    session: Session | null;
}

const Hero: React.FC<HeroProps> = ({ setView, session }) => {
    const handlePledgeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const element = document.getElementById('methodology');
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    return (
        <section id="home" className="relative h-screen flex items-center justify-center text-white bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://png.pngtree.com/background/20210710/original/pngtree-people-in-the-sunset-raise-hands-cheering-team-composite-background-picture-image_1047716.jpg')" }}>
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
            
            <SunRay className="top-0 left-1/4 animate-pulse delay-1000" />
            <SunRay className="bottom-0 right-1/4 animate-pulse delay-500" />
            <Leaf className="top-1/4 left-1/4" style={{ animationDelay: '0s' }} />
            <Leaf className="top-1/2 right-1/4" style={{ animationDelay: '2s' }} />
            <Leaf className="bottom-1/4 left-1/3" style={{ animationDelay: '4s' }} />

            <div className="relative z-10 text-center p-4">
                <h1 className="font-serif text-5xl md:text-7xl font-bold animate-[fadeIn_2s_ease-in-out] [text-shadow:2px_2px_8px_rgba(0,0,0,0.8)]">
                    Live Beyond Life, With Your Good Deeds
                </h1>
                <p className="mt-4 text-lg md:text-xl font-sans max-w-3xl mx-auto animate-[fadeIn_3s_ease-in-out] [text-shadow:1px_1px_6px_rgba(0,0,0,0.8)]">
                    Ensure your unfulfilled dreams and good deeds continue beyond life.
                </p>
                <a href="#methodology" onClick={handlePledgeClick} className="cursor-pointer mt-8 inline-block bg-golden text-deep-blue font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-110 hover:shadow-lg animate-[fadeIn_4s_ease-in-out] relative overflow-hidden group">
                    <span className="absolute inset-0 bg-marigold opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative animate-glow">Pledge Your Wish Now</span>
                </a>
                 <div className="mt-8 flex justify-center items-center gap-4 animate-[fadeIn_4s_ease-in-out]">
                    {!session ? (
                        SUPABASE_CONFIGURED ? (
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <button
                                    onClick={() => setView('login')}
                                    className="font-sans font-semibold text-white border-2 border-white py-2 px-6 rounded-full transition-all duration-300 hover:bg-white hover:text-deep-blue"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setView('signup')}
                                    className="font-sans font-semibold bg-white text-deep-blue py-2 px-6 rounded-full transition-all duration-300 hover:bg-transparent hover:text-white border-2 border-white"
                                >
                                    Sign Up
                                </button>
                            </div>
                        ) : (
                            <div className="bg-red-900/50 border border-red-500 text-white p-3 rounded-md text-sm">
                                <p className="font-bold">Authentication Not Configured</p>
                                <p className="text-xs mt-1">Please update Supabase credentials to enable login/signup.</p>
                            </div>
                        )
                    ) : null}
                </div>
            </div>
        </section>
    );
};

export default Hero;