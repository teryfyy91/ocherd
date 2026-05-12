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

                            {showIosInstruction ? (
                                <div className="flex flex-col gap-5 py-2 mt-2">
                                    <h3 className="text-white font-bold text-lg leading-tight text-center mb-2 italic tracking-tight">
                                        iPhone'da o'rnatish
                                    </h3>

                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                                            <Share className="text-primary" size={20} />
                                        </div>
                                        <p className="text-slate-300 text-[13px] font-medium leading-snug">
                                            Pastdagi menyudan <strong className="text-white font-bold italic">Ulashish</strong> tugmasini bosing.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                                            <PlusSquare className="text-primary" size={20} />
                                        </div>
                                        <p className="text-slate-300 text-[13px] font-medium leading-snug">
                                            Menyudan <strong className="text-white font-bold italic">Asosiy ekranga qo'shish</strong> ni tanlang.
                                        </p>
                                    </div>

                                    <div className="w-full flex flex-col items-center mt-3 animate-bounce">
                                        <span className="text-primary/70 text-[9px] uppercase font-bold tracking-[0.3em] mb-2">Pastga bosing</span>
                                        <div className="w-1 h-10 rounded-full bg-gradient-to-b from-primary to-transparent"></div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start gap-5">
                                        {/* Icon with Glow */}
                                        <div className="relative flex-shrink-0">
                                            <div className="absolute inset-0 bg-primary/40 blur-xl animate-pulse rounded-full" />
                                            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center border border-white/20 shadow-lg">
                                                {isDownloading ? (
                                                    <Loader2 className="text-white animate-spin" size={28} />
                                                ) : (
                                                    <Download className="text-white animate-float-fast" size={28} />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 pt-1">
                                            <h3 className="text-white font-bold text-lg leading-tight mb-1.5 tracking-tight italic">
                                                Ilovani O'rnatish
                                            </h3>
                                            <p className="text-slate-400 text-[13px] leading-relaxed font-medium">
                                                Tezroq va qulayroq foydalanish uchun asosiy ekranga qo'shib oling.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={handleInstall}
                                        disabled={isDownloading}
                                        className="relative w-full group/btn h-14 flex items-center justify-center disabled:opacity-50"
                                    >
                                        <div className="absolute inset-0 bg-primary rounded-2xl transition-all duration-300 group-hover/btn:scale-[1.02] group-hover/btn:shadow-[0_0_30px_rgba(124,58,237,0.4)]" />
                                        <div className="relative flex items-center gap-2 text-white font-bold text-[13px] uppercase tracking-widest">
                                            {isDownloading ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={18} />
                                                    Yuklanmoqda...
                                                </>
                                            ) : (
                                                <>
                                                    <Download size={18} className="group-hover/btn:translate-y-1 transition-transform" />
                                                    O'rnatish
                                                </>
                                            )}
                                        </div>
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
