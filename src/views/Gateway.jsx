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
        <div className="-mt-8 min-h-screen w-full flex flex-col items-center py-20 relative overflow-hidden bg-gradient-to-br from-[#E0F7FA]/50 to-white rounded-3xl" style={{ margin: '-2rem -1rem 0 -1rem' }}>
            {/* Background elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-cyan-400/10 rounded-full blur-3xl"
                        style={{
                            width: Math.random() * 300 + 100,
                            height: Math.random() * 300 + 100,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            x: [0, 50, 0],
                            y: [0, 30, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                        }}
                    />
                ))}
            </div>

            <div className="z-10 w-full max-w-6xl px-6 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl sm:text-6xl font-black text-dark mb-6 tracking-tight">
                        {t('discoverServices').split(t('discoverHighlight'))[0]}
                        <span className="text-primary">{t('discoverHighlight')}</span>
                        {t('discoverServices').split(t('discoverHighlight'))[1]}
                    </h1>
                    <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
                        {t('discoverDesc')}
                    </p>
                </motion.div>

                {/* Search Bar */}
                <div className="w-full max-w-2xl mb-16 relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative glass rounded-[2.5rem] p-2 flex items-center bg-white shadow-2xl shadow-primary/5">
                        <div className="p-4 text-primary">
                            <Search size={28} />
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
                                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                            />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('loading')}</p>
                        </div>
                    ) : filteredShops.length > 0 ? (
                        filteredShops.map((shop, idx) => (
                            <motion.div
                                key={shop.id || shop.ownerId}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="glass p-8 rounded-[3rem] border border-white/60 bg-white shadow-xl hover:shadow-2xl hover:shadow-primary/5 transition-all group cursor-pointer"
                                onClick={() => {
                                    // Parse services correctly (handle JSON strings in array)
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
                                <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:shadow-lg transition-all overflow-hidden p-1">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <h3 className="text-2xl font-black text-dark mb-2 tracking-tight">{shop.name}</h3>
                                <div className="flex items-center gap-3 text-gray-400 font-bold mb-6">
                                    <MapPin size={18} />
                                    <span>{t('locationDefault')}</span>
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{t('workingHours')}</span>
                                        <span className="font-bold text-dark">{shop.workingHours?.start || '09:00'} - {shop.workingHours?.end || '18:00'}</span>
                                    </div>
                                    <div className="bg-dark text-white px-6 py-3 rounded-2xl font-black text-sm group-hover:bg-primary transition-colors">
                                        {t('bookNow')}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                                <Search size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-400">{t('noBusinessesFound')}</h3>
                            <p className="text-gray-400 mt-2 font-medium italic">{t('searchHint')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Gateway;
