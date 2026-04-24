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
        <div className="flex flex-col items-center justify-center py-12 relative antigravity-bg overflow-hidden">
            {/* Deep Ambient effects for less boring look */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-primary/20 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-secondary/20 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-4xl mb-24 relative z-10 px-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block bg-white/60 text-primary px-5 py-2 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest mb-8 border border-white shadow-xl shadow-primary/10 backdrop-blur-md"
                >
                    Premium Queue System
                </motion.div>

                <h1 className="text-5xl sm:text-7xl font-black text-dark tracking-tight mb-8 leading-[1.05]">
                    {t('heroTitle')}<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-secondary animate-gradient-x">{t('heroHighlight')}</span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                    {t('heroDesc')}
                </p>

                <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-6 w-full max-w-sm sm:max-w-none mx-auto">
                    {userRole !== 'owner' ? (
                        <>
                            <Link to="/discovery" className="flex items-center justify-center gap-3 bg-gradient-to-r from-dark to-gray-800 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-[1.5rem] font-black text-lg sm:text-xl hover:from-primary hover:to-emerald-600 transition-all duration-300 shadow-2xl shadow-dark/20 active:scale-95 group border border-gray-700 hover:border-emerald-500/50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-shine" />
                                {t('getStarted')}
                                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <Link to="/my-bookings" className="flex items-center justify-center gap-3 bg-white/90 backdrop-blur-md text-dark border border-white px-8 py-4 sm:px-10 sm:py-5 rounded-[1.5rem] font-black text-lg sm:text-xl hover:bg-white hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 active:scale-95 group">
                                {t('myBookings')}
                                <CalendarCheck size={22} className="group-hover:scale-110 group-hover:-rotate-6 transition-transform text-primary" />
                            </Link>
                        </>
                    ) : (
                        <button
                            onClick={handleOwnerStart}
                            className="flex items-center justify-center gap-3 bg-gradient-to-r from-dark to-gray-800 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-[1.5rem] font-black text-lg sm:text-xl hover:from-secondary hover:to-sky-500 transition-all duration-300 shadow-2xl shadow-dark/20 active:scale-95 group border border-gray-700 hover:border-sky-400/50 w-full sm:w-auto relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-shine" />
                            {t('ownerPanel')}
                            <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    )}
                </div>
            </motion.div>

            {/* How it works */}
            <div className="w-full max-w-6xl relative z-10 px-4">
                <div className="flex flex-col items-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-black text-dark tracking-tight mb-6">{t('howItWorks')}</h2>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    <StepCard
                        icon={<CalendarCheck size={32} className="text-white" />}
                        title={t('bookSlot')}
                        desc={t('bookSlotDesc')}
                        delay={0.1}
                        gradient="from-primary to-emerald-400"
                    />
                    <StepCard
                        icon={<Users size={32} className="text-white" />}
                        title={t('joinQueue')}
                        desc={t('joinQueueDesc')}
                        delay={0.2}
                        gradient="from-sky-400 to-indigo-500"
                    />
                    <StepCard
                        icon={<Clock size={32} className="text-white" />}
                        title={t('saveTime')}
                        desc={t('saveTimeDesc')}
                        delay={0.3}
                        gradient="from-amber-400 to-orange-500"
                    />
                </div>
            </div>
        </div>
    );
};

const StepCard = ({ icon, title, desc, delay, gradient }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay, type: "spring", bounce: 0.4 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative group p-[2px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5"
    >
        {/* Animated border gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-500`} />

        {/* Inner Card */}
        <div className="relative h-full bg-white/95 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col items-center sm:items-start text-center sm:text-left z-10 overflow-hidden">

            {/* Soft inner glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-[40px] -mr-16 -mt-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />

            <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${gradient} rounded-[1.5rem] flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-lg text-white relative z-10`}>
                {icon}
            </div>

            <h3 className="text-xl sm:text-2xl font-black mb-3 text-dark tracking-tight relative z-10">{title}</h3>
            <p className="text-gray-500 font-bold leading-relaxed text-sm sm:text-base relative z-10">{desc}</p>
        </div>
    </motion.div>
);

export default Landing;
