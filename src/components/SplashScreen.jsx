import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden select-none"
        >
            {/* Dynamic Mesh Decorative Orbs */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        x: [0, 50, 0],
                        opacity: [0.03, 0.08, 0.03]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-15%] right-[-15%] w-[800px] h-[800px] bg-primary rounded-full blur-[150px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -40, 0],
                        opacity: [0.03, 0.06, 0.03]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-15%] left-[-15%] w-[700px] h-[700px] bg-primary rounded-full blur-[140px]"
                />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-16">
                <motion.div
                    initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 6 }}
                    transition={{
                        type: "spring",
                        damping: 12,
                        stiffness: 100,
                        duration: 1.2
                    }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-150 animate-pulse" />
                    <div className="w-36 h-36 md:w-48 md:h-48 bg-slate-900 rounded-[3.5rem] flex items-center justify-center shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] relative border-8 border-white overflow-hidden group">
                        <motion.div
                            animate={{ x: ['100%', '-100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                        />
                        <motion.img
                            src="/logo.png"
                            alt="Logo"
                            className="w-full h-full object-contain p-4 relative z-10"
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="flex flex-col items-center">
                        <h2 className="text-5xl md:text-7xl font-black text-slate-800 uppercase italic tracking-tighter leading-none mb-2">
                            Barber<span className="text-primary">OS</span>
                        </h2>
                        <div className="flex items-center gap-4 w-full">
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-primary/20 rounded-full" />
                            <span className="text-primary font-black uppercase tracking-[0.8em] text-[10px] md:text-xs opacity-60">Luxury Edition</span>
                            <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-primary/20 rounded-full" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Premium Loading Indicator */}
            <div className="absolute bottom-24 flex flex-col items-center gap-8">
                <div className="w-48 h-[3px] bg-slate-100 rounded-full overflow-hidden relative border border-slate-50">
                    <motion.div
                        initial={{ left: '-100%' }}
                        animate={{ left: '100%' }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default SplashScreen;
