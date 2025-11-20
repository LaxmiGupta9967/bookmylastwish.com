
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Session, User } from 'https://esm.sh/@supabase/supabase-js';
import { supabase, SUPABASE_CONFIGURED } from './lib/supabase';

// Static imports for critical "Above the Fold" content
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';

// Lazy Load "Below the Fold" components to speed up initial load
const LiveUpdates = lazy(() => import('./components/LiveUpdates'));
const VisionMission = lazy(() => import('./components/VisionMission'));
const EmotionalMessage = lazy(() => import('./components/EmotionalMessage'));
const AboutUs = lazy(() => import('./components/AboutUs'));
const Services = lazy(() => import('./components/Services'));
const Methodology = lazy(() => import('./components/Methodology'));
const Timeline = lazy(() => import('./components/Timeline'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const Cascade = lazy(() => import('./components/Cascade'));
const Gallery = lazy(() => import('./components/Gallery'));
const Impact = lazy(() => import('./components/Impact'));
const FAQ = lazy(() => import('./components/FAQ'));
const Newsletter = lazy(() => import('./components/Newsletter'));
const Contact = lazy(() => import('./components/Contact'));

const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));

export type View = 'home' | 'login' | 'signup' | 'dashboard' | 'reset_password';

/**
 * Handles the migration of patron data after a user signs in.
 * It checks for temporary data associated with the user's email, moves uploaded
 * files from a temporary path to a permanent user-specific path in Storage,
 * saves the form data to the permanent 'patrons' table, and cleans up the temporary record.
 * @param user The newly signed-in Supabase user object.
 */
const handlePostSignupDataMigration = async (user: User) => {
    if (!user.email) return;

    // 1. Check for temporary data using the user's email
    const { data: tempData, error: tempError } = await supabase
        .from('temp_patrons')
        .select('*')
        .eq('email', user.email)
        .single();

    if (tempError || !tempData) {
        if (tempError && tempError.code !== 'PGRST116') { // PGRST116 = 'single row not found'
             console.error('Error fetching temp patron data:', tempError.message);
        }
        return; // No temporary data found, so nothing to do.
    }

    try {
        const formData = tempData.form_data;
        let finalMemoryUrls: string[] = [];

        // 2. Move any uploaded files from temp storage to permanent user storage
        if (formData.top_memories_url && formData.top_memories_url.length > 0) {
            const tempUrls: string[] = formData.top_memories_url;
            const movePromises = tempUrls.map(async (tempUrl: string) => {
                const urlParts = tempUrl.split('/');
                const tempPath = `temp/${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;
                const newPath = `${user.id}/${urlParts[urlParts.length - 1]}`;
                
                // Move the file
                const { error: moveError } = await supabase.storage
                    .from('memories')
                    .move(tempPath, newPath);
                
                if (moveError) {
                    console.error(`Failed to move file ${tempPath}:`, moveError.message);
                    return null; // Return null if move fails
                }
                
                // Get the new public URL
                const { data: publicUrlData } = supabase.storage
                    .from('memories')
                    .getPublicUrl(newPath);

                return publicUrlData.publicUrl;
            });

            const movedUrls = await Promise.all(movePromises);
            finalMemoryUrls = movedUrls.filter((url): url is string => url !== null);
        }

        // 3. Insert the data into the permanent 'patrons' table
        const patronData = {
            id: user.id,
            email: user.email,
            full_name: formData.fullName,
            dob: formData.dob,
            sex: formData.sex,
            religion: formData.religion,
            occupation: formData.occupation,
            address: formData.address,
            contact_number: formData.contact,
            relatives_contact: formData.relatives,
            service_grade: formData.serviceGrades,
            memorable_deeds: formData.memorableDeeds,
            top_memories_url: finalMemoryUrls,
            updated_at: new Date(),
        };

        const { error: insertError } = await supabase.from('patrons').upsert(patronData);
        if (insertError) throw insertError;

        // 4. Delete the temporary record
        const { error: deleteError } = await supabase
            .from('temp_patrons')
            .delete()
            .eq('id', tempData.id);
        if (deleteError) throw deleteError;

        console.log("Successfully migrated temporary patron data.");

    } catch (error: any) {
        console.error('Data migration failed:', error.message);
    }
};

const LoadingSpinner: React.FC = () => (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-deep-blue text-white overflow-hidden">
        <div className="relative w-40 h-40 mb-6">
            <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M50 95V25M50 45c-15 0-15-20-30-20M50 45c15 0 15-20 30-20M50 65c-10 0-10-15-25-15M50 65c10 0 10-15 25-15"
                    stroke="#F4A300"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-draw"
                    style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                />
            </svg>
            {/* Floating leaves with delayed fade-in */}
            <span className="absolute top-[35%] left-[30%] text-xl text-emerald animate-float opacity-0 animate-[fadeIn_2s_ease-in-out_1.5s_forwards]">🍃</span>
            <span className="absolute top-[45%] right-[25%] text-xl text-emerald animate-float opacity-0 animate-[fadeIn_2s_ease-in-out_2s_forwards]" style={{animationDelay: '1.5s'}}>🌿</span>
            <span className="absolute top-[60%] left-[40%] text-xl text-emerald animate-float opacity-0 animate-[fadeIn_2s_ease-in-out_2.5s_forwards]" style={{animationDelay: '2s'}}>🍃</span>
        </div>
        <p className="text-2xl font-serif animate-glow">Loading Your Legacy...</p>
    </div>
);

const SectionFallback: React.FC = () => (
    <div className="py-20 bg-light-grey flex justify-center">
        <div className="animate-pulse flex space-x-4">
            <div className="h-3 w-3 bg-golden rounded-full"></div>
            <div className="h-3 w-3 bg-golden rounded-full"></div>
            <div className="h-3 w-3 bg-golden rounded-full"></div>
        </div>
    </div>
);


const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [view, setView] = useState<View>('home');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSessionAndRole = async () => {
            if (!SUPABASE_CONFIGURED) {
                setSession(null);
                setUserRole(null);
                setLoading(false);
                return;
            }
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                setSession(session);
                if (session) {
                    const { data: roleData } = await supabase
                        .from('user_roles')
                        .select('role')
                        .eq('user_id', session.user.id)
                        .single();
                    setUserRole(roleData?.role || null);
                    setView('dashboard');
                }
            } catch (error) {
                console.error("Error fetching session. This is likely due to placeholder Supabase credentials in lib/supabase.ts. The app will continue with public-only functionality.", error);
                setSession(null);
                setUserRole(null);
            } finally {
                setLoading(false);
            }
        };

        getSessionAndRole();

        if (SUPABASE_CONFIGURED) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                setSession(session);
                if (session) {
                    const { data: roleData } = await supabase
                        .from('user_roles')
                        .select('role')
                        .eq('user_id', session.user.id)
                        .single();
                    setUserRole(roleData?.role || null);
                } else {
                    setUserRole(null);
                }

                if (_event === 'PASSWORD_RECOVERY') {
                    setView('reset_password');
                } else if (_event === 'SIGNED_IN' && session) {
                    const migrationFlag = `migration_done_${session.user.id}`;
                    if (!sessionStorage.getItem(migrationFlag)) {
                        await handlePostSignupDataMigration(session.user);
                        sessionStorage.setItem(migrationFlag, 'true');
                    }
                } else if (_event === 'SIGNED_OUT') {
                    Object.keys(sessionStorage).forEach(key => {
                        if (key.startsWith('migration_done_')) {
                            sessionStorage.removeItem(key);
                        }
                    });
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, []);
    
    useEffect(() => {
        // This effect handles view transitions based on session state changes.
        if (session && (view === 'login' || view === 'signup' || view === 'reset_password')) {
            setView('dashboard');
        }
        if (!session && view === 'dashboard') {
            setView('home'); // On logout from dashboard, go to home page.
        }
    }, [session, view]);
    
    if (loading) {
        return <LoadingSpinner />;
    }

    const renderCurrentView = () => {
        switch(view) {
            case 'login':
                return <Login setView={setView} />;
            case 'signup':
                return <Signup setView={setView} />;
            case 'reset_password':
                return <ResetPassword setView={setView} />;
            case 'dashboard':
                if (!SUPABASE_CONFIGURED || !session) {
                    // Redirect to login if not configured or not logged in
                    return <Login setView={setView} />;
                }
                return (
                    <div className="relative">
                        <Header setView={setView} session={session} view={view} />
                        <main>
                            <Dashboard session={session} setView={setView} userRole={userRole} />
                        </main>
                        <Footer />
                    </div>
                );
            case 'home':
            default:
                 return (
                    <div className="relative">
                        <Header setView={setView} session={session} view={view} />
                        <main>
                            <Hero setView={setView} session={session} />
                            <Suspense fallback={<SectionFallback />}>
                                <LiveUpdates />
                                <VisionMission />
                                <EmotionalMessage />
                                <AboutUs />
                                <Services />
                                <Methodology session={session} setView={setView} />
                                <Timeline />
                                <Testimonials />
                                <Cascade />
                                <Gallery />
                                <Impact />
                                <FAQ />
                                <Newsletter />
                                <Contact />
                            </Suspense>
                        </main>
                        <Footer />
                    </div>
                );
        }
    };
    
    return (
        <Suspense fallback={<LoadingSpinner />}>
            {renderCurrentView()}
        </Suspense>
    );
};

export default App;
