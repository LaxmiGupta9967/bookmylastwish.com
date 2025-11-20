import React from 'react';

const VisionMission: React.FC = () => {
    return (
        <section className="py-20 bg-white parallax fade-in-section" style={{backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2')"}}>
             <div className="absolute top-1/4 left-1/4 text-emerald text-9xl opacity-10 animate-float">🍃</div>
             <div className="absolute bottom-1/4 right-1/4 text-emerald text-9xl opacity-10 animate-float" style={{animationDelay: '3s'}}>🌿</div>

            <div className="container mx-auto px-4 relative z-10 text-center text-charcoal">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="p-8 bg-white/80 backdrop-blur-sm rounded-lg">
                        <h2 className="text-4xl font-serif font-bold text-golden mb-4">Our Vision</h2>
                        <p className="text-xl font-sans">To become the most trusted and transparent organization dedicated to fulfilling the last wishes of individuals, ensuring their legacy of goodwill continues to inspire generations.</p>
                    </div>
                    <div className="p-8 bg-white/80 backdrop-blur-sm rounded-lg">
                        <h2 className="text-4xl font-serif font-bold text-marigold mb-4">Our Mission</h2>
                        <p className="text-xl font-sans">To honor every pledge with integrity and compassion, meticulously executing each wish to ensure that good deeds and cherished dreams continue to create a positive impact on the world.</p>
                    </div>
                </div>
                <div className="mt-12">
                    <p className="text-2xl font-serif italic text-marigold">"Your legacy lives on through your good deeds."</p>
                </div>
            </div>
        </section>
    );
};

export default VisionMission;