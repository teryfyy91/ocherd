import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Success = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        size: Math.random() * 6 + 2,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 2,
        color: Math.random() > 0.5 ? 'bg-primary' : 'bg-emerald-500/20',
    }));

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
            {/* Background Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden h-screen -z-10">
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
                            y: [0, -300, 0],
                            opacity: [0.2, 0.5, 0.2],
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
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="relative mb-12"
            >
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                <div className="w-32 h-32 glass rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
                    <motion.div
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-primary text-6xl"
                    >
                        <Check size={64} strokeWidth={3} />
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-4 max-w-sm mb-12"
            >
                <h1 className="text-4xl font-black text-white flex flex-col gap-2">
                    Muvaffaqiyatli!
                </h1>
                <p className="text-text-muted font-medium text-lg leading-relaxed">
                    Sizning navbatingiz muvaffaqiyatli band qilindi. Tez orada uchrashamiz!
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-4 w-full max-w-xs"
            >
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="btn-primary py-5 flex items-center justify-center gap-3"
                >
                    <LayoutDashboard size={20} />
                    Mening uchrashuvlarim
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="glass-card py-5 flex items-center justify-center gap-3 bg-white/5 border-white/5 text-white font-bold"
                >
                    <Home size={20} />
                    Bosh sahifa
                </button>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1 }}
                className="absolute bottom-32 text-[10px] font-black uppercase tracking-[0.4em] text-white"
            >
                OCHERD Queue System
            </motion.p>
        </div>
    );
};

export default Success;
