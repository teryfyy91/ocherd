import React, { useState, useEffect } from 'react';
import { Download, X, Loader2, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PwaInstallPopup = () => {
    const [promptInstall, setPromptInstall] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showIosInstruction, setShowIosInstruction] = useState(false);

    const deferredPromptRef = React.useRef(null);

    useEffect(() => {
        // Agar allaqachon standalone rejimda ishlayotgan bo'lsa (o'rnatilgan)
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            setIsInstalled(true);
            return;
        }

        // Sessiya davomida yopilganligini tekshirish
        const isDismissed = sessionStorage.getItem('pwa_popup_dismissed');
        if (isDismissed) return;

        const handler = e => {
            e.preventDefault();
            deferredPromptRef.current = e;
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
                const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
                if (deferredPromptRef.current || isIos) {
                    setIsVisible(true);
                }
            }
        }, 2500);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
            clearTimeout(timer);
        };
    }, [isInstalled]);

    const [isDownloading, setIsDownloading] = useState(false);

    const handleInstall = async () => {
        setIsDownloading(true);

        // Aylanib turish (skachat bo'lishini simulyatsiya qilish)
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (!promptInstall) {
            setIsDownloading(false);
            setShowIosInstruction(true);
            return;
        }

        setIsDownloading(false);
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

                            {showIosInstruction ? (
                                <div className="flex flex-col gap-4 py-2 mt-2 animate-in fade-in zoom-in duration-300">
                                    <h3 className="text-white font-bold text-sm leading-tight text-center mb-2">
                                        iPhone'da o'rnatish yo'riqnomasi
                                    </h3>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/20 flex items-center justify-center">
                                            <Share className="text-primary" size={20} />
                                        </div>
                                        <p className="text-white/80 text-xs font-medium leading-snug">
                                            Pastdagi menyudan <strong className="text-white">Ulashish (Share)</strong> tugmasini bosing.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/20 flex items-center justify-center">
                                            <PlusSquare className="text-primary" size={20} />
                                        </div>
                                        <p className="text-white/80 text-xs font-medium leading-snug">
                                            Menyudan <strong className="text-white">Asosiy ekranga qo'shish (Add to Home Screen)</strong> ni tanlang.
                                        </p>
                                    </div>

                                    <div className="w-full flex flex-col items-center mt-3 animate-bounce">
                                        <span className="text-primary/70 text-[10px] uppercase font-bold tracking-widest mb-1">Pastga bosing</span>
                                        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-primary/50 to-transparent"></div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-4">
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
                                        disabled={isDownloading}
                                        className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-[#00DAC2] text-[#0B0F14] shadow-[0_0_20px_rgba(0,200,151,0.3)] hover:shadow-[0_0_30px_rgba(0,200,151,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:active:scale-100"
                                    >
                                        {isDownloading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Yuklanmoqda...
                                            </>
                                        ) : (
                                            "⬇ Yuklab olish"
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PwaInstallPopup;
