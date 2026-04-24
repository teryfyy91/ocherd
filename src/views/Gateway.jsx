import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Scissors } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const floatingAnimation = {
    y: ['-10px', '10px'],
    transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
    }
};

const floatingReverse = {
    y: ['10px', '-10px'],
    transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
    }
};

const Gateway = () => {
    const { t } = useTranslation();
    const { getAllShops, loadingShops, setShopInfo } = useStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = React.useState('');
    const shops = getAllShops();

    const filteredShops = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="-mt-8 min-h-screen w-full flex flex-col items-center py-20 relative overflow-hidden antigravity-bg" style={{ margin: '-2rem -1rem 0 -1rem' }}>
            {/* Deep Ambient effects */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-primary/10 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute top-1/4 left-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-secondary/10 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply"></div>

            <div className="z-10 w-full max-w-6xl px-6 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block bg-white/60 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white shadow-lg backdrop-blur-md"
                    >
                        Explore Salons
                    </motion.div>

                    <h1 className="text-5xl sm:text-7xl font-black text-dark mb-6 tracking-tight leading-tight">
                        {t('discoverServices').split(t('discoverHighlight'))[0]}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-secondary">{t('discoverHighlight')}</span>
                        {t('discoverServices').split(t('discoverHighlight'))[1]}
                    </h1>
                    <p className="text-xl text-gray-400 font-bold max-w-2xl mx-auto">
                        {t('discoverDesc')}
                    </p>
                </motion.div>

                {/* Modern Search Bar */}
                <div className="w-full max-w-2xl mb-16 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative glass rounded-[2.5rem] p-2 flex items-center bg-white/60 border border-white shadow-2xl backdrop-blur-xl transition-all duration-300 group-focus-within:shadow-primary/10">
                        <div className="p-4 text-primary bg-primary/5 rounded-full mr-2">
                            <Search size={24} />
                        </div>
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none flex-1 text-xl font-bold text-dark placeholder:text-gray-300 py-4"
                        />
                    </div>
                </div>

                {/* Shops List */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loadingShops ? (
                        <div className="col-span-full py-20 text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-6"
                            />
                            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">{t('loading')}</p>
                        </div>
                    ) : filteredShops.length > 0 ? (
                        filteredShops.map((shop, idx) => (
                            <motion.div
                                key={shop.id || shop.ownerId}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                whileHover={{ y: -10 }}
                                className="relative group p-[2px] rounded-[3rem] overflow-hidden shadow-xl shadow-black/5 cursor-pointer"
                                onClick={() => {
                                    const parsedServices = (shop.services || []).map(s => {
                                        if (typeof s === 'string' && s.startsWith('{')) {
                                            try { return JSON.parse(s); } catch (e) { return s; }
                                        }
                                        return s;
                                    });
                                    setShopInfo({ ...shop, services: parsedServices });
                                    navigate('/booking');
                                }}
                            >
                                {/* Animated border gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-sky-400/40 to-secondary/40 opacity-20 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Inner Card Content */}
                                <div className="relative bg-white/95 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/60 h-full flex flex-col z-10">
                                    <div className="bg-black p-4 rounded-[1.5rem] shadow-2xl shadow-black/40 mb-6 group-hover:rotate-12 transition-transform w-[5rem] h-[5rem] flex items-center justify-center overflow-hidden border border-gray-800 relative">
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain transform scale-110" />
                                    </div>

                                    <h3 className="text-2xl font-black text-dark mb-2 tracking-tight group-hover:text-primary transition-colors">{shop.name}</h3>

                                    <div className="flex items-center gap-2 text-gray-400 font-bold text-sm mb-8">
                                        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-primary/5 transition-colors">
                                            <MapPin size={16} className="group-hover:text-primary transition-colors" />
                                        </div>
                                        <span>{t('locationDefault')}</span>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 opacity-60">{t('workingHours')}</span>
                                            <span className="font-bold text-dark text-sm">{shop.workingHours?.start || '09:00'} - {shop.workingHours?.end || '18:00'}</span>
                                        </div>
                                        <div className="relative overflow-hidden group/btn bg-dark text-white px-7 py-3.5 rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-primary/20 hover:bg-black transition-all">
                                            <div className="absolute inset-0 bg-white/10 -skew-x-12 -translate-x-full group-hover/btn:animate-shine" />
                                            {t('bookNow')}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-24 h-24 bg-white/50 backdrop-blur-xl border border-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-primary shadow-xl">
                                <Search size={40} />
                            </div>
                            <h3 className="text-3xl font-black text-dark mb-4">{t('noBusinessesFound')}</h3>
                            <p className="text-gray-400 font-bold italic tracking-wide max-w-sm mx-auto">{t('searchHint')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Gateway;
