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
    const { myShops, setShopInfo } = useStore();
    const userRole = localStorage.getItem('userRole');

    const handleSignOut = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('hasSelectedLang');
        localStorage.removeItem('userRole');
        window.location.href = '/';
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
            <nav className="sticky top-0 z-50 px-4 py-4 pointer-events-none">
                <div className="max-w-7xl mx-auto glass rounded-[2rem] px-8 py-4 flex justify-between items-center bg-white/60 pointer-events-auto">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary p-2.5 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
                            <Scissors size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-black text-dark tracking-tighter">QueueFlow</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <InstallPWA />
                        {userRole !== 'owner' && (
                            <>
                                <Link to="/discovery" className="hidden sm:block font-bold text-gray-500 hover:text-dark transition-colors">
                                    {t('discoverServices')}
                                </Link>
                                <Link to="/my-bookings" className="hidden sm:block font-bold text-gray-500 hover:text-dark transition-colors">
                                    {t('myBookings')}
                                </Link>
                            </>
                        )}
                        {userRole === 'owner' && (
                            <div className="relative flex items-stretch bg-dark rounded-xl shadow-xl shadow-dark/10 overflow-hidden group/btn">
                                <button
                                    onClick={() => { setShopInfo({}); navigate('/dashboard'); }}
                                    className="bg-dark text-white pl-6 pr-4 py-3 font-black transition-all hover:bg-gray-800 active:scale-95 flex items-center gap-2 border-r border-white/10"
                                >
                                    {t('ownerPanel')}
                                </button>
                                <button
                                    onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                                    className="bg-dark text-white px-3 py-3 transition-colors hover:bg-gray-800 active:scale-95"
                                >
                                    <motion.div
                                        animate={{ rotate: showOwnerDropdown ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {showOwnerDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-72 glass bg-white/90 rounded-[1.5rem] border border-white p-2 shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="max-h-60 overflow-y-auto mb-2 custom-scrollbar">
                                                {myShops.length > 0 ? (
                                                    myShops.map((shop) => (
                                                        <button
                                                            key={shop.id}
                                                            onClick={() => handleShopSelect(shop)}
                                                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors group flex items-center gap-3"
                                                        >
                                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                <Scissors size={18} />
                                                            </div>
                                                            <div className="flex flex-col truncate">
                                                                <span className="font-bold text-dark truncate">{shop.name}</span>
                                                                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{t('id')}: {shop.id?.slice(0, 8)}</span>
                                                            </div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-6 text-center text-gray-400 text-sm font-medium italic">
                                                        {t('noShops')}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="border-t border-gray-50 pt-2">
                                                <button
                                                    onClick={handleNewSalon}
                                                    className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-primary/20 active:scale-95"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                                    </svg>
                                                    {t('newSalon')}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {showOwnerDropdown && (
                                    <div
                                        className="fixed inset-0 z-40 bg-transparent"
                                        onClick={() => setShowOwnerDropdown(false)}
                                    />
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="p-3 bg-red-100/50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-200"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
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
