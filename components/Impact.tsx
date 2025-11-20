
import React, { useState, useEffect, useRef } from 'react';

const useCountUp = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                let start = 0;
                const stepTime = Math.abs(Math.floor(duration / end));
                const timer = setInterval(() => {
                    start += 1;
                    setCount(start);
                    if (start === end) {
                        clearInterval(timer);
                    }
                }, stepTime);
                observer.disconnect();
            }
        }, { threshold: 0.5 });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [end, duration]);

    return { count, ref };
};


const Impact: React.FC = () => {
    const wishesFulfilled = useCountUp(1250);
    const mealsServed = useCountUp(50000);
    const studentsSupported = useCountUp(2500);

    return (
        <section className="py-20 bg-emerald/10">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Counters */}
                    <div className="fade-in-section">
                        <div className="text-center lg:text-left mb-12">
                            <h2 className="text-4xl font-serif font-bold text-deep-blue">Our Collective Impact</h2>
                            <p className="mt-2 text-lg text-charcoal">Every wish contributes to a wave of positive change.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                            <div>
                                <span ref={wishesFulfilled.ref} className="text-5xl font-bold text-emerald">{wishesFulfilled.count.toLocaleString()}</span>
                                <p className="mt-2 font-semibold text-charcoal">Wishes Fulfilled</p>
                            </div>
                            <div>
                                <span ref={mealsServed.ref} className="text-5xl font-bold text-emerald">{mealsServed.count.toLocaleString()}</span>
                                <p className="mt-2 font-semibold text-charcoal">Meals Served</p>
                            </div>
                            <div>
                                <span ref={studentsSupported.ref} className="text-5xl font-bold text-emerald">{studentsSupported.count.toLocaleString()}</span>
                                <p className="mt-2 font-semibold text-charcoal">Students Supported</p>
                            </div>
                        </div>
                    </div>

                    {/* Tree of Life */}
                    <div className="flex justify-center items-center fade-in-section" style={{ transitionDelay: '200ms' }}>
                        <div className="text-center">
                             <h3 className="text-3xl font-serif font-bold text-emerald mb-4">The Tree of Life</h3>
                             <p className="text-charcoal mb-4">Each leaf represents a patron's wish, growing our forest of good deeds.</p>
                             <div className="relative text-9xl text-emerald animate-pulse">
                                🌳
                                <span className="absolute top-1/4 left-1/4 text-2xl animate-float">🍃</span>
                                <span className="absolute top-1/3 right-1/4 text-2xl animate-float" style={{animationDelay: '1s'}}>🌿</span>
                                <span className="absolute top-1/2 left-1/3 text-2xl animate-float" style={{animationDelay: '2s'}}>🍃</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Impact;
