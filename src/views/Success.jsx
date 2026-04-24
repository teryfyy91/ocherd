import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Success = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Particle generation for "Confetti from the Future"
    const particles = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        size: Math.random() * 8 + 4,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 2,
        shape: Math.random() > 0.5 ? 'cube' : 'sphere',
        color: Math.random() > 0.5 ? 'bg-primary' : 'bg-secondary',
    }));

    return (
        <div className="relative min-h-screen antigravity-bg overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12">
            {/* Deep Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-primary/20 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-secondary/20 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply"></div>

            {/* Floating Particles (Anti-gravity physics) */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className={`absolute ${p.shape === 'sphere' ? 'rounded-full' : 'rounded-sm'} ${p.color} opacity-20`}
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.initialX}%`,
                        top: `${p.initialY}%`,
                    }}
                    animate={{
                        y: [0, -200, 0],
                        x: [0, Math.random() * 80 - 40, 0],
                        rotate: [0, 180, 360],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: p.delay,
                    }}
                />
            ))}

            {/* Success Content Box */}
            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0, y: [-10, 10, -10] }}
                    transition={{
                        scale: { type: "spring", stiffness: 200, damping: 20 },
                        rotateY: { duration: 2, ease: "easeOut" },
                        y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="relative mb-12"
                >
                    <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-30 animate-pulse scale-150" />
                    <div className="w-44 h-44 sm:w-56 sm:h-56 bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white shadow-2xl flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
                            <motion.path
                                d="M30 52L45 67L72 37"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 0.8, ease: "circOut" }}
                            />
                        </svg>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="glass p-10 sm:p-16 rounded-[3rem] sm:rounded-[4rem] w-full text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden"
                >
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                    <h1 className="text-4xl sm:text-6xl font-black text-dark mb-6 tracking-tight leading-tight">
                        {t('successTitle')}
                    </h1>

                    <p className="text-gray-400 text-lg sm:text-xl font-bold leading-relaxed mb-12 max-w-sm mx-auto">
                        {t('successDesc')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <motion.button
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl border-2 border-gray-100 text-gray-500 font-black hover:border-gray-200 hover:text-dark transition-all w-full sm:w-auto text-sm uppercase tracking-widest"
                        >
                            <Home size={20} />
                            {t('goHome')}
                        </motion.button>

                        <motion.button
                            whileHover={{ y: -5, scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                const role = localStorage.getItem('userRole');
                                navigate(role === 'owner' ? '/dashboard' : '/my-bookings');
                            }}
                            className="relative overflow-hidden group flex items-center justify-center gap-3 px-12 py-5 rounded-2xl bg-dark text-white font-black shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] hover:bg-black transition-all w-full sm:w-auto text-sm uppercase tracking-widest"
                        >
                            <div className="absolute inset-0 bg-white/10 -skew-x-12 -translate-x-full group-hover:animate-shine" />
                            <LayoutDashboard size={20} />
                            {t('goDashboard')}
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="mt-12 text-gray-400 text-[10px] font-black tracking-[0.4em] uppercase"
                >
                    QueueFlow System • {new Date().getFullYear()}
                </motion.div>
            </div>
        </div>
    );
};

export default Success;
