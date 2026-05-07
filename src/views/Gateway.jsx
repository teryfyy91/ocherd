import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Scissors, X, ChevronLeft, Bell, SlidersHorizontal, Star, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Gateway = () => {
    const { t } = useTranslation();
    const { allShops, loadingShops, setShopInfo } = useStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Barchasi');

    const categories = ['Barchasi', 'Sartaroshxona', 'Go\'zallik saloni', 'Grim', 'Masaj'];

    const shops = (allShops || []).filter(s => s.status === 'Active' || !s.status);

    const filteredShops = shops.filter(shop =>
        (shop.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-32 bg-white min-h-screen pt-8">
            <header className="flex items-center justify-between px-6 mb-4">
                <button onClick={() => navigate('/')} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800 shadow-sm"><ChevronLeft size={24} /></button>
                <h1 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Salonlar</h1>
                <button className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800 shadow-sm"><Bell size={20} /></button>
            </header>

            <div className="px-6 flex flex-col gap-6">
                <div className="relative flex items-center">
                    <Search className="absolute left-6 text-slate-300" size={20} />
                    <input
                        type="text"
                        placeholder="Salon qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-16 pl-16 pr-6 rounded-[2rem] bg-slate-50 border-none focus:bg-white focus:shadow-2xl focus:shadow-slate-200 transition-all text-sm font-bold text-slate-800 outline-none placeholder:text-slate-300"
                    />
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat
                                ? 'bg-primary text-white border-primary shadow-xl shadow-purple-100'
                                : 'bg-white text-slate-400 border-slate-100 shadow-sm'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-6 px-6">
                <div className="flex justify-between items-end px-1">
                    <h2 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">Eng yaxshi tanlov</h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredShops.length} ta topildi</span>
                </div>

                {loadingShops ? (
                    <div className="flex flex-col gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 w-full bg-slate-50 animate-pulse rounded-[3rem]" />)}
                    </div>
                ) : filteredShops.length > 0 ? (
                    <div className="flex flex-col gap-8">
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
                                className="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-50 group cursor-pointer"
                            >
                                <div className="relative h-60 overflow-hidden">
                                    <img
                                        src={shop.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1000&q=80"}
                                        alt={shop.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xl">
                                        <Heart size={22} />
                                    </div>
                                    <div className="absolute bottom-6 left-6 bg-white shadow-2xl px-4 py-2 rounded-2xl flex items-center gap-2">
                                        <Star size={14} fill="#fbbf24" className="text-[#fbbf24]" />
                                        <span className="text-sm font-black text-slate-800">4.9</span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">{shop.name}</h3>
                                            <div className="flex items-center gap-2 mt-2 text-slate-400">
                                                <MapPin size={12} className="text-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{shop.address || 'Toshkent, O\'zbekiston'}</span>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-black text-primary tracking-tighter">80k</span>
                                    </div>
                                    <button className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all">
                                        Band qilish <ChevronLeft size={16} className="rotate-180" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                            <Search size={40} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Natija yo'q</h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Boshqa kalit so'z bilan qidirib ko'ring</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gateway;
