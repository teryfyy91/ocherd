import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck } from 'lucide-react';

const PendingApproval = ({ onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[2000] bg-white/40 backdrop-blur-[100px] flex flex-col items-center justify-center p-8 text-center overscroll-none">
            {/* Dynamic Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 100 }}
                className="relative z-10 w-full max-w-sm flex flex-col items-center gap-12 bg-white/60 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] ring-1 ring-black/5"
            >
                <div className="relative">
                    <motion.div
                        animate={{
                            rotate: [0, 10, 0, -10, 0],
                            scale: [1, 1.05, 1, 1.05, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-28 h-28 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-slate-900/20"
                    >
                        <Clock size={56} strokeWidth={2.5} />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="absolute -top-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg"
                    >
                        <ShieldCheck size={20} />
                    </motion.div>
                </div>

                <div className="flex flex-col gap-5">
                    <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none tracking-tight">Kutilmoqda</h2>
                    <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto italic opacity-70">
                        Sizning so'rovingiz yuborildi, admin tasdiqlashini kuting
                    </p>
                </div>

                <button
                    onClick={onConfirm}
                    className="w-full h-18 bg-slate-900 text-white rounded-[2.2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-slate-900/10 active:scale-95 hover:bg-slate-800 transition-all flex items-center justify-center"
                >
                    TUSHUNARLI
                </button>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1 }}
                className="absolute bottom-12 text-[7px] font-black uppercase tracking-[0.8em] text-slate-400"
            >
                Barbered By BarberOS Secures
            </motion.p>
        </div>
    );
};


export default PendingApproval;
