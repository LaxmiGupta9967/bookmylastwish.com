
import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <section id="about" className="py-20 bg-light-grey">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold text-deep-blue">About Our Founders</h2>
                    <p className="mt-2 text-lg text-charcoal">The visionaries behind the mission.</p>
                </div>

                <div className="space-y-16">
                    {/* Chairman */}
                    <div className="grid md:grid-cols-2 gap-12 items-center fade-in-section">
                        <div className="flex justify-center">
                            <img src="https://armiet.in/wp-content/uploads/2020/06/gupta.png" alt="Dr. A.V. Gupta" className="rounded-full w-64 h-64 object-cover shadow-lg border-4 border-golden" loading="lazy"/>
                        </div>
                        <div>
                            <h3 className="text-3xl font-serif font-bold text-deep-blue">Dr. A.V. Gupta</h3>
                            <p className="text-marigold font-semibold mb-4">Chairman (Founder Member & Chairman – ARMIET)</p>
                            <p className="text-charcoal italic leading-relaxed">
                                "The idea for Book My Last Wish came to me during my college days. I often wondered—can a person’s wishes continue even after they’re gone? While we spend our lives fulfilling dreams, some wishes remain—acts of kindness, personal goals, or contributions to society. These are often left behind... That’s where Book My Last Wish comes in. We ensure that your final wishes—big or small—are fulfilled with care and respect... Because life ends, but dreams and good deeds don’t have to.”
                            </p>
                        </div>
                    </div>

                    {/* Vice Chairman */}
                    <div className="grid md:grid-cols-2 gap-12 items-center fade-in-section">
                        <div className="order-last md:order-first">
                             <h3 className="text-3xl font-serif font-bold text-deep-blue">Mrs. A.V.G</h3>
                            <p className="text-marigold font-semibold mb-4">Vice Chairman</p>
                            <p className="text-charcoal italic leading-relaxed">
                                "I would ensure with team to keep the promises of those who have pledged their wishes to us and we will make this experience worthwhile... The concept thrills me with a wish to see the good deeds don’t stop even in absence of a person and organization created by us lives even after us as we are on a mission to make world a better place full of compassion, love and care."
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <img src="https://i.postimg.cc/2SNRcRdH/Msr-AVG.png" alt="Mrs. A.V.G" className="rounded-full w-64 h-64 object-cover shadow-lg border-4 border-marigold" loading="lazy"/>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
