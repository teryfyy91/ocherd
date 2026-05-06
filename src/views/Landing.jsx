import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, CalendarCheck, ArrowRight, Scissors } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InstallPWA from '../components/InstallPWA';

import { useStore } from '../context/StoreContext';

const Landing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setShopInfo, myShops } = useStore();
    const userRole = localStorage.getItem('userRole');
    const [showSuccess, setShowSuccess] = React.useState(false);

    React.useEffect(() => {
        const justReg = sessionStorage.getItem('justRegistered');
        if (justReg === 'true') {
            setShowSuccess(true);
        }
    }, []);

    // Check if user has a pending shop request (secondary check)
    const pendingShop = myShops.find(s => s.status === 'Pending');

    return (
        <div className="flex flex-col gap-10 pb-20 relative">
            <AnimatePresence>
                {(showSuccess || pendingShop) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed inset-x-6 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-[1000] glass-card p-10 md:p-16 border-emerald-500/50 bg-bg/90 backdrop-blur-3xl shadow-[0_0_100px_rgba(16,185,129,0.4)] text-center max-w-xl w-full border-2"
                    >
                        <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-bg shadow-2xl shadow-emerald-500/50 mx-auto mb-10">
                            <CalendarCheck size={48} />
                        </div>
                        <h4 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">
                            Sorovnomangiz <br /> yuborildi!
                        </h4>
                        <p className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-10 opacity-90">
                            Admin tasdiqlashini kuting. <br /> Tez orada faol bo'ladi.
                        </p>
                        <button
                            onClick={() => {
                                setShowSuccess(false);
                                sessionStorage.removeItem('justRegistered');
                            }}
                            className="w-full py-6 bg-emerald-500 text-bg rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/30"
                        >
                            Tushunarli
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[440px] rounded-[32px] overflow-hidden group shadow-2xl"
            >
                <img
                    src="/barber_hero.png"
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent flex flex-col justify-end p-8 pb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 mb-4"
                    >
                        <div className="h-0.5 w-8 bg-primary rounded-full" />
                        <span className="text-secondary-foreground text-xs font-bold uppercase tracking-widest text-primary">Premium Service</span>
                    </motion.div>
                    <h1 className="text-4xl font-black text-text-main leading-tight mb-4 tracking-tight">
                        Navbatingizni <br />
                        <span className="text-primary italic">soniyalarda</span> band qiling
                    </h1>
                    <p className="text-text-muted text-sm font-medium mb-8 max-w-[280px] leading-relaxed">
                        {t('heroDesc')}
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const isAdmin = localStorage.getItem('currentUserPhone') === '+998505521107';
                                if (isAdmin) {
                                    navigate('/dashboard');
                                } else {
                                    navigate('/discovery');
                                }
                            }}
                            className="btn-primary w-fit animate-glow"
                        >
                            {t('getStarted')}
                            <ArrowRight size={20} />
                        </button>
                        <div className="md:hidden">
                            <InstallPWA />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions / Status Cards */}
            <div className="grid grid-cols-2 gap-4">
                <GlassActionCard
                    icon={<CalendarCheck className="text-primary" size={24} />}
                    label={t('myBookings')}
                    onClick={() => navigate('/my-bookings')}
                    delay={0.4}
                />
                <GlassActionCard
                    icon={<Users className="text-emerald-400" size={24} />}
                    label="Yaqin salonlar"
                    onClick={() => navigate('/discovery')}
                    delay={0.5}
                />
            </div>

            {/* Features / Steps Section */}
            <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-black text-text-main px-1 tracking-tight">Qanday ishlaydi?</h2>
                <div className="flex flex-col gap-4">
                    <StepCard
                        number="01"
                        title="Salon tanlang"
                        desc="O'zingizga qulay va yaqin joyni kashf eting"
                        delay={0.6}
                    />
                    <StepCard
                        number="02"
                        title="Vaqtni band qiling"
                        desc="Bo'sh vaqtni tanlang va navbatga yoziling"
                        delay={0.7}
                    />
                    <StepCard
                        number="03"
                        title="Navbatni kuzating"
                        desc="Jonli navbat orqali kutish vaqtini kamaytiring"
                        delay={0.8}
                    />
                </div>
            </div>

        </div>
    );
};

const GlassActionCard = ({ icon, label, onClick, delay }) => (
    <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        onClick={onClick}
        className="glass-card p-6 flex flex-col gap-4 text-left active:scale-95 transition-transform"
    >
        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center shadow-lg">
            {icon}
        </div>
        <span className="font-bold text-text-main text-sm leading-tight">{label}</span>
    </motion.button>
);

const StepCard = ({ number, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className="glass-card p-6 flex items-start gap-5 group"
    >
        <div className="text-2xl font-black text-primary/20 group-hover:text-primary transition-colors duration-500">{number}</div>
        <div className="flex flex-col gap-1">
            <h4 className="text-lg font-bold text-text-main">{title}</h4>
            <p className="text-text-muted text-xs font-medium leading-relaxed">{desc}</p>
        </div>
    </motion.div>
);


export default Landing;

