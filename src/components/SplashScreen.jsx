import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#0B0F14] overflow-hidden"
        >
            {/* Animated Particles/Orbs in Background */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/10 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 70, 0],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/5 blur-[100px] rounded-full"
                />
            </div>

            <div className="relative">
                {/* Logo with sophisticated animations */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 30
                    }}
                    className="relative z-10 flex flex-col items-center gap-10"
                >
                    <div className="relative">
                        {/* Rotating Ring around logo */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-8 border-[1px] border-primary/20 rounded-full border-dashed"
                        />

                        <motion.div
                            animate={{
                                y: [0, -15, 0],
                                filter: ["drop-shadow(0 0 20px rgba(0,200,151,0.2))", "drop-shadow(0 0 40px rgba(0,200,151,0.4))", "drop-shadow(0 0 20px rgba(0,200,151,0.2))"]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-40 h-40 md:w-56 md:h-56 object-contain"
                            />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <h1 className="text-5xl md:text-7xl font-black tracking-[0.3em] text-white">
                            OCHERD
                        </h1>
                        <p className="text-primary font-black tracking-[0.5em] text-[10px] md:text-sm uppercase opacity-70">
                            Navbatda kuting
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* Elegant Progress Indicator */}
            <div className="absolute bottom-20 flex flex-col items-center gap-4">
                <div className="w-32 h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="h-full bg-primary shadow-[0_0_10px_#00C897]"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default SplashScreen;
