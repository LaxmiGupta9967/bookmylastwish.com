import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-deep-blue text-white py-12">
            <div className="container mx-auto px-4 text-center">
                <div className="flex justify-center items-center mb-4">
                    <img src="https://i.postimg.cc/cHRcgdk6/Whats-App-Image-2025-11-15-at-2-24-19-PM-removebg-preview.png" alt="Book My Last Wishes Logo" className="h-32 w-auto" />
                </div>
                <p className="font-serif text-xl italic text-golden mb-6">
                    "Together, we keep dreams alive and spread goodness beyond life."
                </p>
                <div className="text-sm text-white/80">
                    <p>&copy; {new Date().getFullYear()} Book My Last Wishes. All Rights Reserved.</p>
                    <p>A venture by Aviyana Ventures.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;