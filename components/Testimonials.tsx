
import React, { useState, useEffect } from 'react';

const testimonials = [
    {
        quote: "I pledged my wishes here. The team truly understands the emotions behind each dream.",
        author: "Retired Army Captain",
        image: "https://picsum.photos/id/1025/100/100",
    },
    {
        quote: "An amazing concept – I feel my good deeds will live beyond me. A true peace of mind.",
        author: "Socialite from Mumbai",
        image: "https://picsum.photos/id/1027/100/100",
    },
    {
        quote: "This is not just a service, but a godly mission. Highly recommended for everyone.",
        author: "Banker from Delhi",
        image: "https://picsum.photos/id/1028/100/100",
    },
];

const Testimonials: React.FC = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section id="testimonials" className="py-20 parallax" style={{backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=3')"}}>
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md p-8 sm:p-12 rounded-lg shadow-2xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-serif font-bold text-deep-blue">Words of Trust</h2>
                        <p className="mt-2 text-lg text-charcoal">What our patrons say about us.</p>
                    </div>
                    <div className="relative h-64">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <img src={testimonial.image} alt={testimonial.author} className="w-24 h-24 rounded-full mb-4 border-4 border-golden" loading="lazy"/>
                                    <p className="text-2xl font-serif italic max-w-3xl text-charcoal">"{testimonial.quote}"</p>
                                    <p className="mt-4 font-bold text-lg text-golden">- {testimonial.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center mt-8 space-x-2">
                        {testimonials.map((_, index) => (
                            <button key={index} onClick={() => setCurrent(index)} className={`w-3 h-3 rounded-full transition-colors ${index === current ? 'bg-golden' : 'bg-deep-blue/50'}`}></button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
