import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

const PendingApproval = ({ onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[2000] bg-[#0B0F14] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Dynamic Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-dot-pattern opacity-10" />
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="relative z-10 w-full max-w-[340px] flex flex-col items-center gap-10 bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)]"
            >
                <div className="relative">
                    <motion.div
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/20"
                    >
                        <CheckCircle2 size={48} strokeWidth={2.5} />
                    </motion.div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-8 h-8 bg-white text-primary rounded-xl flex items-center justify-center border-2 border-[#0B0F14] shadow-lg"
                    >
                        <ShieldCheck size={16} />
                    </motion.div>
                </div>

                <div className="flex flex-col gap-4">
                    <h2 className="text-3xl font-black text-white uppercase italic leading-none tracking-tight">So'rov yuborildi</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] leading-relaxed max-w-[240px] mx-auto opacity-80">
                        Tabriklaymiz! Sizning so'rovingiz muvaffaqiyatli yuborildi. Admin tasdiqlashini kuting.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onConfirm}
                    className="w-full h-16 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center group"
                >
                    TUSHUNARLI
                </motion.button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-10 flex flex-col items-center gap-2"
            >
                <span className="text-[7px] font-black uppercase tracking-[1em] text-white">BarberOS Cloud</span>
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
            </motion.div>
        </div>
    );
};


export default PendingApproval;
