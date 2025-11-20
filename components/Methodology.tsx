
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';
import { View } from '../App';

interface MethodologyProps {
    session: Session | null;
    setView: (view: View) => void;
}

const Methodology: React.FC<MethodologyProps> = ({ session, setView }) => {
    const [formState, setFormState] = useState({
        fullName: '',
        dob: '',
        sex: '',
        religion: '',
        occupation: '',
        address: '',
        contact: '',
        email: '',
        relatives: '',
        serviceGrades: '',
        memorableDeeds: '',
    });
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchPatronData = async () => {
            if (session) {
                const { data, error } = await supabase
                    .from('patrons')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (data) {
                    setFormState({
                        fullName: data.full_name || session.user.user_metadata.name || '',
                        email: data.email || session.user.email || '',
                        dob: data.dob || '',
                        sex: data.sex || '',
                        religion: data.religion || '',
                        occupation: data.occupation || '',
                        address: data.address || '',
                        contact: data.contact_number || '',
                        relatives: data.relatives_contact || '',
                        serviceGrades: data.service_grade || '',
                        memorableDeeds: data.memorable_deeds || '',
                    });
                } else if (!error || error.code === 'PGRST116') {
                    // No existing patron data, pre-fill from session
                    setFormState(prevState => ({
                        ...prevState,
                        fullName: session.user.user_metadata.name || '',
                        email: session.user.email || '',
                        dob: '',
                        sex: '',
                        religion: '',
                        occupation: '',
                        address: '',
                        contact: '',
                        relatives: '',
                        serviceGrades: '',
                        memorableDeeds: '',
                    }));
                } else {
                    console.error("Error fetching patron data:", error.message);
                }
            }
        };

        fetchPatronData();
    }, [session]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.target.files);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formState.fullName) newErrors.fullName = "Full Name is required.";
        if (!formState.dob) newErrors.dob = "Date of Birth is required.";
        if (!formState.contact) newErrors.contact = "Contact number is required.";
        else if (!/^\d{10,15}$/.test(formState.contact)) newErrors.contact = "Contact number is invalid.";
        if (!formState.email) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(formState.email)) newErrors.email = "Email format is invalid.";
        if (!formState.serviceGrades) newErrors.serviceGrades = "Please select a Service Grade.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handles file uploads to a temporary location for a logged-out user.
     * @returns A promise that resolves to an array of public URLs for the uploaded files.
     */
    const handleTempFileUpload = async (): Promise<string[]> => {
        if (!selectedFiles || selectedFiles.length === 0) {
            return [];
        }

        const tempId = crypto.randomUUID();
        const uploadPromises = Array.from(selectedFiles).map(async (file: File) => {
            const filePath = `temp/${tempId}/${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('memories')
                .upload(filePath, file);

            if (uploadError) {
                throw new Error(`File upload failed: ${uploadError.message}`);
            }

            const { data } = supabase.storage.from('memories').getPublicUrl(filePath);
            return data.publicUrl;
        });

        return Promise.all(uploadPromises);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setLoading(true);
        setErrors({});

        // --- Logic for Logged-Out Users ---
        if (!session) {
            try {
                // 1. Upload files to a temporary location
                const memoryUrls = await handleTempFileUpload();

                // 2. Prepare form data to be saved temporarily
                const tempData = { ...formState, top_memories_url: memoryUrls };

                // 3. Save to temp_patrons table
                const { error: tempSaveError } = await supabase.from('temp_patrons').upsert(
                    { email: formState.email, form_data: tempData },
                    { onConflict: 'email' }
                );
                if (tempSaveError) throw tempSaveError;

                // 4. Prepare for signup by saving info to pass to the signup page
                localStorage.setItem('savedEmail', formState.email);
                localStorage.setItem('savedName', formState.fullName);
                setView('signup');

            } catch (error) {
                // Fix: Safely handle unknown error type from API calls.
                if (error instanceof Error) {
                    setErrors({ form: `Submission failed: ${error.message}` });
                } else {
                    setErrors({ form: 'An unknown submission error occurred.' });
                }
            } finally {
                setLoading(false);
            }
            return;
        }
        
        // --- Logic for Logged-In Users ---
        // This will update their main profile in the 'patrons' table.
        try {
            // 1. Handle file uploads first
            const newMemoryUrls: string[] = [];
            if (selectedFiles && selectedFiles.length > 0) {
                const uploadPromises = Array.from(selectedFiles).map(async (file: File) => {
                    const filePath = `${session.user.id}/${Date.now()}-${file.name}`;
                    const { error: uploadError } = await supabase.storage
                        .from('memories')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;
                    
                    const { data } = supabase.storage.from('memories').getPublicUrl(filePath);
                    return data.publicUrl;
                });
                newMemoryUrls.push(...await Promise.all(uploadPromises));
            }
            
            // 2. Fetch existing patron data to merge URLs
            const { data: existingPatron, error: fetchError } = await supabase
                .from('patrons')
                .select('top_memories_url')
                .eq('id', session.user.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

            const existingUrls = existingPatron?.top_memories_url || [];
            const finalMemoryUrls = [...existingUrls, ...newMemoryUrls];

            // 3. Prepare the data for upserting into the 'patrons' table
            const patronData = {
                id: session.user.id,
                email: formState.email, // email is disabled, so it's the user's correct email
                full_name: formState.fullName,
                dob: formState.dob,
                sex: formState.sex,
                religion: formState.religion,
                occupation: formState.occupation,
                address: formState.address,
                contact_number: formState.contact,
                relatives_contact: formState.relatives,
                service_grade: formState.serviceGrades,
                memorable_deeds: formState.memorableDeeds,
                top_memories_url: finalMemoryUrls,
                updated_at: new Date(),
            };

            // 4. Upsert the data
            const { error } = await supabase.from('patrons').upsert(patronData);
            if (error) throw error;

            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 5000);

        } catch (error) {
            // Fix: Safely handle unknown error type from API calls.
            if (error instanceof Error) {
                setErrors({ form: `Submission failed: ${error.message}` });
            } else {
                setErrors({ form: 'An unknown submission error occurred.' });
            }
        } finally {
            setLoading(false);
        }
    };
    
    const inputStyles = "w-full p-3 border border-gray-300 rounded-md bg-white text-charcoal placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-golden disabled:bg-gray-200 disabled:cursor-not-allowed";

    return (
        <section id="methodology" className="py-20 bg-light-grey">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold text-deep-blue">Pledge Your Wish</h2>
                    <p className="mt-2 text-lg text-charcoal">Follow these simple steps to ensure your legacy lives on.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Steps */}
                    <div className="space-y-8 fade-in-section">
                        {/* Step items unchanged */}
                        <div className="flex items-start">
                            <div className="flex-shrink-0 bg-golden text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl">1</div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-deep-blue">Fill the Patron Form</h3>
                                <p>Provide your details to begin the process of pledging your last wishes.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 bg-marigold text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl">2</div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-deep-blue">Choose Your Service Grade</h3>
                                <p>Select from our range of services to specify how you'd like your legacy to unfold.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 bg-emerald text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl">3</div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-deep-blue">Sign the MOU</h3>
                                <p>A Memorandum of Understanding ensures your wishes are formally documented and legally sound.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 bg-deep-blue text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl">4</div>
                            <div className="ml-4">
                                <h3 className="text-xl font-bold text-deep-blue">Our Team Executes Your Wishes</h3>
                                <p>Rest assured, our dedicated team will carry out your pledged wishes with utmost care and respect.</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white p-8 rounded-lg shadow-lg fade-in-section" style={{ transitionDelay: '200ms' }}>
                        {submitted ? (
                            <div className="text-center p-8 bg-emerald/10 rounded-lg">
                                <h3 className="text-2xl font-bold text-emerald">Thank you! ❤️</h3>
                                <p className="mt-2 text-charcoal">Your pledge has been successfully saved to your profile.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <input type="text" name="fullName" placeholder="Full Name" value={formState.fullName} onChange={handleChange} className={inputStyles} disabled={!!session} />
                                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                                    </div>
                                    <div>
                                        <input type="date" name="dob" value={formState.dob} onChange={handleChange} className={inputStyles} />
                                        {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                                    </div>
                                    <input type="text" name="sex" placeholder="Sex" value={formState.sex} onChange={handleChange} className={inputStyles} />
                                    <input type="text" name="religion" placeholder="Religion" value={formState.religion} onChange={handleChange} className={inputStyles} />
                                    <input type="text" name="occupation" placeholder="Occupation" value={formState.occupation} onChange={handleChange} className={inputStyles} />
                                     <div>
                                        <input type="tel" name="contact" placeholder="Contact Number" value={formState.contact} onChange={handleChange} className={inputStyles} />
                                        {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
                                    </div>
                                </div>
                                <input type="email" name="email" placeholder="Email Address" value={formState.email} onChange={handleChange} className={inputStyles} disabled={!!session}/>
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                <textarea name="address" placeholder="Residential & Permanent Address" rows={3} value={formState.address} onChange={handleChange} className={inputStyles}></textarea>
                                <textarea name="relatives" placeholder="Relatives' Contact Info" rows={3} value={formState.relatives} onChange={handleChange} className={inputStyles}></textarea>
                                <div>
                                    <select name="serviceGrades" value={formState.serviceGrades} onChange={handleChange} className={inputStyles}>
                                        <option value="">Select Service Grade</option>
                                        <option value="1">Grade 1 - Personal & Family Care</option>
                                        <option value="2">Grade 2 - Small Social Contributions</option>
                                        <option value="3">Grade 3 - Social Infrastructure</option>
                                        <option value="4">Grade 4 - Community Activities</option>
                                        <option value="5">Grade 5 - Spiritual & Cultural Legacy</option>
                                        <option value="6">Grade 6 - Collective Causes</option>
                                    </select>
                                    {errors.serviceGrades && <p className="text-red-500 text-sm mt-1">{errors.serviceGrades}</p>}
                                </div>
                                <textarea name="memorableDeeds" placeholder="Your Most Memorable Deeds" rows={3} value={formState.memorableDeeds} onChange={handleChange} className={inputStyles}></textarea>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-1">Upload Top 10 Memories (Optional)</label>
                                    <input type="file" multiple onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-golden/20 file:text-golden hover:file:bg-golden/30"/>
                                </div>
                                
                                {session ? (
                                    <button type="submit" disabled={loading || !SUPABASE_CONFIGURED} className="w-full bg-golden text-deep-blue font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 hover:shadow-lg animate-glow disabled:opacity-50 disabled:cursor-not-allowed">
                                        {loading ? 'Saving...' : 'Save My Pledge'}
                                    </button>
                                ) : (
                                    <div className="text-center border-t pt-4">
                                        <p className="text-charcoal mb-3">Please sign up or log in to save your pledge.</p>
                                        <button type="submit" disabled={loading} className="w-full bg-emerald text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 hover:shadow-lg disabled:opacity-50">
                                            {loading ? 'Processing...' : 'Sign Up to Pledge'}
                                        </button>
                                    </div>
                                )}
                                {errors.form && <p className="text-red-500 text-sm mt-2 text-center">{errors.form}</p>}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Methodology;
