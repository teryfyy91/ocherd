import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PwaInstallPopup = () => {
    const [promptInstall, setPromptInstall] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Agar allaqachon standalone rejimda ishlayotgan bo'lsa (o'rnatilgan)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Sessiya davomida yopilganligini tekshirish
        const isDismissed = sessionStorage.getItem('pwa_popup_dismissed');
        if (isDismissed) return;

        const handler = e => {
            e.preventDefault();
            setPromptInstall(e);
        };

        const installedHandler = () => {
            setIsInstalled(true);
            setIsVisible(false);
            setPromptInstall(null);
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', installedHandler);

        // 2.5 soniyadan keyin ko'rsatish
        const timer = setTimeout(() => {
            if (!sessionStorage.getItem('pwa_popup_dismissed') && !isInstalled) {
                // If there's no prompt, usually Android PWA shows an add to home screen anyway.
                // We show this to prompt the user.
                setIsVisible(true);
            }
        }, 2500);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
            clearTimeout(timer);
        };
    }, []);

    const handleInstall = async () => {
        if (!promptInstall) {
            // Agar install prompt mavjud bo'lmasa, uni qandaydir fallback orqali bildiramiz (asosan iOS uchun kerak, Androidda ushlaydi)
            return;
        }
        await promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
            setIsInstalled(true);
            setIsVisible(false);
        }
        setPromptInstall(null);
    };

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('pwa_popup_dismissed', 'true');
    };

    if (isInstalled) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 150, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 150, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                    className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
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
                                    <Download className="text-primary" size={24} />
                                </div>
                                <div className="pr-4">
                                    <h3 className="text-white font-bold text-sm leading-tight mb-1">
                                        App sifatida o‘rnatmoqchimisiz?
                                    </h3>
                                    <p className="text-white/60 text-xs font-medium">
                                        Tezroq va qulayroq foydalanish uchun
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleInstall}
                                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-[#00DAC2] text-[#0B0F14] shadow-[0_0_20px_rgba(0,200,151,0.3)] hover:shadow-[0_0_30px_rgba(0,200,151,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                ⬇ Yuklab olish
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PwaInstallPopup;
