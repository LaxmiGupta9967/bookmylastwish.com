
import React from 'react';

const EmotionalMessage: React.FC = () => {
    return (
        <section className="relative py-20 text-center bg-gradient-to-r from-golden to-marigold text-white overflow-hidden">
            <div className="absolute top-0 left-0 text-white/10 text-9xl transform -translate-x-1/4 -translate-y-1/4">🌼</div>
            <div className="absolute bottom-0 right-0 text-white/10 text-9xl transform translate-x-1/4 translate-y-1/4">🍃</div>
            <div className="container mx-auto px-4 relative z-10">
                <h3 className="font-serif text-3xl md:text-4xl font-bold leading-tight max-w-4xl mx-auto" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                    “Life may leave wishes unfulfilled, but through Book My Last Wishes, dreams and good deeds continue.”
                </h3>
            </div>
        </section>
    );
};

export default EmotionalMessage;
