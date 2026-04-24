import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const LanguageSelect = ({ onSelect }) => {
    const { t, i18n } = useTranslation();

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
        { code: 'uz', label: 'Oʻzbekcha', flag: '🇺🇿' }
    ];

    const handleSelect = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('i18nextLng', code);
        onSelect();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center antigravity-bg px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-12 rounded-[3rem] max-w-md w-full text-center relative z-10"
            >
                <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <span className="text-3xl">🌍</span>
                </div>

                <h2 className="text-3xl font-black text-dark mb-10 tracking-tight">{t('selectLanguage')}</h2>

                <div className="flex flex-col gap-4">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className="flex items-center gap-5 w-full bg-white/50 border border-white/60 p-5 rounded-2xl hover:border-primary hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all group active:scale-[0.98]"
                        >
                            <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform">{lang.flag}</span>
                            <span className="text-xl font-extrabold text-gray-700 group-hover:text-primary">{lang.label}</span>
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default LanguageSelect;
