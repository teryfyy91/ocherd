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

            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 1,
                        ease: "easeOut"
                    }}
                    className="relative px-8 group"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                        animate={{ opacity: 0.5, scale: 1, rotate: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full"
                    />
                    <div className="relative rounded-[40px] overflow-hidden p-2">
                        <motion.img
                            src="/logo.png"
                            alt="Logo"
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="w-[280px] md:w-[350px] object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                        />
                        {/* Premium Light Sweep Shimmer Effect */}
                        <motion.div
                            initial={{ left: "-150%" }}
                            animate={{ left: "150%" }}
                            transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 }}
                            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-25deg] z-20 pointer-events-none blur-[2px]"
                        />
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
