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
        if (!promptInstall) return;
        await promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') setSupportsPWA(false);
        setPromptInstall(null);
    };

    if (!supportsPWA) return null;

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 glass px-6 py-3 rounded-2xl text-primary font-black text-xs uppercase tracking-widest border-primary/20 hover:bg-primary hover:text-bg transition-all shadow-glow"
        >
            <Download size={16} />
            {t('installApp') || 'Ilovani o\'rnatish'}
        </button>
    );
};

export default InstallPWA;
