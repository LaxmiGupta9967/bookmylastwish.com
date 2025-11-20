import React, { useState } from 'react';

const galleryImages = {
    '2027': [
        "https://stories.freepiklabs.com/storage/65486/College-students-01.svg",
        "https://stories.freepiklabs.com/storage/1983/Social-Idea-01.svg",
        "https://stories.freepiklabs.com/storage/1854/143-Artificial-intelligence_Artboard-1.svg",
        "https://stories.freepiklabs.com/storage/4577/Startup-life-AMICO_Mesa-de-trabajo-1.svg"
    ],
    '2026': [
        "https://stories.freepiklabs.com/storage/6382/Fighting-Against-Coronavirus-01.svg",
        "https://stories.freepiklabs.com/storage/101494/Online-Training_Mesa-de-trabajo-1.svg",
        "https://stories.freepiklabs.com/storage/4303/123-Walk-in-the-city_Artboard-1.svg",
        "https://stories.freepiklabs.com/storage/12241/Family-01.svg"
    ],
    '2025': [
        "https://stories.freepiklabs.com/storage/100901/Clock-Time-Machine_Mesa-de-trabajo-1.svg",
        "https://stories.freepiklabs.com/storage/54870/Hospital-patient_Mesa-de-trabajo-1.svg",
        "https://stories.freepiklabs.com/storage/1945/Gaming-01.svg",
        "https://stories.freepiklabs.com/storage/2098/211-Campfire_Artboard-1.svg"
    ],
};

type Year = keyof typeof galleryImages;

const Gallery: React.FC = () => {
    const [activeYear, setActiveYear] = useState<Year>('2025');

    return (
        <section id="gallery" className="py-20 bg-white">
            <div className="container mx-auto px-4">

                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold text-deep-blue">Gallery of Good Deeds</h2>
                    <p className="mt-2 text-lg text-charcoal"> A Glimpse Into the Future We Are Building Together.</p>
                </div>

                <div className="flex justify-center space-x-4 mb-8">
                    {Object.keys(galleryImages).map(year => (
                        <button
                            key={year}
                            onClick={() => setActiveYear(year as Year)}
                            className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeYear === year ? 'bg-deep-blue text-white' : 'bg-light-grey text-charcoal hover:bg-marigold'}`}
                        >
                            {year}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryImages[activeYear].map((img, index) => (
                        <div
                            key={index}
                            className="group overflow-hidden rounded-lg shadow-md fade-in-section"
                            style={{ transitionDelay: `${index * 50}ms` }}
                        >
                            <img
                                src={img}
                                alt={`Gallery image ${index + 1}`}
                                className="w-full h-48 object-cover transition-transform duration-500 transform group-hover:scale-110"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Gallery;
