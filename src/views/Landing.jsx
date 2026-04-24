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

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    {userRole !== 'owner' ? (
                        <>
                            <Link to="/discovery" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-dark text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-2xl shadow-dark/20 active:scale-95 group">
                                {t('getStarted')}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/my-bookings" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-dark border-2 border-gray-100 px-10 py-5 rounded-2xl font-black text-lg hover:border-dark transition-all active:scale-95 group">
                                {t('myBookings')}
                                <CalendarCheck size={20} className="group-hover:scale-110 transition-transform text-primary" />
                            </Link>
                        </>
                    ) : (
                        <button
                            onClick={handleOwnerStart}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-dark text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-2xl shadow-dark/10 active:scale-95"
                        >
                            {t('ownerPanel')}
                            <ArrowRight size={20} />
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
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        whileHover={{ y: -10 }}
        className="bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/60 flex flex-col items-center text-center shadow-[0_8px_32px_rgba(34,211,238,0.05)] hover:shadow-[0_20px_60px_rgba(34,211,238,0.12)] transition-all group"
    >
        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-2xl font-black mb-4 text-dark">{title}</h3>
        <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
    </motion.div>
);

export default Landing;
