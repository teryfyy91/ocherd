import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, CalendarCheck, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useStore } from '../context/StoreContext';

const Landing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setShopInfo } = useStore();
    const userRole = localStorage.getItem('userRole');

    const handleOwnerStart = () => {
        setShopInfo({});
        navigate('/dashboard');
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 relative antigravity-bg">
            {/* Ambient effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-4xl mb-24 relative z-10"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest mb-8 border border-primary/20 backdrop-blur-sm"
                >
                    Premium Queue System
                </motion.div>

                <h1 className="text-6xl sm:text-7xl font-black text-dark tracking-tight mb-8 leading-[1.05]">
                    {t('heroTitle')}<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{t('heroHighlight')}</span>
                </h1>

                <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                    {t('heroDesc')}
                </p>

                <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-6 px-4 sm:px-0 w-full max-w-sm sm:max-w-none mx-auto">
                    {userRole !== 'owner' ? (
                        <>
                            <Link to="/discovery" className="flex items-center justify-center gap-3 bg-gradient-to-r from-dark to-gray-800 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-[1.5rem] font-black text-lg sm:text-xl hover:from-primary hover:to-emerald-600 transition-all duration-300 shadow-xl shadow-dark/20 active:scale-95 group border border-gray-700 hover:border-emerald-500/50">
                                {t('getStarted')}
                                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <Link to="/my-bookings" className="flex items-center justify-center gap-3 bg-white/80 backdrop-blur-md text-dark border border-gray-200/80 px-8 py-4 sm:px-10 sm:py-5 rounded-[1.5rem] font-black text-lg sm:text-xl hover:bg-white hover:border-gray-300 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 active:scale-95 group">
                                {t('myBookings')}
                                <CalendarCheck size={22} className="group-hover:scale-110 group-hover:-rotate-6 transition-transform text-primary" />
                            </Link>
                        </>
                    ) : (
                        <button
                            onClick={handleOwnerStart}
                            className="flex items-center justify-center gap-3 bg-gradient-to-r from-dark to-gray-800 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-[1.5rem] font-black text-lg sm:text-xl hover:from-secondary hover:to-sky-500 transition-all duration-300 shadow-xl shadow-dark/20 active:scale-95 group border border-gray-700 hover:border-sky-400/50 w-full sm:w-auto"
                        >
                            {t('ownerPanel')}
                            <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    )}
                </div>
            </motion.div>

            {/* How it works */}
            <div className="w-full max-w-6xl relative z-10">
                <div className="flex flex-col items-center mb-16">
                    <h2 className="text-4xl font-black text-dark tracking-tight mb-4">{t('howItWorks')}</h2>
                    <div className="h-1.5 w-20 bg-primary rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StepCard
                        icon={<CalendarCheck size={36} className="text-primary" />}
                        title={t('bookSlot')}
                        desc={t('bookSlotDesc')}
                        delay={0.1}
                    />
                    <StepCard
                        icon={<Users size={36} className="text-secondary" />}
                        title={t('joinQueue')}
                        desc={t('joinQueueDesc')}
                        delay={0.2}
                    />
                    <StepCard
                        icon={<Clock size={36} className="text-amber-500" />}
                        title={t('saveTime')}
                        desc={t('saveTimeDesc')}
                        delay={0.3}
                    />
                </div>
            </div>
        </div>
    );
};

const StepCard = ({ icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay, type: "spring", bounce: 0.4 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white flex flex-col items-center sm:items-start text-center sm:text-left shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.15)] transition-all duration-300 group overflow-hidden relative"
    >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none transition-all duration-500 group-hover:bg-primary/20 group-hover:scale-150" />

        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-50 to-white group-hover:from-white group-hover:to-primary/5 rounded-[1.5rem] flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-sm border border-gray-100 group-hover:border-primary/20 relative z-10">
            {icon}
        </div>
        <h3 className="text-xl sm:text-2xl font-black mb-3 text-dark tracking-tight relative z-10">{title}</h3>
        <p className="text-gray-500 font-medium leading-relaxed text-sm sm:text-base relative z-10">{desc}</p>
    </motion.div>
);

export default Landing;
