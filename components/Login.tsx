import React, { useState, useEffect } from 'react';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';
import { View } from '../App';

interface LoginProps {
    setView: (view: View) => void;
}

const Login: React.FC<LoginProps> = ({ setView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | 'info' } | null>(null);

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!SUPABASE_CONFIGURED) {
            setMessage({ text: "Authentication is not configured. Please add Supabase credentials in lib/supabase.ts.", type: 'error'});
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            
            if (rememberMe) {
                localStorage.setItem('savedEmail', email);
            } else {
                localStorage.removeItem('savedEmail');
            }
            // The onAuthStateChange listener in App.tsx will handle the view change
        } catch (error: any) {
            let errorMessage = error.error_description || error.message;
            if (errorMessage === 'Invalid login credentials') {
                errorMessage = 'Invalid email or password. If you recently signed up, please check your email to confirm your account before logging in.';
            }
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };
    
    const handlePasswordReset = async () => {
        if (!email) {
            setMessage({ text: 'Please enter your email address above, then click "Forgot Password?" again.', type: 'info' });
            return;
        }
        setMessage(null);
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin, // Redirects back to the app's main page
            });
            if (error) throw error;
            setMessage({ text: 'If an account exists for this email, a password reset link has been sent.', type: 'success' });
        } catch (error: any) {
            setMessage({ text: error.error_description || error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep-blue to-emerald p-4">
            <div className="w-full max-w-md">
                 <div className="text-center mb-8">
                     <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); }} className="inline-block">
                         <img src="https://i.postimg.cc/cHRcgdk6/Whats-App-Image-2025-11-15-at-2-24-19-PM-removebg-preview.png" alt="Logo" className="h-40 mx-auto" />
                     </a>
                    <h1 className="text-3xl font-serif font-bold text-white mt-4">Welcome Back</h1>
                    <p className="text-white/80">Log in to continue your legacy.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
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
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-white/80 block">Password</label>
                                <span onClick={handlePasswordReset} className="text-sm text-white/80 hover:text-golden hover:underline cursor-pointer">
                                    Forgot Password?
                                </span>
                            </div>
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
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300/50 bg-white/20 text-golden focus:ring-golden"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-white/80">
                                Remember me
                            </label>
                        </div>
                         {message && (
                            <p className={`text-sm text-center p-3 rounded-md ${
                                message.type === 'error' ? 'text-red-300 bg-red-500/20' : 
                                message.type === 'success' ? 'text-green-300 bg-green-500/20' : 
                                'text-blue-300 bg-blue-500/20'
                            }`}>{message.text}</p>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-golden text-deep-blue font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? 'Logging In...' : 'Login'}
                        </button>
                    </form>
                    <p className="text-center text-white/80 mt-6">
                        Don't have an account?{' '}
                        <span
                            onClick={() => setView('signup')}
                            className="font-bold text-golden hover:underline cursor-pointer"
                        >
                            Sign Up
                        </span>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Login;
