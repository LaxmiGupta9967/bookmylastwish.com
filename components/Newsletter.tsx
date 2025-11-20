import React, { useState } from 'react';

const Newsletter: React.FC = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        console.log('Subscribed with:', email);
        setSubmitted(true);
        setEmail('');
        setTimeout(() => setSubmitted(false), 5000); // Reset form after 5 seconds
    };

    return (
        <section className="relative py-20 bg-marigold text-white overflow-hidden">
            {/* Floating Leaf Overlay */}
            <div className="absolute top-10 left-10 text-white/10 text-6xl animate-float" style={{ animationDuration: '10s' }}>🍃</div>
            <div className="absolute bottom-10 right-10 text-white/10 text-8xl animate-float" style={{ animationDelay: '2s', animationDuration: '12s' }}>🌼</div>
            <div className="absolute top-1/2 left-1/3 text-white/10 text-5xl animate-float" style={{ animationDelay: '4s' }}>🌿</div>
            <div className="absolute top-1/4 right-1/4 text-white/10 text-7xl animate-float" style={{ animationDelay: '1s', animationDuration: '8s' }}>🍃</div>
            
            <div className="relative z-10 container mx-auto px-4 text-center fade-in-section">
                <h2 className="text-3xl font-serif font-bold mb-2">Stay Connected</h2>
                <p className="mb-6 max-w-xl mx-auto">Join our newsletter to receive heartwarming stories of fulfilled wishes and updates on our mission.</p>
                
                {submitted ? (
                    <div className="text-center p-4 bg-white/20 rounded-lg max-w-md mx-auto">
                        <h3 className="text-xl font-bold">Thank you for subscribing! ❤️</h3>
                        <p className="text-sm">You're now part of our community.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-grow p-3 rounded-full bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-deep-blue" 
                                aria-label="Email for newsletter"
                            />
                            <button type="submit" className="bg-white text-deep-blue font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 hover:bg-light-grey/90">
                                Join Us ❤️
                            </button>
                        </div>
                        {error && <p className="text-red-100 text-sm">{error}</p>}
                    </form>
                )}
            </div>
        </section>
    );
};

export default Newsletter;