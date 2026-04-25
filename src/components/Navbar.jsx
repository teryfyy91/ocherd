import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import InstallPWA from './InstallPWA';

const Navbar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
    const { myShops, setShopInfo, signOut } = useStore();
    const userRole = localStorage.getItem('userRole');

    const handleSignOut = () => {
        signOut();
    };

    const handleShopSelect = (shop) => {
        setShopInfo(shop);
        setShowOwnerDropdown(false);
        navigate('/dashboard');
    };

    const handleNewSalon = () => {
        setShopInfo({
            name: '',
            services: [],
            workingHours: { start: '09:00', end: '18:00' }
        });
        setShowOwnerDropdown(false);
        navigate('/dashboard');
    };

    return (
        <>
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md pointer-events-auto">

                <div className="glass rounded-3xl p-3 flex justify-between items-center shadow-2xl">
                    <Link to="/" className="flex items-center gap-3 px-4">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                            <Scissors size={18} className="text-bg" />
                        </div>
                        <span className="text-xl font-black tracking-widest text-white">OCHERD</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {userRole !== 'owner' ? (
                            <Link to="/discovery" className="p-3 text-text-muted hover:text-primary transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </Link>
                        ) : (
                            <button onClick={() => navigate('/dashboard')} className="p-3 text-text-muted hover:text-primary transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </button>
                        )}
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="p-3 text-text-muted hover:text-red-400 transition-colors"
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Top Bar for Desktop/Mobile Status */}
            <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40 bg-gradient-to-b from-bg to-transparent pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain opacity-80" />
                </div>
                <div className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center overflow-hidden pointer-events-auto cursor-pointer">
                    <img src="/barber_1.png" alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>


            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    >
                        {/* Backdrop with heavy blur */}
                        <motion.div
                            initial={{ backdropFilter: "blur(0px)", backgroundColor: "rgba(15, 23, 42, 0)" }}
                            animate={{ backdropFilter: "blur(12px)", backgroundColor: "rgba(15, 23, 42, 0.4)" }}
                            exit={{ backdropFilter: "blur(0px)", backgroundColor: "rgba(15, 23, 42, 0)" }}
                            className="absolute inset-0"
                            onClick={() => setShowConfirm(false)}
                        />

                        {/* Modal Card */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            className="glass max-w-sm w-full p-10 rounded-[3.5rem] text-center relative z-10 border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-white/90"
                        >
                            <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-red-500 shadow-inner">
                                <LogOut size={40} />
                            </div>

                            <h2 className="text-3xl font-black text-dark mb-3 tracking-tight">
                                {t('confirmSignOut')}
                            </h2>
                            <p className="text-gray-500 font-bold mb-10 text-xs uppercase tracking-[0.2em] leading-relaxed opacity-60">
                                {t('areYouSure')}
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full bg-red-500 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-red-600 transition-all shadow-2xl shadow-red-500/20 active:scale-95"
                                >
                                    {t('yesSignOut')}
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="w-full bg-gray-100 text-gray-500 py-5 rounded-[1.5rem] font-black text-lg hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    {t('cancel')}
                                </button>
                            </div>

                            {/* Decorative elements to match Anti-gravity style */}
                            <div className="absolute top-10 right-10 w-2 h-2 bg-red-500/20 rounded-full blur-[1px]" />
                            <div className="absolute bottom-10 left-10 w-3 h-3 bg-red-500/10 rounded-full blur-[1px]" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
