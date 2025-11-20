import React, { useState, useEffect } from 'react';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';

interface SignupProps {
    setView: (view: 'home' | 'login' | 'signup' | 'dashboard') => void;
}

const Signup: React.FC<SignupProps> = ({ setView }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    useEffect(() => {
        // Pre-fill email and name from local storage if it exists (from the public pledge form)
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
        }
        const savedName = localStorage.getItem('savedName');
        if (savedName) {
            setName(savedName);
        }
    }, []);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        
        if (!SUPABASE_CONFIGURED) {
            setError("Authentication is not configured. Please add Supabase credentials in lib/supabase.ts.");
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            });
            if (error) throw error;
            
            // Clear the saved details from localStorage after using them
            localStorage.removeItem('savedEmail');
            localStorage.removeItem('savedName');

            if (data.session) {
                // User is logged in automatically (if auto-confirm is on in Supabase).
                // The App.tsx listener will handle the redirect and data migration.
            } else {
                setSuccess("Signup successful! Please check your email to confirm your account.");
            }
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep-blue to-rose-gold p-4">
             <div className="w-full max-w-md">
                 <div className="text-center mb-8">
                     <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); }} className="inline-block">
                         <img src="https://i.postimg.cc/cHRcgdk6/Whats-App-Image-2025-11-15-at-2-24-19-PM-removebg-preview.png" alt="Logo" className="h-40 mx-auto" />
                     </a>
                    <h1 className="text-3xl font-serif font-bold text-white mt-4">Create Your Account</h1>
                    <p className="text-white/80">Begin your journey of leaving a lasting legacy.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
                    {success ? (
                         <div className="text-center text-white p-4 bg-emerald/50 rounded-lg">
                            <h3 className="font-bold text-lg">Success!</h3>
                            <p>{success}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-white/80 block mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300/50 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-golden"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white/80 block mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300/50 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-golden"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white/80 block mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full p-3 border border-gray-300/50 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-golden pr-10"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-white/70 hover:text-white"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .525-1.666 1.489-3.14 2.67-4.333m11.112 4.333A10.001 10.001 0 0012 5c-.378 0-.75.025-1.12.073M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            {error && <p className="text-red-300 text-sm text-center bg-red-500/20 p-3 rounded-md">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-golden text-deep-blue font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:scale-100"
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>
                    )}
                    <p className="text-center text-white/80 mt-6">
                        Already have an account?{' '}
                        <span
                            onClick={() => setView('login')}
                            className="font-bold text-golden hover:underline cursor-pointer"
                        >
                            Log In
                        </span>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Signup;