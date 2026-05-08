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
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        damping: 15,
                        stiffness: 100,
                        duration: 1.2
                    }}
                    className="relative px-8"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-110 animate-pulse" />
                    <motion.img
                        src="/logo.png"
                        alt="Logo"
                        className="w-[280px] md:w-[350px] object-contain relative z-10 drop-shadow-2xl"
                    />
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
