
import React, { useState, useEffect, useMemo } from 'react';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';

const PatronDetailModal: React.FC<{ patron: any, onClose: () => void }> = ({ patron, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative animate-fadeUp"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-charcoal/50 hover:text-charcoal text-3xl font-bold">&times;</button>
                <div className="flex items-center mb-6">
                    <img src={patron.avatar_url || `https://i.pravatar.cc/150?u=${patron.id}`} alt={patron.full_name} className="w-20 h-20 rounded-full mr-4 object-cover border-4 border-golden" loading="lazy" />
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-deep-blue">{patron.full_name || 'N/A'}</h3>
                        <p className="text-sm text-charcoal/70">{patron.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-bold text-emerald mb-2 border-b pb-1">Personal Information</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <p><strong>DOB:</strong> {patron.dob || 'N/A'}</p>
                            <p><strong>Sex:</strong> {patron.sex || 'N/A'}</p>
                            <p><strong>Religion:</strong> {patron.religion || 'N/A'}</p>
                            <p><strong>Occupation:</strong> {patron.occupation || 'N/A'}</p>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-bold text-emerald mb-2 border-b pb-1">Contact Details</h4>
                        <div className="grid grid-cols-1 gap-y-2 text-sm">
                            <p><strong>Address:</strong> {patron.address || 'N/A'}</p>
                            <p><strong>Contact #:</strong> {patron.contact_number || 'N/A'}</p>
                            <p><strong>Relatives' #:</strong> {patron.relatives_contact || 'N/A'}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald mb-2 border-b pb-1">Legacy Details</h4>
                         <div className="grid grid-cols-1 gap-y-2 text-sm">
                             <p><strong>Service Grade:</strong> {patron.service_grade || 'N/A'}</p>
                            <p><strong>Memorable Deeds:</strong> <span className="italic">"{patron.memorable_deeds || 'N/A'}"</span></p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-emerald mb-2 border-b pb-1">Top Memories</h4>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {patron.top_memories_url && patron.top_memories_url.length > 0 ? (
                                patron.top_memories_url.map((url: string, index: number) => (
                                    <a href={url} target="_blank" rel="noopener noreferrer" key={index}>
                                        <img src={url} alt={`Memory ${index + 1}`} className="w-full h-24 object-cover rounded-md shadow-sm hover:scale-105 transition-transform" loading="lazy" />
                                    </a>
                                ))
                            ) : (
                                <p className="col-span-3 text-sm text-charcoal/70">No memories uploaded.</p>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-center text-charcoal/50 pt-4 border-t mt-6">Last updated: {new Date(patron.updated_at).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};


const AdminPanel: React.FC = () => {
    const [patrons, setPatrons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatron, setSelectedPatron] = useState<any | null>(null);


    useEffect(() => {
        const fetchAllPatrons = async () => {
            if (!SUPABASE_CONFIGURED) {
                setError("Supabase is not configured.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const { data, error } = await supabase.from('patrons').select('*').order('updated_at', { ascending: false });
                if (error) throw error;
                setPatrons(data || []);
            } catch (err: any) {
                setError(`Failed to fetch patrons: ${err.message}. Ensure you have admin privileges and RLS is correctly set up.`);
            } finally {
                setLoading(false);
            }
        };

        fetchAllPatrons();
    }, []);

    const filteredPatrons = useMemo(() => {
        if (!searchTerm) return patrons;
        const lowercasedTerm = searchTerm.toLowerCase();
        return patrons.filter(p =>
            p.full_name?.toLowerCase().includes(lowercasedTerm) ||
            p.email?.toLowerCase().includes(lowercasedTerm) ||
            p.id?.toLowerCase().includes(lowercasedTerm)
        );
    }, [patrons, searchTerm]);

    return (
        <div>
            <h3 className="text-2xl font-serif font-bold text-deep-blue mb-4">Admin Panel</h3>
            <div className="p-6 bg-white border rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-serif font-bold text-deep-blue">Manage Patrons</h4>
                    <p className="text-sm font-semibold text-charcoal">Total: {filteredPatrons.length}</p>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-golden"
                    />
                </div>

                {loading && <p>Loading patron data...</p>}
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
                
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white text-sm">
                            <thead className="bg-deep-blue/10">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-charcoal">Name</th>
                                    <th className="p-3 text-left font-semibold text-charcoal">Email</th>
                                    <th className="p-3 text-left font-semibold text-charcoal">Service Grade</th>
                                    <th className="p-3 text-left font-semibold text-charcoal">Last Updated</th>
                                    <th className="p-3 text-left font-semibold text-charcoal">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatrons.map(patron => (
                                    <tr key={patron.id} className="border-b hover:bg-light-grey">
                                        <td className="p-3">{patron.full_name || 'N/A'}</td>
                                        <td className="p-3">{patron.email}</td>
                                        <td className="p-3 text-center">{patron.service_grade || 'N/A'}</td>
                                        <td className="p-3">{patron.updated_at ? new Date(patron.updated_at).toLocaleDateString() : 'N/A'}</td>
                                        <td className="p-3">
                                            <button onClick={() => setSelectedPatron(patron)} className="font-semibold text-emerald hover:underline">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 {!loading && filteredPatrons.length === 0 && <p className="text-center p-4">No patrons found.</p>}
            </div>
            {selectedPatron && <PatronDetailModal patron={selectedPatron} onClose={() => setSelectedPatron(null)} />}
        </div>
    );
};

export default AdminPanel;
