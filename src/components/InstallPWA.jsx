import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InstallPWA = () => {
    const { t } = useTranslation();
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);

    useEffect(() => {
        const handler = e => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };
        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const onClick = async evt => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        await promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
            setSupportsPWA(false);
        }
        setPromptInstall(null);
    };

    if (!supportsPWA) {
        return null;
    }

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold px-4 py-2 rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 border border-emerald-400/30"
        >
            <Download size={18} className="animate-bounce" />
            <span className="hidden sm:inline">Install App</span>
        </button>
    );
};

export default InstallPWA;
