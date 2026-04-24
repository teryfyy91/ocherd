import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Success = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Particle generation for "Confetti from the Future"
    const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        size: Math.random() * 12 + 6,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 2,
        shape: Math.random() > 0.5 ? 'cube' : 'sphere',
        opacity: Math.random() * 0.5 + 0.1,
    }));

    return (
        <div className="relative min-h-screen bg-[#fdfdfd] overflow-hidden flex flex-col items-center justify-center p-6 font-['Outfit']">
            {/* Volumetric Light Effect */}
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
                <div
                    className="absolute top-[-10%] right-[-5%] w-[80%] h-[80%] opacity-20"
                    style={{
                        background: 'radial-gradient(circle at 100% 0%, #10b981 0%, transparent 70%)',
                        filter: 'blur(80px)'
                    }}
                />
                <div
                    className="absolute top-0 right-0 w-full h-full opacity-[0.03]"
                    style={{
                        background: 'linear-gradient(135deg, transparent 0%, transparent 60%, #10b981 100%)'
                    }}
                />
            </div>

            {/* Floating Particles (Anti-gravity physics) */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className={`absolute ${p.shape === 'sphere' ? 'rounded-full' : 'rounded-sm'} bg-emerald-500 opacity-20`}
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.initialX}%`,
                        top: `${p.initialY}%`,
                    }}
                    animate={{
                        y: [0, -150, 0],
                        x: [0, Math.random() * 60 - 30, 0],
                        rotate: [0, 180, 360],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: p.delay,
                    }}
                />
            ))}

            {/* Floating 3D Checkmark Section */}
            <div className="relative mb-16 perspective-1000">
                <motion.div
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{
                        scale: 1,
                        rotateY: 0,
                        y: [-15, 15, -15]
                    }}
                    transition={{
                        scale: { type: "spring", stiffness: 260, damping: 20 },
                        rotateY: { duration: 2, ease: "easeOut" },
                        y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="relative z-10"
                >
                    {/* Checkmark Glow */}
                    <div className="absolute inset-0 bg-emerald-400 rounded-full blur-3xl opacity-20 animate-pulse scale-150" />

                    <div className="w-40 h-40 md:w-52 md:h-52 flex items-center justify-center relative">
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_15px_30px_rgba(16,185,129,0.3)]">
                            <defs>
                                <linearGradient id="liquidEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="50%" stopColor="#34d399" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                                <filter id="glass-glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
                                    <feSpecularLighting in="blur" surfaceScale="8" specularConstant="1" specularExponent="30" lightingColor="#ffffff" result="specOut">
                                        <fePointLight x="-20" y="-30" z="150" />
                                    </feSpecularLighting>
                                    <feComposite in="specOut" in2="SourceGraphic" operator="in" result="specOut" />
                                    <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
                                </filter>
                            </defs>

                            {/* Checkmark Path */}
                            <motion.path
                                d="M30 52L45 67L72 37"
                                fill="none"
                                stroke="url(#liquidEmerald)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#glass-glow)"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 0.6, ease: "circOut" }}
                            />

                            {/* Outer Glass Ring */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="0.5"
                                strokeOpacity="0.2"
                            />
                        </svg>
                    </div>
                </motion.div>
            </div>

            {/* Floating Confirmation Card (Glassmorphism) */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative glass p-10 md:p-14 rounded-[3rem] max-w-lg w-full text-center z-20"
            >
                {/* Subtle Animated Background Grain/Noise or Gradient */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-[3rem] overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white to-transparent" />
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
                    {t('successTitle')}
                </h1>

                <p className="text-gray-500 text-lg md:text-2xl font-normal leading-relaxed mb-12">
                    {t('successDesc')}<br />
                    <span className="text-emerald-500 font-semibold opacity-90 drop-shadow-sm">
                        {t('allControlled')}
                    </span>
                </p>

                {/* Action Buttons (Weightless) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -3, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-3 px-10 py-4 rounded-2xl border-2 border-emerald-500/10 text-emerald-600 font-bold hover:border-emerald-500/30 transition-all duration-500 w-full sm:w-auto text-lg"
                    >
                        <Home size={22} className="opacity-80" />
                        {t('goHome')}
                    </motion.button>

                    <motion.button
                        whileHover={{
                            scale: 1.05,
                            y: -3,
                            boxShadow: "0 25px 50px -12px rgba(16,185,129,0.5)",
                            filter: "brightness(1.05)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            const role = localStorage.getItem('userRole');
                            navigate(role === 'owner' ? '/dashboard' : '/my-bookings');
                        }}
                        className="flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-emerald-500 text-white font-bold shadow-[0_15px_35px_-10px_rgba(16,185,129,0.4)] transition-all duration-500 w-full sm:w-auto text-lg"
                    >
                        <LayoutDashboard size={22} />
                        {t('goDashboard')}
                    </motion.button>
                </div>
            </motion.div>

            {/* Symmetrical Balance Indicator */}
            <div className="absolute bottom-10 left-10 w-0.5 h-12 bg-gradient-to-t from-emerald-500/20 to-transparent" />
            <div className="absolute bottom-10 right-10 w-0.5 h-12 bg-gradient-to-t from-emerald-500/20 to-transparent" />

            <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 text-gray-400 text-xs font-medium tracking-[0.3em] uppercase"
            >
                QueueFlow System • Online
            </motion.div>
        </div>
    );
};

export default Success;
