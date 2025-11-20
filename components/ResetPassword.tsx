import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { View } from '../App';

interface ResetPasswordProps {
    setView: (view: View) => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ setView }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password !== confirmPassword) {
            setMessage({ text: 'Passwords do not match.', type: 'error' });
            return;
        }
        if (password.length < 6) {
             setMessage({ text: 'Password should be at least 6 characters.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            // The user is already authenticated at this point via the recovery link.
            // We just need to update their password.
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setMessage({ text: 'Your password has been updated successfully! Please log in with your new password.', type: 'success' });
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
                    <h1 className="text-3xl font-serif font-bold text-white mt-4">Reset Your Password</h1>
                    <p className="text-white/80">Enter a new password for your account.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
                    {message && message.type === 'success' ? (
                         <div className="text-center text-white p-4 bg-emerald/50 rounded-lg">
                            <h3 className="font-bold text-lg">Success!</h3>
                            <p>{message.text}</p>
                            <button
                                onClick={() => {
                                    // Sign out the recovery session before sending to login
                                    supabase.auth.signOut();
                                    setView('login');
                                }}
                                className="mt-4 w-full bg-golden text-deep-blue font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105"
                            >
                                Go to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-white/80 block mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300/50 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-golden"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white/80 block mb-2">Confirm New Password</label>
                                 <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300/50 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-golden"
                                    placeholder="••••••••"
                                />
                            </div>
                            {message && message.type === 'error' && <p className="text-red-300 text-sm text-center bg-red-500/20 p-3 rounded-md">{message.text}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-golden text-deep-blue font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:scale-100"
                            >
                                {loading ? 'Resetting...' : 'Set New Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ResetPassword;
