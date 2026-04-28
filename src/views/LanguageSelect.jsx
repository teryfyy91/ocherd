import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const LanguageSelect = ({ onSelect }) => {
    const { t, i18n } = useTranslation();

    const languages = [
        { code: 'uz', label: 'Oʻzbekcha', flag: '🇺🇿' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
        { code: 'en', label: 'English', flag: '🇺🇸' }
    ];

    const handleSelect = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('i18nextLng', code);
        onSelect();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 w-full max-w-sm mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col gap-10"
            >
                <div className="text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 glass rounded-[2.5rem] flex items-center justify-center text-primary shadow-glow">
                        <Globe size={40} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-black text-text-main tracking-tight uppercase">Tilni tanlang</h2>
                        <p className="text-text-muted font-bold tracking-widest text-[10px] uppercase">Select Language • Выберите язык</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {languages.map((lang) => (
                        <motion.button
                            key={lang.code}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(lang.code)}
                            className="glass-card p-6 flex items-center justify-between bg-white/5 border-white/5 hover:border-primary/40 hover:bg-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-5">
                                <span className="text-3xl filter saturate-50 group-hover:saturate-100 transition-all">{lang.flag}</span>
                                <span className="text-xl font-black text-text-main group-hover:text-primary transition-colors">{lang.label}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
                                <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default LanguageSelect;
