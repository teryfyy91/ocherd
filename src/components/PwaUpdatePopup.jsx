import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

const PwaUpdatePopup = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            if (r) {
                setInterval(() => {
                    r.update();
                }, 60 * 60 * 1000);
            }
        },
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
    });

    const handleUpdate = async () => {
        updateServiceWorker(true);
    };

    const handleClose = () => {
        setNeedRefresh(false);
        sessionStorage.setItem('pwa_update_dismissed', 'true');
    };

    if (sessionStorage.getItem('pwa_update_dismissed') === 'true') {
        return null;
    }

    return (
        <AnimatePresence>
            {needRefresh && (
                <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 w-[calc(100%-2rem)] md:w-[400px] z-[100]"
                >
                    <div className="relative group overflow-hidden rounded-[2rem] p-px bg-gradient-to-b from-white/20 to-white/5 luxury-shadow">
                        {/* Background with Blur */}
                        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-2xl" />

                        {/* Animated Mesh Gradient Background */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#7C3AED,transparent_60%)]" />

                        <div className="relative p-6 flex flex-col gap-6">
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/10"
                            >
                                <X size={16} />
                            </button>

                            <div className="flex items-start gap-5">
                                {/* Icon with Glow */}
                                <div className="relative flex-shrink-0">
                                    <div className="absolute inset-0 bg-primary/40 blur-xl animate-pulse rounded-full" />
                                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center border border-white/20 shadow-lg">
                                        <RefreshCw className="text-white animate-spin-slow" size={28} />
                                    </div>
                                </div>

                                <div className="flex-1 pt-1">
                                    <h3 className="text-white font-bold text-lg leading-tight mb-1.5 tracking-tight">
                                        Yangi versiya mavjud
                                    </h3>
                                    <p className="text-slate-400 text-[13px] leading-relaxed font-medium">
                                        Ilovangiz tezroq va barqaror ishlashi uchun yangi versiyaga yangilang.
                                    </p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleUpdate}
                                className="relative w-full group/btn h-12 flex items-center justify-center"
                            >
                                <div className="absolute inset-0 bg-primary rounded-2xl transition-all duration-300 group-hover/btn:scale-[1.02] group-hover/btn:shadow-[0_0_30px_rgba(124,58,237,0.4)]" />
                                <div className="relative flex items-center gap-2 text-white font-bold text-sm">
                                    <RefreshCw size={16} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                                    Yangilash
                                </div>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PwaUpdatePopup;
