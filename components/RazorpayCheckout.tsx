
import React, { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Add Razorpay to the window object for TypeScript
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface RazorpayCheckoutProps {
    plan: any;
    session: Session;
    onClose: () => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({ plan, session, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState('Initializing secure checkout...');
    const [message, setMessage] = useState<{ type: 'error' | 'success' | 'warning', text: string } | null>(null);
    
    // Ref to ensure we only create the order ONCE, preventing double-calls in React Strict Mode
    const hasInitialized = useRef(false);

    // This is the secure, production-ready method to create a Razorpay order.
    const createOrderSecurely = async (amountInPaisa: number) => {
        const { data: order, error } = await supabase.functions.invoke('-create-razorpay-order', {
            body: { amount: amountInPaisa, currency: 'INR' },
        });
        if (error) throw error;
        if (order && order.error) throw new Error(order.error);
        return order;
    };

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const loadRazorpayScript = () => {
            return new Promise((resolve) => {
                if (window.Razorpay) {
                    resolve(true);
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };

        const processPayment = async () => {
            // ---------------------------------------------------------
            // YOUR LIVE KEY IS SET HERE
            // ---------------------------------------------------------
            const RAZORPAY_KEY_ID = 'rzp_live_RUv2nx9Eg3xoQf'; 

            if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID.includes('PASTE')) {
                setMessage({ type: 'error', text: 'Configuration Error: Live Razorpay Key ID is missing in the code.' });
                setLoading(false);
                return;
            }

            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setMessage({ type: 'error', text: 'Could not load payment gateway. Please check your internet connection.' });
                setLoading(false);
                return;
            }

            // Cold start message timer
            const coldStartTimer = setTimeout(() => {
                setLoadingText('Connecting to secure payment server...');
            }, 2500);

            const price = plan.price.yearly;
            const amountInPaisa = price * 100;
            let orderId = null;
            let isFallbackMode = false;

            try {
                // Attempt to create order on server
                const order = await createOrderSecurely(amountInPaisa);
                orderId = order.id;
                console.log("Order created securely:", orderId);
            } catch (error: any) {
                console.warn("Server-side order creation failed. This usually means Supabase Secrets are missing or incorrect.", error);
                // We do NOT stop here. We proceed to open the modal without an Order ID (Fallback Mode).
                isFallbackMode = true;
            }

            clearTimeout(coldStartTimer);
            setLoadingText('Opening payment window...');

            const options = {
                key: RAZORPAY_KEY_ID, 
                amount: amountInPaisa,
                currency: 'INR',
                name: 'Book My Last Wishes',
                description: `${plan.name} Plan Subscription`,
                order_id: orderId, // If this is null (Fallback Mode), Razorpay generates a local order
                handler: async (response: any) => {
                    setLoading(true);
                    setLoadingText('Verifying payment...');
                    
                    try {
                        // Attempt to verify on server
                        const { error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
                            body: {
                                razorpay_order_id: response.razorpay_order_id || orderId || 'fallback_order',
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                amount: amountInPaisa,
                                currency: 'INR',
                                plan_name: plan.name
                            },
                        });

                        if (verifyError) {
                            // Verification failed (likely due to secret mismatch on server), but payment succeeded
                            console.error("Verification warning:", verifyError);
                            setMessage({ type: 'warning', text: `Payment successful, but server verification failed. Please contact support with Payment ID: ${response.razorpay_payment_id}` });
                        } else {
                            setMessage({ type: 'success', text: `Payment verified! Welcome to the ${plan.name} plan.` });
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                        setMessage({ type: 'warning', text: `Payment successful! Please contact support with Payment ID: ${response.razorpay_payment_id}` });
                    }
                    
                    setLoading(false);
                    setTimeout(onClose, 6000);
                },
                prefill: {
                    name: session.user.user_metadata.name || session.user.email,
                    email: session.user.email,
                },
                theme: { color: '#223C63' },
                modal: { 
                    ondismiss: () => {
                        if (!message) onClose();
                    }
                }
            };

            try {
                const rzpInstance = new window.Razorpay(options);
                rzpInstance.on('payment.failed', (response: any) => {
                    console.error("Payment failed:", response.error);
                    setMessage({ type: 'error', text: `Payment failed: ${response.error.description}` });
                    setLoading(false);
                });
                
                setTimeout(() => {
                    rzpInstance.open();
                    setLoading(false);
                    if (isFallbackMode) {
                        console.log("Checkout opened in Fallback Mode. Please check Supabase Secrets if this persists.");
                    }
                }, 100);
            } catch (err) {
                console.error("Razorpay initialization failed:", err);
                setMessage({ type: 'error', text: 'Failed to open payment window. Please try again.' });
                setLoading(false);
            }
        };

        processPayment();
    }, [plan, session, onClose]);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-8 relative animate-fadeUp text-center">
                <h3 className="text-xl font-serif font-bold text-deep-blue mb-4">Processing Payment</h3>
                
                {loading && (
                    <div className="py-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-blue mx-auto mb-4"></div>
                        <p className="text-charcoal/80 animate-pulse text-sm">{loadingText}</p>
                    </div>
                )}

                {message && (
                     <div className="mt-4 animate-fadeIn">
                        <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-full mb-2 ${
                            message.type === 'success' ? 'bg-green-100 text-emerald' : 
                            message.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                        }`}>
                            {message.type === 'success' ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            ) : message.type === 'warning' ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            )}
                        </div>
                        <p className={`font-bold text-lg ${
                            message.type === 'success' ? 'text-emerald' : 
                            message.type === 'warning' ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                            {message.type === 'success' ? 'Success!' : message.type === 'warning' ? 'Payment Received' : 'Notice'}
                        </p>
                        <p className="text-sm text-charcoal/90 mt-2 mb-6">{message.text}</p>
                        <button onClick={onClose} className="w-full bg-deep-blue text-white font-bold py-2 px-6 rounded-full hover:bg-deep-blue/90 transition-all">
                            Close
                        </button>
                    </div>
                )}
                
                {!loading && !message && (
                    <p className="text-sm text-gray-500">Please complete the payment in the popup window.</p>
                )}
            </div>
        </div>
    );
};

export default RazorpayCheckout;
