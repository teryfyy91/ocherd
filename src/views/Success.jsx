import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Success = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const particles = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        size: Math.random() * 5 + 3,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 2,
        color: Math.random() > 0.5 ? 'bg-primary/10' : 'bg-blue-100',
    }));

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center bg-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden h-full -z-10">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className={`absolute rounded-full ${p.color}`}
                        style={{
                            width: p.size,
                            height: p.size,
                            left: `${p.initialX}%`,
                            top: `${p.initialY}%`,
                        }}
                        animate={{
                            y: [0, -400, 0],
                            opacity: [0.2, 0.6, 0.2],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay,
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                className="relative mb-12"
            >
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-[80px]" />
                <div className="w-36 h-36 bg-primary text-white rounded-[3.5rem] flex items-center justify-center relative shadow-2xl shadow-primary/30 rotate-3">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Check size={72} strokeWidth={4} />
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-4 max-w-sm mb-16"
            >
                <h1 className="text-5xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                    Tayyor!
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] leading-loose max-w-[280px] mx-auto">
                    Navbatingiz muvaffaqiyatli band qilindi. Biz sizni kutmoqdamiz!
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-4 w-full max-w-xs relative z-10"
            >
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 active:scale-95 transition-all"
                >
                    Navbatlarim
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="w-full h-16 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-sm"
                >
                    Bosh sahifa
                </button>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1 }}
                className="absolute bottom-16 text-[8px] font-black uppercase tracking-[0.5em] text-slate-300 italic"
            >
                Barbered By BarberOS
            </motion.p>
        </div>
    );
};

export default Success;
