
import React from 'react';

const Scroller: React.FC<{ text: string; reverse?: boolean }> = ({ text, reverse = false }) => (
    <div className="py-4 bg-white shadow-md overflow-hidden">
        <div className={`flex whitespace-nowrap ${reverse ? 'animate-ticker-reverse' : 'animate-ticker'}`}>
            <span className="text-lg font-semibold text-charcoal mx-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>{text} ❤️</span>
            <span className="text-lg font-semibold text-charcoal mx-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>{text} ❤️</span>
            <span className="text-lg font-semibold text-charcoal mx-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>{text} ❤️</span>
            <span className="text-lg font-semibold text-charcoal mx-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>{text} ❤️</span>
        </div>
    </div>
);

const LiveUpdates: React.FC = () => {
    return (
        <section className="bg-light-grey py-8">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Scroller text="Wishes being booked with hope" />
                <Scroller text="Wishes being fulfilled with love" />
            </div>
        </section>
    );
};

export default LiveUpdates;
