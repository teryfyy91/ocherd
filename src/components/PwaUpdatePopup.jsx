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
            // Optional: periodically check for updates automatically
            if (r) {
                setInterval(() => {
                    r.update();
                }, 60 * 60 * 1000); // Check every hour
            }
        },
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
    });

    const handleUpdate = async () => {
        // Update function
        updateServiceWorker(true);
    };

    const handleClose = () => {
        setNeedRefresh(false);
        // Sessiya davomida boshqa bezovta qilmasligi uchun
        sessionStorage.setItem('pwa_update_dismissed', 'true');
    };

    // Agar sessiyada yopilgan bo'lsa, ko'rsatmaymiz
    if (sessionStorage.getItem('pwa_update_dismissed') === 'true') {
        return null;
    }

    return (
        <AnimatePresence>
            {needRefresh && (
                <motion.div
                    initial={{ y: 150, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 150, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                    className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[60]"
                >
                    {/* Glassmorphism Wrapper */}
                    <div className="relative rounded-2xl overflow-hidden glass shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-primary/20">
                        {/* Dark Gradient Background: Black -> Dark Green -> Emerald */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#012217] to-primary/20 opacity-90"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-bg/90 to-transparent"></div>

                        <div className="relative p-5 flex flex-col gap-4">
                            <button
                                onClick={handleClose}
                                className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors p-1"
                                aria-label="Yopish"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-black/40 border border-primary/30 flex items-center justify-center flex-shrink-0 animate-glow backdrop-blur-md">
                                    <RefreshCw className="text-primary" size={24} />
                                </div>
                                <div className="pr-4">
                                    <h3 className="text-white font-bold text-sm leading-tight mb-1">
                                        Yangi versiya mavjud
                                    </h3>
                                    <p className="text-white/60 text-xs font-medium">
                                        Ilovangiz tezroq va barqaror ishlashi uchun yangilang
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleUpdate}
                                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-[#00DAC2] text-[#0B0F14] shadow-[0_0_20px_rgba(0,200,151,0.3)] hover:shadow-[0_0_30px_rgba(0,200,151,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                🔄 Yangilash
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PwaUpdatePopup;
