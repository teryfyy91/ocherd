import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Scissors, X, ChevronLeft, Bell, SlidersHorizontal, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Gateway = () => {
    const { t } = useTranslation();
    const { allShops, loadingShops, setShopInfo } = useStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Service');

    const categories = ['All Service', 'Barber', 'Hair Salon', 'Makeup', 'Massage'];

    const shops = (allShops || []).filter(s => s.status === 'Active' || !s.status);

    const filteredShops = shops.filter(shop =>
        (shop.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 pb-32 -mt-6">
            {/* Purple Header */}
            <div className="bg-[#7C3AED] -mx-6 px-6 pt-10 pb-12 rounded-b-[2.5rem] relative shadow-2xl shadow-purple-500/20">
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <button
                        onClick={() => navigate('/')}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-white tracking-tight">Appointment</h1>
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform">
                        <Bell size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative z-10 translate-y-6">
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Salon, Specialist"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-11 pr-11 rounded-2xl bg-white shadow-xl focus:outline-none text-sm font-medium transition-all"
                        />
                        <div className="absolute right-3 w-8 h-8 rounded-lg bg-[#7C3AED]/5 flex items-center justify-center text-[#7C3AED]">
                            <SlidersHorizontal size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-2 pt-8 scrollbar-hide -mx-6 px-6">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-bold transition-all border ${activeCategory === cat
                                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-lg shadow-purple-500/20'
                                : 'bg-white text-slate-500 border-slate-100'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Shops List */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-lg font-bold text-slate-800">Top Rated Salons</h2>
                    <button className="text-[#7C3AED] text-xs font-bold">See All »</button>
                </div>

                {loadingShops ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 w-full skeleton rounded-[2.5rem]" />)}
                    </div>
                ) : filteredShops.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredShops.map((shop, idx) => (
                            <motion.div
                                key={shop.id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
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
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group cursor-pointer"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={shop.imageUrl || (idx % 2 === 0 ? "/barber_1.png" : "/barber_2.png")}
                                        alt={shop.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                                        <Heart size={18} />
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5">
                                        <Star size={12} fill="#7C3AED" className="text-[#7C3AED]" />
                                        <span className="text-xs font-black text-slate-800">4.8</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{shop.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium mb-4">{shop.address || 'Tower Plaza, Sheikh Zayed Road'}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-black text-[#7C3AED]">$200</span>
                                        <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                                            <ChevronLeft size={20} className="rotate-180" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Hech narsa topilmadi</h3>
                        <p className="text-slate-400 text-sm font-medium">Boshqa nom bilan qidirib ko'ring</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gateway;


