
import React from 'react';

const timelineEvents = [
    { title: 'Pledge', description: 'A wish is documented and a legacy begins.', icon: '📝' },
    { title: 'Verification', description: 'Our team confirms all details with care and precision.', icon: '✅' },
    { title: 'Fulfillment', description: 'The wish is carried out, spreading goodness as intended.', icon: '💖' },
    { title: 'Legacy', description: 'The story is shared, inspiring others to give.', icon: '🌟' },
];

const Timeline: React.FC = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-serif font-bold text-deep-blue">The Journey of a Wish</h2>
                    <p className="mt-2 text-lg text-charcoal">Transparency and trust at every step.</p>
                </div>
                <div className="relative">
                    {/* The connecting line */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-1 bg-marigold/30 rounded-full"></div>

                    <div className="space-y-16">
                        {timelineEvents.map((event, index) => (
                            <div key={index} className="fade-in-section relative flex items-center justify-center">
                                <div className="absolute w-10 h-10 bg-golden rounded-full flex items-center justify-center text-2xl z-10 shadow-lg">
                                    {event.icon}
                                </div>
                                <div className={`w-full flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                    <div className="w-5/12 bg-light-grey p-6 rounded-lg shadow-md">
                                        <h3 className="text-2xl font-serif font-bold text-deep-blue mb-2">{event.title}</h3>
                                        <p className="text-charcoal">{event.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Timeline;
