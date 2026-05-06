import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, LogOut, Sun, Moon, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import InstallPWA from './InstallPWA';

const Navbar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const { signOut, theme, toggleTheme } = useStore();
    const userRole = localStorage.getItem('userRole');

    const handleSignOut = () => {
        signOut();
    };

    return (
        <>
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm pointer-events-auto">
                <div className="glass rounded-3xl p-2 flex justify-around items-center shadow-2xl border border-white/5">
                    {/* Only Show Dashboard for Super Admin */}
                    {localStorage.getItem('currentUserPhone') === '+998505521107' && (
                        <button onClick={() => navigate('/dashboard')} className={`p-4 transition-all active:scale-90 ${window.location.pathname === '/dashboard' ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </button>
                    )}

                    {/* Show Discovery only for non-admins */}
                    {localStorage.getItem('currentUserPhone') !== '+998505521107' && (
                        <button
                            onClick={() => {
                                if (window.location.pathname === '/discovery') {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    const searchInput = document.querySelector('input[placeholder*="Salon nomini"]');
                                    if (searchInput) searchInput.focus();
                                } else {
                                    navigate('/discovery');
                                }
                            }}
                            className={`p-4 transition-all active:scale-90 ${window.location.pathname === '/discovery' ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="p-4 text-text-muted hover:text-primary transition-all active:scale-90"
                    >
                        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                    </button>

                    <button
                        onClick={() => setShowConfirm(true)}
                        className="p-4 text-text-muted hover:text-red-400 transition-all active:scale-90"
                    >
                        <LogOut size={24} />
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ backdropFilter: "blur(0px)", backgroundColor: "rgba(0, 0, 0, 0)" }}
                            animate={{ backdropFilter: "blur(12px)", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                            exit={{ backdropFilter: "blur(0px)", backgroundColor: "rgba(0, 0, 0, 0)" }}
                            className="absolute inset-0"
                            onClick={() => setShowConfirm(false)}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            className="glass max-w-sm w-full p-10 rounded-[3rem] text-center relative z-10 border border-white/10 [background:var(--card-bg)]"
                        >
                            <div className="w-20 h-20 bg-red-400/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-400 shadow-inner">
                                <LogOut size={36} />
                            </div>

                            <h2 className="text-2xl font-black text-text-main mb-2 tracking-tight">
                                {t('confirmSignOut')}
                            </h2>
                            <p className="text-text-muted font-bold mb-8 text-xs uppercase tracking-widest opacity-60">
                                {t('areYouSure')}
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
                                >
                                    {t('yesSignOut')}
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="w-full glass-card border-white/5 py-4 rounded-2xl font-black text-lg hover:bg-white/5 transition-all text-text-main"
                                >
                                    {t('cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
