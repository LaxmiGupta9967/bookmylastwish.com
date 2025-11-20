





import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';
import { Session, AuthError, Factor } from '@supabase/supabase-js';
import { View } from '../App';
import Cascade from './Cascade';
import AdminPanel from './AdminPanel';
import RazorpayCheckout from './RazorpayCheckout';

type Tab = 'profile' | 'wishes' | 'nominees' | 'documents' | 'letters' | 'cascade' | 'delivery' | 'subscription' | 'support' | 'security' | 'admin';

// --- Reusable UI Components ---
const Message: React.FC<{ message: { type: 'success' | 'error', text: string } | null; onDismiss?: () => void }> = ({ message, onDismiss }) => {
    if (!message) return null;
    const isSuccess = message.type === 'success';
    const bgColor = isSuccess ? 'bg-emerald/10' : 'bg-red-100';
    const textColor = isSuccess ? 'text-emerald' : 'text-red-600';
    const borderColor = isSuccess ? 'border-emerald/50' : 'border-red-500/50';

    return (
        <div className={`p-3 my-4 border-l-4 ${borderColor} ${bgColor} ${textColor} rounded-md text-sm font-semibold flex justify-between items-center`}>
            <span>{message.text}</span>
            {onDismiss && (
                <button onClick={onDismiss} className="text-xl font-bold ml-4">&times;</button>
            )}
        </div>
    );
};


// --- Main Patron Profile Tab ---
const PatronProfileTab: React.FC<{ session: Session }> = ({ session }) => {
    const [loading, setLoading] = useState(true);
    const [patron, setPatron] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [uploading, setUploading] = useState(false);

    const getPatronProfile = useCallback(async () => {
        try {
            setLoading(true);
            const { user } = session;

            const { data, error } = await supabase
                .from('patrons')
                .select(`*`)
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) {
                setPatron(data);
            } else {
                setPatron({
                    full_name: user.user_metadata.name || '',
                    email: user.email,
                    top_memories_url: [],
                    avatar_url: null,
                });
            }
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred while fetching your profile.' });
            }
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        getPatronProfile();
    }, [getPatronProfile]);
    
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File size too large. Please upload an image smaller than 2MB.' });
            return;
        }

        setUploading(true);
        setMessage(null);
        try {
            const filePath = `${session.user.id}/avatar.png`;

            const { error: uploadError } = await supabase.storage
                .from('memories')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('memories').getPublicUrl(filePath);
            const publicUrl = `${data.publicUrl}?t=${new Date().getTime()}`;

            // Use upsert to create the row if it doesn't exist
            const { error: dbError } = await supabase.from('patrons').upsert({
                id: session.user.id,
                email: session.user.email,
                full_name: patron.full_name || session.user.user_metadata.name,
                avatar_url: publicUrl,
                updated_at: new Date()
            });

            if (dbError) {
                 if (dbError.code === '23502') {
                    throw new Error("Please complete and save your basic profile details (Name, DOB, etc.) in the form below before uploading a picture.");
                }
                throw dbError;
            }
            
            setPatron((p: any) => ({ ...p, avatar_url: publicUrl }));
            setMessage({ type: 'success', text: 'Profile picture updated!' });

        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred during upload.' });
            }
        } finally {
            setUploading(false);
        }
    };

    const handleAvatarRemove = async () => {
        if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    
        setUploading(true);
        setMessage(null);
        try {
            // Use upsert to ensure we don't fail if the row is missing (though unlikely if they have an avatar)
            const { error: dbError } = await supabase
                .from('patrons')
                .upsert({ 
                    id: session.user.id,
                    email: session.user.email,
                    full_name: patron.full_name,
                    avatar_url: null, 
                    updated_at: new Date() 
                });
    
            if (dbError) throw dbError;
    
            setPatron((p: any) => ({ ...p, avatar_url: null }));
            setMessage({ type: 'success', text: 'Profile picture removed.' });
            
            const filePath = `${session.user.id}/avatar.png`;
            const { error: removeError } = await supabase.storage.from('memories').remove([filePath]);
            if (removeError && removeError.message !== 'The resource was not found') {
                 console.warn("DB updated but failed to remove storage file:", removeError.message);
            }
    
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred while removing the picture.' });
            }
        } finally {
            setUploading(false);
        }
    };


    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);
        try {
            const updates = { ...patron, id: session.user.id, updated_at: new Date() };
            const { error } = await supabase.from('patrons').upsert(updates);
            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred while updating the profile.' });
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleMemoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setMessage(null);
        try {
            // Type safe conversion
            const fileArray = Array.from(files) as File[];

            const uploadPromises = fileArray.map(async (file) => {
                const filePath = `${session.user.id}/${Date.now()}-${file.name}`;
                const { error } = await supabase.storage.from('memories').upload(filePath, file);
                if (error) throw error;
                const { data } = supabase.storage.from('memories').getPublicUrl(filePath);
                return data.publicUrl;
            });

            const newUrls = await Promise.all(uploadPromises);
            const updatedUrls = [...(patron.top_memories_url || []), ...newUrls];

            // Use upsert to handle cases where the patron record doesn't exist yet
            const { error } = await supabase.from('patrons').upsert({
                id: session.user.id,
                email: session.user.email,
                full_name: patron.full_name || session.user.user_metadata.name,
                top_memories_url: updatedUrls,
                updated_at: new Date()
            });

            if (error) throw error;

            setPatron((p: any) => ({...p, top_memories_url: updatedUrls }));
            setMessage({ type: 'success', text: 'Memories uploaded successfully!' });
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `Upload failed: ${error.message}` });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred during memory upload.' });
            }
        } finally {
            setUploading(false);
        }
    };

    const handleMemoryDelete = async (urlToDelete: string) => {
        if (!window.confirm("Are you sure you want to delete this memory?")) return;
        
        setMessage(null);
        try {
            const updatedUrls = patron.top_memories_url.filter((url: string) => url !== urlToDelete);
            const urlParts = new URL(urlToDelete).pathname.split('/');
            const filePath = urlParts.slice(urlParts.indexOf(session.user.id)).join('/');

            const { error: dbError } = await supabase.from('patrons').upsert({ 
                id: session.user.id,
                email: session.user.email,
                full_name: patron.full_name,
                top_memories_url: updatedUrls,
                updated_at: new Date()
            });

            if (dbError) throw dbError;
            
            setPatron((p: any) => ({ ...p, top_memories_url: updatedUrls }));
            setMessage({ type: 'success', text: 'Memory deleted.' });
            
            const { error: storageError } = await supabase.storage.from('memories').remove([filePath]);
             if (storageError && storageError.message !== 'The resource was not found') {
                console.warn("DB updated but failed to remove storage file:", storageError.message);
            }
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `Deletion failed: ${error.message}` });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred during memory deletion.' });
            }
        }
    };

    const inputStyles = "w-full p-3 border border-gray-300 rounded-md bg-white text-charcoal";

    if (loading) {
        return <p>Loading your profile...</p>;
    }

    if (!patron) {
        return <p>No profile data found. Please fill out the pledge form on the main page first.</p>;
    }
    
    return (
        <div>
            <h3 className="text-2xl font-serif font-bold text-deep-blue mb-4">Patron Profile</h3>
            <div className="p-6 bg-white border rounded-lg shadow-md text-charcoal">
                 <div className="flex items-center gap-6 mb-8 pb-6 border-b">
                    <img 
                        src={patron.avatar_url || `https://i.pravatar.cc/150?u=${session.user.id}`} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-golden"
                        loading="lazy"
                    />
                    <div className="space-y-2">
                        <label htmlFor="avatar-upload" className="cursor-pointer bg-deep-blue text-white font-bold py-2 px-4 rounded-full hover:bg-deep-blue/90 text-sm transition-colors">
                            {uploading ? 'Uploading...' : 'Upload Picture'}
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
                        {patron.avatar_url && (
                             <button type="button" onClick={handleAvatarRemove} disabled={uploading} className="text-sm text-red-600 hover:underline block mt-2">
                                Remove Picture
                             </button>
                        )}
                    </div>
                </div>
                
                <Message message={message} onDismiss={() => setMessage(null)} />

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Full Name</label>
                            <input type="text" value={patron.full_name || ''} onChange={(e) => setPatron({...patron, full_name: e.target.value})} className={inputStyles} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
                            <input type="email" value={patron.email || ''} readOnly className={`${inputStyles} bg-gray-200 cursor-not-allowed`} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Date of Birth</label>
                            <input type="date" value={patron.dob || ''} onChange={(e) => setPatron({...patron, dob: e.target.value})} className={inputStyles} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Contact Number</label>
                            <input type="tel" value={patron.contact_number || ''} onChange={(e) => setPatron({...patron, contact_number: e.target.value})} className={inputStyles} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Address</label>
                        <textarea value={patron.address || ''} onChange={(e) => setPatron({...patron, address: e.target.value})} rows={3} className={inputStyles}></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Memorable Deeds</label>
                        <textarea value={patron.memorable_deeds || ''} onChange={(e) => setPatron({...patron, memorable_deeds: e.target.value})} rows={3} className={inputStyles}></textarea>
                    </div>
                    <button type="submit" disabled={loading} className="bg-emerald text-white font-bold py-2 px-6 rounded-full hover:bg-emerald/90 transition-colors disabled:opacity-50">
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>

                <div className="mt-8 border-t pt-6">
                    <h4 className="text-xl font-serif font-bold text-deep-blue mb-4">My Top Memories</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                        {patron.top_memories_url?.map((url: string) => (
                            <div key={url} className="relative group">
                                <img src={url} alt="Memory" className="w-full h-32 object-cover rounded-lg shadow-md" loading="lazy" />
                                <button onClick={() => handleMemoryDelete(url)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                            </div>
                        ))}
                    </div>
                     <div>
                        <label htmlFor="memory-upload" className="block text-sm font-medium text-charcoal mb-1">Upload New Memories</label>
                        <input id="memory-upload" type="file" multiple onChange={handleMemoryUpload} disabled={uploading} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-golden/20 file:text-golden hover:file:bg-golden/30"/>
                        {uploading && <p className="text-sm text-emerald mt-2">Uploading files...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Nominees Tab ---

interface Nominee {
    id: number;
    nominee_name: string;
    nominee_email: string;
    relationship: string;
    permissions: { [key: string]: boolean };
}

const NomineesTab: React.FC<{ session: Session }> = ({ session }) => {
    const [nominees, setNominees] = useState<Nominee[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingNominee, setEditingNominee] = useState<Nominee | null>(null);
    const [newNominee, setNewNominee] = useState({
        nominee_name: '',
        nominee_email: '',
        relationship: '',
        permissions: { viewWishes: true, viewDocuments: false, receiveLetters: true }
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    
    const fetchNominees = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('nominees')
                .select('*')
                .eq('user_id', session.user.id);
            if (error) throw error;
            setNominees(data || []);
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred while fetching nominees.' });
            }
        } finally {
            setLoading(false);
        }
    }, [session.user.id]);

    useEffect(() => {
        fetchNominees();
    }, [fetchNominees]);
    
    const resetForm = () => {
        setNewNominee({ nominee_name: '', nominee_email: '', relationship: '', permissions: { viewWishes: true, viewDocuments: false, receiveLetters: true } });
        setEditingNominee(null);
        setShowForm(false);
        setMessage(null);
    };

    const handleNomineeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            if (editingNominee) {
                const updatedData = { 
                    nominee_name: newNominee.nominee_name,
                    nominee_email: newNominee.nominee_email,
                    relationship: newNominee.relationship,
                    permissions: newNominee.permissions,
                };
                const { error } = await supabase.from('nominees').update(updatedData).eq('id', editingNominee.id);
                 if (error) throw error;
                 
                 setNominees(nominees.map(n => n.id === editingNominee.id ? { ...n, ...updatedData } : n));
                 setMessage({ type: 'success', text: 'Nominee updated successfully.' });
            } else {
                const { data, error } = await supabase.from('nominees').insert([{ ...newNominee, user_id: session.user.id }]).select();
                if (error) throw error;
                if (data) setNominees([...nominees, data[0]]);
                setMessage({ type: 'success', text: 'Nominee added successfully.' });
            }
            resetForm();
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred while saving the nominee.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditNominee = (nominee: Nominee) => {
        setEditingNominee(nominee);
        setNewNominee({
            nominee_name: nominee.nominee_name,
            nominee_email: nominee.nominee_email,
            relationship: nominee.relationship,
            permissions: {
                viewWishes: !!nominee.permissions.viewWishes,
                viewDocuments: !!nominee.permissions.viewDocuments,
                receiveLetters: !!nominee.permissions.receiveLetters,
            },
        });
        setShowForm(true);
        setMessage(null);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    
    const handleDeleteNominee = async (nomineeId: number) => {
        if (!window.confirm("Are you sure you want to delete this nominee? This action cannot be undone.")) return;

        setMessage(null);
        try {
            const { error } = await supabase.from('nominees').delete().eq('id', nomineeId);
            if (error) throw error;

            setNominees(currentNominees => currentNominees.filter(n => n.id !== nomineeId));
            setMessage({ type: 'success', text: 'Nominee deleted.' });

        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `Deletion failed: ${error.message}` });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred during deletion.' });
            }
        }
    };

    const inputStyles = "w-full p-3 border border-gray-300 rounded-md bg-white text-charcoal";

    return (
        <div>
            <h3 className="text-2xl font-serif font-bold text-deep-blue mb-4">Nominees / Executors</h3>
            <div className="p-6 bg-white border rounded-lg shadow-md text-charcoal">
                <p className="mb-6 text-charcoal/80">Add trusted people (family, friends, lawyers) who will receive your wishes. You can assign specific permissions for each nominee.</p>
                <Message message={message} onDismiss={() => setMessage(null)} />
                
                {showForm ? (
                    <form ref={formRef} onSubmit={handleNomineeSubmit} className="space-y-4 p-6 bg-white rounded-lg border mb-8">
                        <h4 className="text-xl font-serif font-bold text-deep-blue">{editingNominee ? 'Edit Nominee' : 'Add New Nominee'}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Full Name" value={newNominee.nominee_name} onChange={e => setNewNominee({ ...newNominee, nominee_name: e.target.value })} required className={inputStyles} />
                            <input type="email" placeholder="Email Address" value={newNominee.nominee_email} onChange={e => setNewNominee({ ...newNominee, nominee_email: e.target.value })} required className={inputStyles} />
                            <input type="text" placeholder="Relationship (e.g., Daughter)" value={newNominee.relationship} onChange={e => setNewNominee({ ...newNominee, relationship: e.target.value })} required className={inputStyles} />
                        </div>
                        <div>
                            <label className="font-bold">Permissions:</label>
                            <div className="flex flex-wrap gap-4 mt-2">
                                <label className="flex items-center"><input type="checkbox" checked={newNominee.permissions.viewWishes} onChange={e => setNewNominee({ ...newNominee, permissions: { ...newNominee.permissions, viewWishes: e.target.checked } })} className="mr-2" /> View Wishes</label>
                                <label className="flex items-center"><input type="checkbox" checked={newNominee.permissions.viewDocuments} onChange={e => setNewNominee({ ...newNominee, permissions: { ...newNominee.permissions, viewDocuments: e.target.checked } })} className="mr-2" /> View Documents</label>
                                <label className="flex items-center"><input type="checkbox" checked={newNominee.permissions.receiveLetters} onChange={e => setNewNominee({ ...newNominee, permissions: { ...newNominee.permissions, receiveLetters: e.target.checked } })} className="mr-2" /> Receive Letters</label>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" disabled={loading} className="bg-emerald text-white font-bold py-2 px-6 rounded-full hover:bg-emerald/90 transition-colors disabled:opacity-50">{loading ? 'Saving...' : (editingNominee ? 'Update Nominee' : 'Save Nominee')}</button>
                            <button type="button" onClick={resetForm} className="bg-gray-200 text-charcoal font-bold py-2 px-6 rounded-full hover:bg-gray-300">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <button type="button" onClick={() => setShowForm(true)} className="mb-6 bg-golden text-deep-blue font-bold py-2 px-6 rounded-full hover:bg-marigold transition-colors">Add New Nominee</button>
                )}

                <div className="space-y-4">
                    {loading && nominees.length === 0 ? <p>Loading nominees...</p> : nominees.length > 0 ? (
                        nominees.map(nominee => (
                            <div key={nominee.id} className="p-4 border rounded-lg bg-light-grey flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-deep-blue">{nominee.nominee_name}</h4>
                                    <p className="text-sm text-charcoal">{nominee.nominee_email} | {nominee.relationship}</p>
                                    <p className="text-xs mt-1 text-emerald font-semibold">Permissions: {Object.entries(nominee.permissions).filter(([, val]) => val).map(([key]) => key).join(', ')}</p>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-4">
                                    <button onClick={() => handleEditNominee(nominee)} className="text-sm font-semibold text-deep-blue hover:underline">Edit</button>
                                    <button onClick={() => handleDeleteNominee(nominee.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-charcoal p-4 text-center border-2 border-dashed rounded-lg">You haven't added any nominees yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Documents Vault Tab ---

const DocumentsVaultTab: React.FC<{ session: Session }> = ({ session }) => {
    const formatBytes = (bytes: number, decimals = 2) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    interface Document {
        id: number;
        created_at: string;
        file_name: string;
        storage_path: string;
        file_size: number;
        mime_type: string;
    }

    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('documents').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            if (error instanceof Error) {
                // Only set message if it's not a "Bucket not found" error to avoid confusion
                // Actually, we should handle bucket errors gracefully too.
                 const msg = error.message;
                 if (!msg.includes('bucket_id not found')) {
                     setMessage({ type: 'error', text: msg });
                 }
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred while fetching documents.' });
            }
        } finally {
            setLoading(false);
        }
    }, [session.user.id]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setMessage(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setMessage(null);
        try {
            const filePath = `${session.user.id}/${selectedFile.name}`;
            
            // 1. Upload the file to Storage
            const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, selectedFile, { upsert: true });
            if (uploadError) throw uploadError;

            // 2. Insert metadata into the Database
            const { data, error: insertError } = await supabase.from('documents').upsert({
                user_id: session.user.id,
                file_name: selectedFile.name,
                storage_path: filePath,
                file_size: selectedFile.size,
                mime_type: selectedFile.type,
            }, { onConflict: 'user_id, file_name' }).select();
            
            if (insertError) throw insertError;
            
            setMessage({ type: 'success', text: 'Document uploaded successfully.' });
            setDocuments(docs => {
                const existingIndex = docs.findIndex(d => d.file_name === data[0].file_name);
                if (existingIndex > -1) {
                    const newDocs = [...docs];
                    newDocs[existingIndex] = data[0];
                    return newDocs;
                }
                return [data[0], ...docs];
            });
            setSelectedFile(null);
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error: any) {
            console.error("Document upload error:", error);
            
            let errorText = 'An unknown error occurred.';
            
            if (typeof error === 'string') {
                errorText = error;
            } else if (error && typeof error === 'object') {
                // Try to extract the most meaningful message
                if (typeof error.message === 'string') {
                    errorText = error.message;
                } else if (typeof error.error_description === 'string') {
                    errorText = error.error_description;
                } else if (error.error && typeof error.error.message === 'string') {
                    errorText = error.error.message;
                } else {
                    // Fallback to stringifying if it's a complex object
                    try {
                        const stringified = JSON.stringify(error);
                        if (stringified !== '{}') errorText = stringified;
                    } catch (e) {
                        errorText = 'Non-serializable error object.';
                    }
                }
            }

            if (errorText.includes('Bucket not found') || errorText.includes('The resource was not found') || errorText.includes('bucket_id not found')) {
                 setMessage({ type: 'error', text: 'System Error: The "documents" storage bucket is missing. Please run the SQL setup query provided.' });
            } else {
                 setMessage({ type: 'error', text: `Upload failed: ${errorText}` });
            }
        } finally {
            setUploading(false);
        }
    };
    
    const handleDelete = async (docId: number, storagePath: string) => {
        if (!window.confirm("Are you sure you want to delete this document permanently?")) return;
        
        setMessage(null);
        try {
            const { error: dbError } = await supabase.from('documents').delete().eq('id', docId);
            if (dbError) throw dbError;
            
            setDocuments(currentDocs => currentDocs.filter(doc => doc.id !== docId));
            setMessage({ type: 'success', text: 'Document deleted.' });

            const { error: storageError } = await supabase.storage.from('documents').remove([storagePath]);
            if (storageError && storageError.message !== 'The resource was not found') throw storageError;

        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `Deletion failed: ${error.message}` });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred during deletion.' });
            }
        }
    };

    const handleDownload = async (storagePath: string, fileName: string) => {
        setMessage(null);
        try {
            const { data, error } = await supabase.storage.from('documents').download(storagePath);
            if (error) throw error;
            const blob = data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `Download failed: ${error.message}` });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred during download.' });
            }
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-serif font-bold text-deep-blue mb-4">Documents Vault</h3>
            <div className="p-6 bg-white border rounded-lg shadow-md text-charcoal">
                <p className="mb-6 text-charcoal/80">A secure, encrypted place to upload important documents like your will, property papers, ID proofs, and insurance policies.</p>
                <Message message={message} onDismiss={() => setMessage(null)} />
                <div className="p-4 bg-light-grey border rounded-lg mb-8">
                    <h4 className="font-bold mb-2">Upload New Document</h4>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input id="file-upload" type="file" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-golden/20 file:text-golden hover:file:bg-golden/30"/>
                        <button onClick={handleUpload} disabled={!selectedFile || uploading} className="flex-shrink-0 bg-emerald text-white font-bold py-2 px-6 rounded-full hover:bg-emerald/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {uploading ? 'Uploading...' : 'Upload File'}
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="font-bold text-deep-blue">Your Uploaded Documents</h4>
                    {loading ? <p>Loading documents...</p> : documents.length > 0 ? (
                        documents.map(doc => (
                            <div key={doc.id} className="p-3 border rounded-lg bg-light-grey flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                    <p className="font-semibold text-deep-blue">📄 {doc.file_name}</p>
                                    <p className="text-xs text-charcoal/70">
                                        {formatBytes(doc.file_size)} | Uploaded on {new Date(doc.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-4 self-end sm:self-center">
                                     <button onClick={() => handleDownload(doc.storage_path, doc.file_name)} className="text-sm font-semibold text-emerald hover:underline">Download</button>
                                    <button onClick={() => handleDelete(doc.id, doc.storage_path)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-charcoal p-4 text-center border-2 border-dashed rounded-lg">You have not uploaded any documents yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Letters & Messages Tab ---

interface Letter {
    id: number;
    created_at: string;
    user_id: string;
    recipient_name: string;
    title: string;
    content: string;
    delivery_date: string | null;
    status: 'draft' | 'scheduled';
}

const LettersMessagesTab: React.FC<{ session: Session }> = ({ session }) => {
    const [letters, setLetters] = useState<Letter[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
    const [newLetter, setNewLetter] = useState({
        recipient_name: '',
        title: '',
        content: '',
        delivery_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const fetchLetters = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('letters')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setLetters(data || []);
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred while fetching letters.' });
            }
        } finally {
            setLoading(false);
        }
    }, [session.user.id]);

    useEffect(() => {
        fetchLetters();
    }, [fetchLetters]);
    
    const resetForm = () => {
        setNewLetter({ recipient_name: '', title: '', content: '', delivery_date: '' });
        setEditingLetter(null);
        setShowForm(false);
        setMessage(null);
    };
    
    const handleLetterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const letterData = {
                ...newLetter,
                user_id: session.user.id,
                delivery_date: newLetter.delivery_date || null,
                status: 'draft' as const,
            };

            if (editingLetter) {
                const { error } = await supabase.from('letters').update(letterData).eq('id', editingLetter.id);
                if (error) throw error;
                setLetters(letters.map(l => l.id === editingLetter.id ? { ...l, ...letterData } : l));
                setMessage({ type: 'success', text: 'Letter updated successfully.' });
            } else {
                 const { data, error } = await supabase.from('letters').insert([letterData]).select();
                if (error) throw error;
                if(data) setLetters([data[0], ...letters]);
                setMessage({ type: 'success', text: 'Letter saved successfully.' });
            }
           
            resetForm();
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred while saving the letter.' });
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleEditLetter = (letter: Letter) => {
        setEditingLetter(letter);
        setNewLetter({
            recipient_name: letter.recipient_name,
            title: letter.title,
            content: letter.content,
            delivery_date: letter.delivery_date ? new Date(letter.delivery_date).toISOString().split('T')[0] : ''
        });
        setShowForm(true);
        setMessage(null);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleDeleteLetter = async (letterId: number) => {
        if (!window.confirm("Are you sure you want to delete this letter?")) return;
        
        setMessage(null);
        try {
            const { error } = await supabase.from('letters').delete().eq('id', letterId);
            if (error) throw error;

            setLetters(currentLetters => currentLetters.filter(l => l.id !== letterId));
            setMessage({ type: 'success', text: 'Letter deleted.' });
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `Deletion failed: ${error.message}` });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred during deletion.' });
            }
        }
    };
    
    const inputStyles = "w-full p-3 border border-gray-300 rounded-md bg-white text-charcoal";
    
    return (
        <div>
            <h3 className="text-2xl font-serif font-bold text-deep-blue mb-4">Letters & Messages</h3>
            <div className="p-6 bg-white border rounded-lg shadow-md text-charcoal">
                <p className="mb-6 text-charcoal/80">Write letters to your loved ones. You can schedule them to be delivered on specific dates (birthdays, anniversaries, etc.) after your passing.</p>
                <Message message={message} onDismiss={() => setMessage(null)} />
                
                {showForm ? (
                    <form ref={formRef} onSubmit={handleLetterSubmit} className="space-y-4 p-6 bg-white rounded-lg border">
                        <h4 className="text-xl font-serif font-bold text-deep-blue">{editingLetter ? 'Edit Letter' : 'Compose a New Letter'}</h4>
                         <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Recipient's Name</label>
                            <input type="text" value={newLetter.recipient_name} onChange={(e) => setNewLetter({...newLetter, recipient_name: e.target.value})} required className={inputStyles} placeholder="e.g., My dear Grandchildren" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Title</label>
                            <input type="text" value={newLetter.title} onChange={(e) => setNewLetter({...newLetter, title: e.target.value})} required className={inputStyles} placeholder="e.g., A Message for Your Future" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Content</label>
                            <textarea value={newLetter.content} onChange={(e) => setNewLetter({...newLetter, content: e.target.value})} required rows={6} className={inputStyles} placeholder="Write your message here..."></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Scheduled Delivery Date (Optional)</label>
                            <input type="date" value={newLetter.delivery_date} onChange={(e) => setNewLetter({...newLetter, delivery_date: e.target.value})} className={inputStyles} />
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" disabled={loading} className="bg-emerald text-white font-bold py-2 px-6 rounded-full hover:bg-emerald/90 transition-colors disabled:opacity-50">
                                {loading ? 'Saving...' : (editingLetter ? 'Update Letter' : 'Save Letter')}
                            </button>
                             <button type="button" onClick={resetForm} className="bg-gray-200 text-charcoal font-bold py-2 px-6 rounded-full hover:bg-gray-300 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <button type="button" onClick={() => setShowForm(true)} className="mb-6 bg-golden text-deep-blue font-bold py-2 px-6 rounded-full hover:bg-marigold transition-colors">Write a New Letter</button>
                )}

                <div className="mt-8">
                    <h4 className="text-xl font-serif font-bold text-deep-blue mb-4">Your Saved Letters</h4>
                    {loading && letters.length === 0 ? <p>Loading letters...</p> : letters.length > 0 ? (
                        <div className="space-y-4">
                            {letters.map(letter => (
                                <div key={letter.id} className="p-4 border rounded-lg bg-light-grey flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-deep-blue">{letter.title}</h4>
                                        <p className="text-sm text-charcoal">To: {letter.recipient_name}</p>
                                        <p className="text-xs mt-1 text-emerald font-semibold">Status: {letter.status}</p>
                                        {letter.delivery_date && <p className="text-xs text-gray-500">Scheduled for: {new Date(letter.delivery_date).toLocaleDateString()}</p>}
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-4">
                                        <button onClick={() => handleEditLetter(letter)} className="text-sm font-semibold text-deep-blue hover:underline">Edit</button>
                                        <button onClick={() => handleDeleteLetter(letter.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <p className="text-charcoal p-4 text-center border-2 border-dashed rounded-lg">You haven't written any letters yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


const DeliverySettingsTab: React.FC<{ session: Session }> = ({ session }) => (
    <PlaceholderContent title="Delivery Settings">
        <p>This feature is coming soon! You will be able to choose how and when your wishes are released to your nominees after the verification of death.</p>
    </PlaceholderContent>
);

const SubscriptionPlansTab: React.FC<{ session: Session }> = ({ session }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [planToCheckout, setPlanToCheckout] = useState<any | null>(null);

    const plans = [
         {
            name: 'Basic',
            price: { monthly: 'Free', yearly: 0 },
            description: 'For individuals starting their legacy journey.',
            features: [
                { text: '1 GB Secure Document Storage', icon: 'storage' },
                { text: '3 Letters & Messages', icon: 'messages' },
                { text: '1 Nominee / Executor', icon: 'nominee' },
                { text: 'Access to My Wishes', icon: 'check' },
                { text: 'Basic Document Vault', icon: 'check' },
                { text: 'Email Support', icon: 'support' },
            ],
            buttonText: 'Current Plan',
            buttonClass: 'bg-gray-200 text-charcoal cursor-default',
            isPopular: false,
        },
        {
            name: 'Standard',
            price: { monthly: 299, yearly: 2999 },
            description: 'For those who want more storage and control.',
            features: [
                { text: '10 GB Secure Document Storage', icon: 'storage' },
                { text: '10 Letters & Messages', icon: 'messages' },
                { text: 'Up to 3 Nominees / Executors', icon: 'nominee' },
                { text: 'Priority Email Support', icon: 'support' },
                { text: 'Delivery Settings (SMS + Email)', icon: 'check' },
                { text: 'Document Sharing Options', icon: 'check' },
                { text: 'Activity Log', icon: 'check' },
            ],
            buttonText: 'Upgrade to Standard',
            buttonClass: 'bg-golden text-deep-blue hover:bg-marigold',
            isPopular: true,
        },
        {
            name: 'Premium',
            price: { monthly: 799, yearly: 7999 },
            description: 'The ultimate plan for complete peace of mind.',
            features: [
                { text: '100 GB Storage', icon: 'storage' },
                { text: 'Unlimited Letters & Messages', icon: 'messages' },
                { text: 'Unlimited Nominees / Executors', icon: 'nominee' },
                { text: 'Auto-Scheduled Wishes', icon: 'check' },
                { text: 'Lifetime Vault Access', icon: 'check' },
                { text: 'Advanced Security (2FA + Alerts)', icon: 'security' },
                { text: 'Dedicated Support Manager', icon: 'support' },
                { text: 'Priority Secure Delivery', icon: 'check' },
            ],
            buttonText: 'Upgrade to Premium',
            buttonClass: 'bg-deep-blue text-white hover:bg-deep-blue/90',
            isPopular: false,
        },
    ];

    const faqs = [
        { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. Your plan will remain active until the end of the current billing period, and you will not be charged again.' },
        { q: 'What happens to my data if my subscription expires?', a: 'Your data will be securely stored for a grace period of 90 days after expiration. You can renew your subscription anytime within this period to regain full access. After 90 days, data may be permanently deleted.' },
        { q: 'Is my information private and secure?', a: 'Absolutely. We use end-to-end encryption and adhere to strict privacy policies. Your data is only accessible to you and, upon verification, your designated nominees according to the permissions you set.' },
    ];
    
    const icons: { [key: string]: React.ReactElement } = {
        storage: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7s0 0 .001 0" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c-4.418 0-8-1.79-8-4s3.582-4 8-4 8 1.79 8 4-3.582 4-8 4z" /></svg>,
        messages: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        nominee: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        support: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        security: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944A12.02 12.02 0 0012 22a12.02 12.02 0 009-1.056v-1.056c0-2.365-1.93-4.298-4.382-4.522" /></svg>,
        check: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    };

    return (
        <div>
            <div className="text-center mb-10">
                <h3 className="text-3xl font-serif font-bold text-deep-blue">Subscription / Plans</h3>
                <p className="mt-2 text-lg text-charcoal/80 max-w-2xl mx-auto">Choose a plan that fits your needs. Upgrade anytime for more storage, advanced features, and enhanced security.</p>
            </div>
            
            <div className="flex justify-center items-center space-x-4 mb-10">
                <span className={`font-semibold ${billingCycle === 'monthly' ? 'text-deep-blue' : 'text-charcoal/60'}`}>Monthly</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={billingCycle === 'yearly'} onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className="sr-only peer" />
                    <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-deep-blue"></div>
                </label>
                <span className={`font-semibold ${billingCycle === 'yearly' ? 'text-deep-blue' : 'text-charcoal/60'}`}>
                    Yearly <span className="text-emerald text-sm">(Save 15%)</span>
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {plans.map((plan, index) => {
                    const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
                    return (
                        <div key={index} className={`bg-white rounded-lg p-6 shadow-lg flex flex-col transition-all duration-300 ${plan.isPopular ? 'border-2 border-golden transform lg:scale-105' : 'border'}`}>
                            {plan.isPopular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-golden text-deep-blue text-xs font-bold px-3 py-1 rounded-full uppercase">Most Popular</span>}
                            <h4 className="text-2xl font-serif font-bold text-deep-blue text-center">{plan.name}</h4>
                            <p className="text-center text-charcoal/70 mt-2 min-h-[40px]">{plan.description}</p>
                            <div className="text-center my-6">
                                <span className="text-4xl font-bold text-charcoal">{typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price}</span>
                                {plan.name !== 'Basic' && <span className="text-charcoal/60"> / {billingCycle === 'monthly' ? 'month' : 'year'}</span>}
                            </div>
                            <ul className="space-y-4 flex-grow mb-8">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start">
                                        <div className="flex-shrink-0 mr-3 mt-1">{icons[feature.icon]}</div>
                                        <span>{feature.text}</span>
                                    </li>
                                ))}
                            </ul>
                             <button 
                                onClick={() => {
                                    if (plan.name !== 'Basic') {
                                        setPlanToCheckout(plan);
                                    }
                                }} 
                                disabled={plan.name === 'Basic'}
                                className={`w-full font-bold py-3 px-6 rounded-full text-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonClass}`}>
                                {plan.buttonText}
                            </button>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-16 max-w-3xl mx-auto">
                <h4 className="text-2xl font-serif font-bold text-deep-blue text-center mb-6">Frequently Asked Questions</h4>
                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                            <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex justify-between items-center p-4 text-left font-semibold text-deep-blue bg-white hover:bg-light-grey/50">
                                <span>{faq.q}</span>
                                <span className={`transform transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                                <p className="p-4 bg-light-grey text-charcoal/90">{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {planToCheckout && (
                <RazorpayCheckout 
                    plan={planToCheckout}
                    session={session}
                    onClose={() => setPlanToCheckout(null)} 
                />
            )}
        </div>
    );
};

const SupportHelpTab: React.FC<{ session: Session, setView: (view: View) => void }> = ({ session, setView }) => {
    const [ticketMessage, setTicketMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketMessage.trim()) {
            setFormMessage({ type: 'error', text: 'Please enter a message for your ticket.' });
            return;
        }
        setLoading(true);
        setFormMessage(null);

        try {
            const { error } = await supabase.from('support_tickets').insert({
                user_id: session.user.id,
                name: session.user.user_metadata.name || session.user.email,
                email: session.user.email,
                message: ticketMessage,
                status: 'open'
            });

            if (error) throw error;

            setFormMessage({ type: 'success', text: 'Your support ticket has been submitted successfully!' });
            setTicketMessage('');
        } catch (error) {
            if (error instanceof Error) {
                setFormMessage({ type: 'error', text: `Submission failed: ${error.message}` });
            } else {
                 setFormMessage({ type: 'error', text: 'An unknown submission error occurred.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoToFaq = () => {
        setView('home');
        setTimeout(() => {
            const faqSection = document.getElementById('faq');
            faqSection?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };
    
    return (
        <div>
            <h3 className="text-2xl font-serif font-bold text-deep-blue mb-4">Support & Help</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: FAQ & Ticket Form */}
                <div className="lg:col-span-2 space-y-8">
                    {/* FAQ Card */}
                    <div className="p-6 bg-white border rounded-lg shadow-md">
                        <h4 className="text-xl font-serif font-bold text-deep-blue mb-2">Find Answers Fast</h4>
                        <p className="text-charcoal/80 mb-4">Check our FAQ page for answers to common questions about our services and processes.</p>
                        <button onClick={handleGoToFaq} className="bg-golden text-deep-blue font-bold py-2 px-6 rounded-full hover:bg-marigold transition-colors">Go to FAQ / Blog</button>
                    </div>

                    {/* Ticket Form Card */}
                    <div className="p-6 bg-white border rounded-lg shadow-md">
                        <h4 className="text-xl font-serif font-bold text-deep-blue mb-4">Submit a Support Ticket</h4>
                         <form onSubmit={handleTicketSubmit} className="space-y-4">
                            <Message message={formMessage} onDismiss={() => setFormMessage(null)} />
                             <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">Name</label>
                                <input type="text" value={session.user.user_metadata.name || ''} disabled className="w-full p-3 border border-gray-300 rounded-md bg-gray-200 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
                                <input type="email" value={session.user.email || ''} disabled className="w-full p-3 border border-gray-300 rounded-md bg-gray-200 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">How can we help you?</label>
                                <textarea value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} required rows={5} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-golden focus:outline-none" placeholder="Please describe your issue in detail..."></textarea>
                            </div>
                             <button type="submit" disabled={loading} className="bg-emerald text-white font-bold py-2 px-6 rounded-full hover:bg-emerald/90 transition-colors disabled:opacity-50">
                                {loading ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                         </form>
                    </div>
                </div>
                
                {/* Column 2: Emergency Contact */}
                <div className="lg:col-span-1">
                    <div className="p-6 bg-deep-blue/5 border rounded-lg shadow-md h-full">
                        <h4 className="text-xl font-serif font-bold text-deep-blue mb-4">Emergency Support</h4>
                         <div className="space-y-4 text-charcoal">
                            <div>
                                <h5 className="font-bold">Our Address</h5>
                                <p className="text-sm">Aviyana House-609, Parth Solitaire Commercial Complex, Plot No-2, Sector-9E, Next to D-Mart, Opposite Dominos, Above ICICI Bank, Roadpali Road, Kalamboli, Navi Mumbai, Maharashtra</p>
                            </div>
                            <div>
                                <h5 className="font-bold">Phone</h5>
                                <ul className="text-sm list-disc list-inside">
                                    <li>+91 9324190698</li>
                                    <li>+91 9004857376</li>
                                    <li>+91 8779101817</li>
                                    <li>+91 8779102007</li>
                                </ul>
                            </div>
                             <div>
                                <h5 className="font-bold">Email & Website</h5>
                                <p className="text-sm break-words">
                                    <a href="mailto:connect@aviyanaventures.com" className="text-marigold hover:underline">connect@aviyanaventures.com</a>
                                </p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- My Wishes Tab Component ---

interface Wish {
    id: number;
    created_at: string;
    title: string;
    description: string;
    user_id: string;
    type: 'text' | 'voice' | 'video';
}

const MyWishesTab: React.FC<{ session: Session }> = ({ session }) => {
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [editingWish, setEditingWish] = useState<Wish | null>(null);
    const [newWish, setNewWish] = useState({ title: '', description: '', type: 'text' as Wish['type'] });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const fetchWishes = useCallback(async () => {
        if (!SUPABASE_CONFIGURED) {
            setWishes([]);
            setMessage({type: 'error', text: "Data features are not configured."});
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('wishes')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setWishes(data || []);
        } catch (error) {
            if (error instanceof Error) {
                setMessage({type: 'error', text: error.message});
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred while fetching wishes.' });
            }
        } finally {
            setLoading(false);
        }
    }, [session.user.id]);

    useEffect(() => {
        fetchWishes();
    }, [fetchWishes]);
    
    const resetForm = () => {
        setNewWish({ title: '', description: '', type: 'text' });
        setEditingWish(null);
        setMessage(null);
    };

    const handleWishSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!SUPABASE_CONFIGURED) return;
        setLoading(true);
        setMessage(null);
        try {
            if (editingWish) {
                 const updatedData = {
                     title: newWish.title,
                     description: newWish.description,
                     type: newWish.type
                 };
                 const { error } = await supabase.from('wishes').update(updatedData).eq('id', editingWish.id);
                 if (error) throw error;
                 setWishes(wishes.map(w => w.id === editingWish.id ? { ...w, ...updatedData } : w));
                 setMessage({ type: 'success', text: 'Wish updated successfully.' });
            } else {
                const { data, error } = await supabase.from('wishes').insert([{ ...newWish, user_id: session.user.id }]).select();
                if (error) throw error;
                if (data) setWishes([data[0], ...wishes]);
                 setMessage({ type: 'success', text: 'Wish saved successfully.' });
            }
            resetForm();
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred while saving the wish.' });
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleEditWish = (wish: Wish) => {
        setEditingWish(wish);
        setNewWish({ title: wish.title, description: wish.description, type: wish.type });
        setMessage(null);
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDeleteWish = async (wishId: number) => {
        if (!window.confirm("Are you sure you want to delete this wish permanently?")) return;
        
        setMessage(null);
        try {
            const { error } = await supabase.from('wishes').delete().eq('id', wishId);
            if (error) throw error;

            setWishes(currentWishes => currentWishes.filter(w => w.id !== wishId));
            setMessage({ type: 'success', text: 'Wish deleted.' });
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `Deletion failed: ${error.message}` });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred during deletion.' });
            }
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-serif font-bold text-deep-blue mb-4">My Wishes</h3>
             <p className="mb-6 text-charcoal/80">Write, edit, and organize your last wishes. You can add them as text, or upload voice and video messages for your loved ones.</p>
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <form ref={formRef} onSubmit={handleWishSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md">
                        <h4 className="text-xl font-serif font-bold text-deep-blue">{editingWish ? 'Edit Wish' : 'Create a New Wish'}</h4>
                        <Message message={message} onDismiss={() => setMessage(null)} />
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Wish Title</label>
                            <input type="text" value={newWish.title} onChange={(e) => setNewWish({...newWish, title: e.target.value})} required className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-golden" placeholder="e.g., Plant 100 Trees" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">Type of Wish</label>
                             <select value={newWish.type} onChange={(e) => setNewWish({...newWish, type: e.target.value as Wish['type']})} className="w-full p-3 border border-gray-300 rounded-md bg-white">
                                <option value="text">✍️ Text Message</option>
                                <option value="voice">🎤 Voice Message</option>
                                <option value="video">🎥 Video Message</option>
                            </select>
                        </div>
                         {newWish.type === 'text' && (
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">Description</label>
                                <textarea value={newWish.description} onChange={(e) => setNewWish({...newWish, description: e.target.value})} required rows={4} className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-golden" placeholder="Describe your wish..."></textarea>
                            </div>
                        )}
                        {(newWish.type === 'voice' || newWish.type === 'video') && (
                             <div>
                                <label className="block text-sm font-medium text-charcoal mb-1">Upload File</label>
                                <input type="file" accept={newWish.type === 'voice' ? 'audio/*' : 'video/*'} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-golden/20 file:text-golden hover:file:bg-golden/30"/>
                            </div>
                        )}
                        <div className="flex gap-2">
                             <button type="submit" disabled={loading} className="w-full bg-golden text-deep-blue font-bold py-3 rounded-full text-lg transition-transform transform hover:scale-105 disabled:opacity-50">
                                {loading ? 'Saving...' : (editingWish ? 'Update Wish' : 'Save Wish')}
                            </button>
                            {editingWish && (
                                <button type="button" onClick={resetForm} className="w-full bg-gray-200 text-charcoal font-bold py-3 rounded-full text-lg hover:bg-gray-300">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
                <div className="lg:col-span-2">
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h4 className="text-xl font-serif font-bold text-deep-blue mb-4">Your Pledged Wishes</h4>
                        {loading && wishes.length === 0 ? <p>Loading wishes...</p> : wishes.length > 0 ? (
                            <div className="space-y-4">
                                {wishes.map(wish => (
                                    <div key={wish.id} className="p-4 border border-gray-200 rounded-lg bg-light-grey/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-bold text-lg text-emerald">{wish.type === 'text' ? '✍️' : wish.type === 'voice' ? '🎤' : '🎥'} {wish.title}</h5>
                                                <p className="text-charcoal mt-1">{wish.description}</p>
                                            </div>
                                            <div className="flex-shrink-0 flex items-center gap-4 ml-4">
                                                <button onClick={() => handleEditWish(wish)} className="text-sm font-semibold text-deep-blue hover:underline">Edit</button>
                                                <button onClick={() => handleDeleteWish(wish.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Pledged on: {new Date(wish.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-charcoal p-4 text-center border-2 border-dashed rounded-lg">You haven't created any wishes yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Security Settings Tab ---
const SecuritySettingsTab: React.FC<{ session: Session; setView: (view: View) => void }> = ({ session, setView }) => {
    // Shared state
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const inputStyles = "w-full p-3 border border-gray-300 rounded-md bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-golden";
    const buttonStyles = "bg-deep-blue text-white font-bold py-2 px-6 rounded-full hover:bg-deep-blue/90 transition-colors disabled:opacity-50";

    // Change Password state and handlers
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        setLoading({ ...loading, password: true });
        setMessage(null);
        try {
            // Re-authenticate user
            const { error: reauthError } = await supabase.auth.reauthenticate();
             if (reauthError) { // This will prompt for password if needed, or use existing session
                 // A simple re-authentication check. For higher security, force password entry.
                 const { error: signInError } = await supabase.auth.signInWithPassword({ email: session.user.email!, password: currentPassword });
                 if (signInError) throw new Error("Current password is incorrect.");
             }

            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Password updated successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `Error changing password: ${error.message}` });
            } else {
                 setMessage({ type: 'error', text: 'An unknown error occurred.' });
            }
        } finally {
            setLoading({ ...loading, password: false });
        }
    };
    
    // 2FA state and handlers
    const [mfaFactors, setMfaFactors] = useState<Factor[]>([]);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollData, setEnrollData] = useState<{ qr_code: string; secret: string; factorId: string } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');

    const fetchMfaStatus = useCallback(async () => {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) {
            setMessage({ type: 'error', text: `Could not fetch MFA status: ${error.message}`});
            return;
        }
        setMfaFactors(data.totp);
    }, []);

    useEffect(() => {
        fetchMfaStatus();
    }, [fetchMfaStatus]);

    const handleEnableMFA = async () => {
        setLoading({ ...loading, mfa: true });
        setMessage(null);
        try {
            const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
            if (error) throw error;
            setEnrollData({
                qr_code: data.totp.qr_code,
                secret: data.totp.secret,
                factorId: data.id
            });
            setIsEnrolling(true);
        } catch (error) {
             if (error instanceof Error) {
                setMessage({ type: 'error', text: `Failed to start MFA enrollment: ${error.message}` });
            } else {
                 setMessage({ type: 'error', text: 'An unknown error occurred.' });
            }
        } finally {
            setLoading({ ...loading, mfa: false });
        }
    };

    const handleVerifyMFA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!enrollData) return;
        setLoading({ ...loading, mfaVerify: true });
        setMessage(null);
        try {
            const { error } = await supabase.auth.mfa.challengeAndVerify({
                factorId: enrollData.factorId,
                code: verificationCode
            });
            if (error) throw error;
            setMessage({ type: 'success', text: '2FA has been successfully enabled!' });
            setIsEnrolling(false);
            setEnrollData(null);
            setVerificationCode('');
            await fetchMfaStatus(); // Refresh status
        } catch (error) {
             if (error instanceof AuthError) {
                setMessage({ type: 'error', text: `Verification failed: ${error.message}` });
            } else {
                 setMessage({ type: 'error', text: 'An unknown error occurred during verification.' });
            }
        } finally {
             setLoading({ ...loading, mfaVerify: false });
        }
    };

    const handleDisableMFA = async (factorId: string) => {
        if (!window.confirm("Are you sure you want to disable Two-Factor Authentication?")) return;
        setLoading({ ...loading, mfaDisable: true });
        setMessage(null);
        try {
            const { error } = await supabase.auth.mfa.unenroll({ factorId });
            if (error) throw error;
            setMessage({ type: 'success', text: '2FA has been disabled.' });
            await fetchMfaStatus(); // Refresh status
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `Failed to disable 2FA: ${error.message}` });
            } else {
                 setMessage({ type: 'error', text: 'An unknown error occurred.' });
            }
        } finally {
            setLoading({ ...loading, mfaDisable: false });
        }
    };

    // Sessions state and handlers
    const handleSignOutAll = async () => {
        if (!window.confirm("Are you sure you want to sign out of all other devices?")) return;
        setLoading({ ...loading, sessions: true });
        setMessage(null);
        try {
            const { error } = await supabase.auth.signOut({ scope: 'others' });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Successfully signed out of all other devices.' });
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `Failed to sign out: ${error.message}` });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred.' });
            }
        } finally {
            setLoading({ ...loading, sessions: false });
        }
    };
    
    // Delete Account state and handlers
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading({ ...loading, delete: true });
        setMessage(null);
        try {
            // 1. Re-authenticate
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: session.user.email!,
                password: deletePassword,
            });
            if (signInError) throw new Error("Password is incorrect.");

            // 2. Call the Edge Function
            const { error: functionError } = await supabase.functions.invoke('delete-user');
            if (functionError) throw functionError;

            // 3. Log out on client and redirect
            await supabase.auth.signOut();
            setView('home');

        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `Account deletion failed: ${error.message}` });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred.' });
            }
        } finally {
            setLoading({ ...loading, delete: false });
        }
    };
    
    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="p-6 bg-white border rounded-lg shadow-md text-charcoal">
            <h4 className="text-xl font-serif font-bold text-deep-blue mb-4 pb-2 border-b">{title}</h4>
            {children}
        </div>
    );
    
    return (
        <div>
            <h3 className="text-2xl font-serif font-bold text-deep-blue mb-4">Security Settings</h3>
            <div className="space-y-8">
                <Message message={message} onDismiss={() => setMessage(null)} />
                {/* Change Password */}
                <Section title="Change Password">
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                        <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className={inputStyles} />
                        <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className={inputStyles} />
                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputStyles} />
                        <button type="submit" disabled={loading.password} className={buttonStyles}>{loading.password ? 'Updating...' : 'Update Password'}</button>
                    </form>
                </Section>

                {/* Two-Factor Authentication */}
                <Section title="Two-Factor Authentication (2FA)">
                    {mfaFactors.length > 0 ? (
                         <div>
                            <p className="text-emerald font-semibold mb-4">✅ 2FA is currently enabled on your account.</p>
                            <button onClick={() => handleDisableMFA(mfaFactors[0].id)} disabled={loading.mfaDisable} className="bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50">
                                {loading.mfaDisable ? 'Disabling...' : 'Disable 2FA'}
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-4">Enhance your account security by enabling two-factor authentication.</p>
                             <button onClick={handleEnableMFA} disabled={loading.mfa} className={buttonStyles}>
                                {loading.mfa ? 'Generating...' : 'Enable 2FA'}
                             </button>
                        </div>
                    )}
                    {isEnrolling && enrollData && (
                        <div className="mt-6 border-t pt-6">
                            <h5 className="font-bold text-lg mb-2">Complete 2FA Setup</h5>
                            <p className="mb-4">1. Scan the QR code with your authenticator app (like Google Authenticator or Authy).</p>
                            <img src={enrollData.qr_code} alt="2FA QR Code" className="mx-auto border-4 p-1 rounded-md mb-4" />
                            <p className="mb-4">2. If you can't scan, manually enter this secret key:</p>
                            <p className="font-mono bg-gray-100 p-2 rounded-md mb-4 break-all">{enrollData.secret}</p>
                            <form onSubmit={handleVerifyMFA}>
                                <label className="block font-medium mb-1">3. Enter the 6-digit code from your app:</label>
                                <input type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} required maxLength={6} className={`${inputStyles} max-w-xs`} />
                                <div className="mt-4 flex gap-4">
                                    <button type="submit" disabled={loading.mfaVerify} className="bg-emerald text-white font-bold py-2 px-6 rounded-full hover:bg-emerald/90 disabled:opacity-50">
                                        {loading.mfaVerify ? 'Verifying...' : 'Verify & Enable'}
                                    </button>
                                     <button type="button" onClick={() => setIsEnrolling(false)} className="bg-gray-200 text-charcoal font-bold py-2 px-6 rounded-full hover:bg-gray-300">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </Section>
                
                {/* Active Sessions */}
                <Section title="Manage Active Sessions">
                    <p className="mb-4">For your security, you can sign out of all other sessions on other computers and devices.</p>
                    <button onClick={handleSignOutAll} disabled={loading.sessions} className={buttonStyles}>
                        {loading.sessions ? 'Signing Out...' : 'Log out of all other devices'}
                    </button>
                </Section>

                {/* Danger Zone */}
                <div className="p-6 bg-white border border-red-500 rounded-lg shadow-md text-charcoal">
                    <h4 className="text-xl font-serif font-bold text-red-600 mb-2">Danger Zone</h4>
                    <p className="mb-4">Deleting your account is permanent and cannot be undone. All your data, including wishes, documents, and letters, will be permanently removed.</p>
                    <button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition-colors">
                        Delete My Account
                    </button>
                </div>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 relative animate-fadeUp">
                            <h4 className="text-xl font-serif font-bold text-red-600 mb-2">Are you absolutely sure?</h4>
                            <p className="mb-4">This action is irreversible. To confirm, please enter your password.</p>
                            <form onSubmit={handleDeleteAccount}>
                                <Message message={message} onDismiss={() => setMessage(null)} />
                                <input type="password" placeholder="Enter your password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} required className={inputStyles} />
                                <div className="flex gap-4 mt-6">
                                    <button type="submit" disabled={loading.delete} className="flex-1 bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 disabled:opacity-50">
                                        {loading.delete ? 'Deleting...' : 'Delete My Account'}
                                    </button>
                                    <button type="button" onClick={() => { setIsDeleteModalOpen(false); setMessage(null); }} className="flex-1 bg-gray-200 text-charcoal font-bold py-2 px-6 rounded-full hover:bg-gray-300">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Main Dashboard Component ---

interface DashboardProps {
    session: Session;
    setView: (view: View) => void;
    userRole: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ session, setView, userRole }) => {
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    const baseTabs: { id: Tab, label: string }[] = [
        { id: 'profile', label: 'Patron Profile' },
        { id: 'wishes', label: 'My Wishes' },
        { id: 'nominees', label: 'Nominees / Executors' },
        { id: 'documents', label: 'Documents Vault' },
        { id: 'letters', label: 'Letters & Messages' },
        { id: 'cascade', label: 'Cascade of Wishes' },
        { id: 'delivery', label: 'Delivery Settings' },
        { id: 'subscription', label: 'Subscription / Plans' },
        { id: 'support', label: 'Support & Help' },
        { id: 'security', label: 'Security Settings' },
    ];

    if (userRole === 'admin') {
        baseTabs.splice(1, 0, { id: 'admin', label: 'Admin Panel' });
    }

    const renderContent = () => {
        if (!SUPABASE_CONFIGURED) {
             return (
                <div className="text-red-500 bg-red-100 p-4 rounded-md">
                   <p className="font-bold">Data Features Not Configured</p>
                   <p>Please add Supabase credentials in lib/supabase.ts to enable dashboard functionality.</p>
                </div>
            );
        }
        
        switch (activeTab) {
            case 'profile': return <PatronProfileTab session={session} />;
            case 'wishes': return <MyWishesTab session={session} />;
            case 'nominees': return <NomineesTab session={session} />;
            case 'documents': return <DocumentsVaultTab session={session} />;
            case 'letters': return <LettersMessagesTab session={session} />;
            case 'cascade': return <Cascade />;
            case 'admin': return userRole === 'admin' ? <AdminPanel /> : <p>Access Denied</p>;
            case 'delivery': return <DeliverySettingsTab session={session} />;
            case 'subscription': return <SubscriptionPlansTab session={session} />;
            case 'support': return <SupportHelpTab session={session} setView={setView} />;
            case 'security': return <SecuritySettingsTab session={session} setView={setView} />;
            default: return <PatronProfileTab session={session} />;
        }
    };

    return (
        <section className="min-h-screen bg-light-grey pt-40 pb-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-bold text-deep-blue">
                        Welcome, {session.user.user_metadata.name || session.user.email}
                    </h1>
                    <p className="mt-2 text-lg text-charcoal">Manage your digital legacy with privacy and care.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Tabs Navigation */}
                    <aside className="lg:w-1/4">
                        <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-0 bg-white lg:bg-transparent p-2 lg:p-0 rounded-lg shadow-md lg:shadow-none">
                            {baseTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        w-full text-left font-semibold p-4 rounded-lg transition-colors duration-200
                                        ${activeTab === tab.id ? 'bg-deep-blue text-white shadow-md' : 'hover:bg-golden/20 text-deep-blue'}
                                        ${tab.id === 'admin' ? 'bg-rose-gold text-deep-blue' : ''}
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Tab Content */}
                    <main className="flex-1">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </section>
    );
};

const PlaceholderContent: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-2xl font-serif font-bold text-deep-blue mb-4">{title}</h3>
        <div className="p-6 bg-white border rounded-lg shadow-md text-charcoal">
            {children}
        </div>
    </div>
);


export default Dashboard;