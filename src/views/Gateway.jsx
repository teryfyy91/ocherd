import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Scissors, X } from 'lucide-react';
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
        (shop.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-32">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 mt-8"
            >
                <h1 className="text-4xl font-black text-text-main tracking-tight">
                    Salonlar
                </h1>
                <p className="text-text-muted font-medium">O'zingizga ma'qulini kashf eting</p>
            </motion.div>

            {/* Search Bar */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Salon nomini qidiring..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full glass-card bg-white/5 border-white/5 pl-14 pr-14 py-5 rounded-2xl outline-none text-text-main font-bold placeholder:text-text-muted focus:bg-white/10 focus:border-primary/20 transition-all"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-5 flex items-center text-text-muted hover:text-primary transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Shops Grid */}
            <div className="flex flex-col gap-6">
                {loadingShops ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-44 w-full skeleton" />)}
                    </div>
                ) : filteredShops.length > 0 ? (
                    filteredShops.map((shop, idx) => (
                        <motion.div
                            key={shop.id || idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -4 }}
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
                            className="glass-card overflow-hidden group cursor-pointer"
                        >
                            <div className="flex">
                                <div className="w-1/3 h-44 overflow-hidden">
                                    <img
                                        src={idx % 2 === 0 ? "/barber_1.png" : "/barber_2.png"}
                                        alt={shop.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <div className="w-2/3 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors">{shop.name}</h3>
                                            <div className="flex items-center gap-1 text-amber-400 font-black">
                                                <span className="text-sm">4.9</span>
                                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-text-muted text-xs font-bold uppercase tracking-wider mb-4">
                                            <MapPin size={14} />
                                            <span>Tashkent, Uzbekistan</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-text-muted font-black uppercase mb-0.5">Ish vaqti</span>
                                            <span className="text-xs font-bold text-text-main">{shop.workingHours?.start || '09:00'} - {shop.workingHours?.end || '18:00'}</span>
                                        </div>
                                        <div className="btn-primary !p-3 !rounded-xl !text-xs !bg-white/10 !text-white group-hover:!bg-primary group-hover:!text-bg transition-all">
                                            Band qilish
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                        <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-text-muted opacity-30">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-text-main">Hech narsa topilmadi</h3>
                        <p className="text-text-muted text-sm font-medium">Boshqa nom bilan qidirib ko'ring</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gateway;

