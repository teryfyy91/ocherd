import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const PendingApproval = ({ onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[2000] bg-white/20 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center overscroll-none">
            <div className="absolute inset-0 bg-primary/5 opacity-40 blur-[120px] rounded-full" />
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-sm flex flex-col items-center gap-10 bg-white/40 backdrop-blur-md p-10 rounded-[3rem] border border-white shadow-2xl"
            >
                <div className="w-24 h-24 bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 rotate-6 translate-y-[-20%]">
                    <Clock size={48} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-4">
                    <h2 className="text-4xl font-black text-slate-800 uppercase italic leading-none tracking-tighter">Yuborildi</h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] leading-loose max-w-[280px] mx-auto">
                        So‘rovingiz yuborildi. Admin tasdiqlashini kuting.
                    </p>
                </div>
                <button
                    onClick={onConfirm}
                    className="w-full h-16 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 active:scale-95 transition-all"
                >
                    TUSHUNARLI
                </button>
            </motion.div>
        </div>
    );
};

export default PendingApproval;
