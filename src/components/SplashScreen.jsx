import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden select-none"
        >
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.05, 0.1, 0.05]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.05, 0.08, 0.05]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[100px]"
                />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-12">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full scale-150" />
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-900 rounded-[3rem] flex items-center justify-center shadow-2xl relative rotate-3 border-4 border-white">
                        <motion.h1
                            initial={{ rotate: -15 }}
                            animate={{ rotate: 0 }}
                            className="text-white text-6xl md:text-7xl font-black italic tracking-tighter"
                        >B</motion.h1>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center gap-4"
                >
                    <h2 className="text-4xl md:text-6xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                        Barber<span className="text-primary">OS</span>
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-[2px] bg-primary/20 rounded-full" />
                        <p className="text-primary font-black uppercase tracking-[0.6em] text-[10px] md:text-xs">
                            Premium Style
                        </p>
                        <div className="w-10 h-[2px] bg-primary/20 rounded-full" />
                    </div>
                </motion.div>
            </div>

            <div className="absolute bottom-24 flex flex-col items-center gap-6">
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            className="w-2 h-2 bg-primary rounded-full"
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default SplashScreen;
