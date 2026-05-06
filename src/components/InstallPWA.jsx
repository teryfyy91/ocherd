import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const InstallPWA = () => {
    const [promptInstall, setPromptInstall] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Agar allaqachon standalone rejimda ishlayotgan bo'lsa (o'rnatilgan)
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            setIsInstalled(true);
            return;
        }

        const handler = e => {
            e.preventDefault();
            setPromptInstall(e);
        };

        const installedHandler = () => {
            setIsInstalled(true);
            setPromptInstall(null);
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', installedHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, []);

    const onClick = async evt => {
        evt.preventDefault();
        if (!promptInstall) return;
        await promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
            setIsInstalled(true);
        }
        setPromptInstall(null);
    };

    // Faqat prompt mavjud bo'lganda va hali o'rnatilmagan bo'lganda ko'rsat
    if (!promptInstall || isInstalled) return null;

    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center w-12 h-12 glass rounded-2xl text-primary border border-primary/30 hover:bg-primary hover:text-bg transition-all duration-300 shadow-lg active:scale-95"
            title="Ilovani telefoningizga o'rnatish"
            aria-label="Ilovani o'rnatish"
        >
            <Download size={20} strokeWidth={2.5} />
        </button>
    );
};

export default InstallPWA;
