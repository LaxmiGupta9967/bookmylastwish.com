import React, { useState, useEffect } from 'react';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';

const statusColors: { [key: string]: string } = {
    'Fulfilled': 'bg-emerald text-white',
    'In Progress': 'bg-marigold text-white',
    'Active': 'bg-deep-blue text-white',
};

// --- Patron Data Type ---
// This defines the structure of the data the card components will use.
type Patron = {
    id: string;
    name: string;
    photo: string;
    wishes: string[];
    status: 'Fulfilled' | 'In Progress' | 'Active';
    badge: string;
    story: string;
    images: string[];
    occupation: string;
    religion: string;
    service_grade: string;
};

const QrCodeModal: React.FC<{ patron: Patron, onClose: () => void }> = ({ patron, onClose }) => {
    const legacyUrl = `https://www.bookmylastwishes.com/legacy/${patron.id}`;
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(legacyUrl)}`;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-2xl p-6 text-center max-w-sm w-full relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-2 right-2 text-charcoal/50 hover:text-charcoal text-2xl font-bold">&times;</button>
                <h3 className="text-xl font-serif font-bold text-deep-blue mb-2">Share {patron.name}'s Legacy</h3>
                <p className="text-sm text-charcoal mb-4">Scan the QR code to view the legacy page.</p>
                <img src={qrCodeApiUrl} alt={`QR Code for ${patron.name}'s legacy`} className="mx-auto border-4 border-golden p-1 rounded-md" loading="lazy" />
                <p className="text-xs text-charcoal/60 mt-4 break-all">{legacyUrl}</p>
            </div>
        </div>
    );
};

const FlippableCard: React.FC<{ patron: Patron }> = ({ patron }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent flipping if the QR code button was clicked
        if ((e.target as HTMLElement).closest('.qr-button')) {
            return;
        }
        setIsFlipped(!isFlipped);
    };

    return (
        <>
            {/* The outer div provides the 3D perspective for the flip effect. */}
            <div className="w-full [perspective:1000px]" onClick={handleCardClick}>
                {/* 
                  This is the flipping container. It uses preserve-3d and rotates on state change.
                  The container is relatively positioned, and the front face sets its height automatically.
                  The back face is absolutely positioned to overlay the front face.
                */}
                <div className={`relative w-full cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    {/* Front Face: This will define the height of the parent 'relative' container */}
                    <div className="[backface-visibility:hidden] w-full bg-white rounded-lg shadow-md p-4 border-t-4 border-golden flex flex-col">
                        <div className="flex items-center mb-3">
                            <img src={patron.photo} alt={patron.name} className="w-16 h-16 rounded-full mr-4 object-cover" loading="lazy" />
                            <div>
                                <h3 className="font-serif font-bold text-lg text-deep-blue">{patron.name}</h3>
                                <p className="text-xs text-charcoal truncate">{patron.id}</p>
                            </div>
                        </div>
                        <div className="my-3 flex-grow">
                            <h4 className="font-bold text-sm text-charcoal mb-1">Dream List:</h4>
                            <ul className="space-y-1 text-sm list-disc list-inside">
                                {patron.wishes.slice(0, 3).map((wish, i) => <li key={i}>{wish}</li>)}
                            </ul>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[patron.status]}`}>{patron.status}</span>
                            <span className="text-lg">{patron.badge.split(' ')[0]}</span>
                        </div>
                    </div>

                    {/* Back Face: Absolutely positioned to overlay the front face */}
                    <div className="absolute top-0 left-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-deep-blue text-white rounded-lg shadow-md p-4 border-t-4 border-marigold flex flex-col justify-between">
                         <div>
                            <h4 className="font-serif font-bold text-golden text-center mb-2">Legacy Details</h4>
                            <p className="text-sm italic mb-2">"{patron.story}"</p>
                             <div className="text-xs space-y-1 mb-2 text-left bg-white/10 p-2 rounded">
                                <p><strong>Service:</strong> Grade {patron.service_grade} - {patron.badge.substring(2)}</p>
                                <p><strong>Occupation:</strong> {patron.occupation || 'N/A'}</p>
                            </div>
                            <div className="grid grid-cols-5 gap-1">
                                {patron.images && patron.images.length > 0 ? (
                                    patron.images.map((img, i) => <img key={i} src={img} alt="memory" className="w-full h-10 object-cover rounded" loading="lazy" />)
                                ) : (
                                    <div className="col-span-5 text-center text-xs text-white/50 py-2 italic">No memories shared.</div>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 text-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowQrModal(true);
                                }}
                                className="qr-button bg-golden text-deep-blue text-xs font-bold py-2 px-4 rounded-full transition-transform transform hover:scale-105"
                            >
                                Generate QR Code
                            </button>
                             <p className="text-center text-xs mt-2 text-golden/70">Click card to flip back</p>
                        </div>
                    </div>
                </div>
            </div>
            {showQrModal && <QrCodeModal patron={patron} onClose={() => setShowQrModal(false)} />}
        </>
    );
};


// --- Main Cascade Component ---
const Cascade: React.FC = () => {
    const [patrons, setPatrons] = useState<Patron[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    /**
     * Transforms a patron record from the database into the format needed by the UI card.
     * @param dbPatron - The raw data object from the 'patrons' table.
     * @returns A `Patron` object formatted for the UI.
     */
    const transformPatronData = (dbPatron: any): Patron => {
        const getBadge = (grade: string | null): string => {
            const gradeMap: { [key: string]: string } = {
                '1': '👨‍👩‍👧‍👦 Family Guardian', '2': '❤️ Kind Heart', '3': '🏫 Community Builder',
                '4': '🎉 Event Champion', '5': '🕊️ Legacy Keeper', '6': '🤝 Collective Giver',
            };
            return grade ? gradeMap[grade] : '💖 Legacy Maker';
        };

        const getWishes = (patron: any): string[] => {
             const serviceGradeMap: { [key: string]: string } = {
                '1': "Ensure family care and rituals.", '2': "Make small social contributions.",
                '3': "Contribute to social infrastructure.", '4': "Organize community activities.",
                '5': "Preserve a spiritual legacy.", '6': "Support a large collective cause.",
            };
            const wishes = [serviceGradeMap[patron.service_grade] || 'Leave a positive impact.'];
            if (patron.memorable_deeds) {
                wishes.push(patron.memorable_deeds.substring(0, 50) + '...');
            }
            return wishes;
        };

        return {
            id: dbPatron.id,
            name: dbPatron.full_name,
            photo: dbPatron.avatar_url || dbPatron.top_memories_url?.[0] || `https://i.pravatar.cc/150?u=${dbPatron.id}`,
            wishes: getWishes(dbPatron),
            status: 'Active',
            badge: getBadge(dbPatron.service_grade),
            story: dbPatron.memorable_deeds || "A life dedicated to kindness and community.",
            images: (dbPatron.top_memories_url || []).slice(0, 5),
            occupation: dbPatron.occupation,
            religion: dbPatron.religion,
            service_grade: dbPatron.service_grade,
        };
    };
    
    // --- Effect to Fetch Live Data ---
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const fetchPatrons = async () => {
             if (!SUPABASE_CONFIGURED) {
                setError("Supabase is not configured. Cannot fetch live data.");
                setLoading(false);
                return;
            }

            try {
                const { data, error: fetchError } = await supabase
                    .from('patrons')
                    .select('id, full_name, avatar_url, top_memories_url, service_grade, memorable_deeds, occupation, religion')
                    .limit(20) // Limit to a reasonable number for the public page.
                    .abortSignal(signal); 

                if (fetchError) throw fetchError;
                
                if (data) {
                    const transformedData = data.map(transformPatronData);
                    setPatrons(transformedData);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setError("Could not fetch patron data. This could be due to network issues or database permissions.");
                    console.error("Cascade fetch error:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPatrons();
        
        return () => {
            controller.abort();
        };
    }, []);
    
    const filteredPatrons = patrons.filter(patron => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return patron.name.toLowerCase().includes(lowercasedTerm) ||
               (typeof patron.id === 'string' && patron.id.toLowerCase().includes(lowercasedTerm)) ||
               patron.wishes.some(wish => wish.toLowerCase().includes(lowercasedTerm));
    });

    const renderContent = () => {
        if (loading) {
            return <p className="text-center text-lg text-charcoal py-16">Fetching latest legacies...</p>;
        }
        if (error) {
            return <p className="text-center text-lg text-red-600 bg-red-100 p-4 rounded-md py-16">{error}</p>;
        }
        if (filteredPatrons.length > 0) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredPatrons.map((patron, index) => (
                        <div key={patron.id} className="fade-in-section" style={{ transitionDelay: `${index * 50}ms` }}>
                           <FlippableCard patron={patron} />
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <div className="text-center py-16">
                <p className="text-xl text-charcoal font-semibold">
                    {searchTerm ? "No patrons found matching your search." : "No legacies have been shared yet."}
                </p>
                <p className="text-charcoal/80 mt-2">
                    {searchTerm ? "Try searching for a different name or ID." : "Be the first to share your story."}
                </p>
            </div>
        );
    };

    return (
        <section id="cascade" className="py-20 bg-gradient-to-b from-golden/10 via-white to-rose-gold/10">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold text-deep-blue">The Cascade of Wishes</h2>
                    <p className="mt-2 text-lg text-charcoal">"Every life is a story. Every wish is a legacy. Here, dreams continue to shine."</p>
                </div>

                <div className="mb-10 max-w-xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search by Patron Name, ID, or Wish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-5 py-3 border border-gray-300 rounded-full shadow-sm bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-golden transition-all duration-300 ease-in-out hover:bg-marigold/20 hover:border-golden"
                        aria-label="Search Patrons"
                    />
                </div>

                {renderContent()}
            </div>
        </section>
    );
};

export default Cascade;
