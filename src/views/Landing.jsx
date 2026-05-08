import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search,
    Bell,
    Heart,
    SlidersHorizontal,
    Scissors,
    User,
    Star,
    Navigation,
    Clock,
    ChevronRight,
    Sparkles,
    Wind,
    Palette,
    Zap,
    MapPin,
    ArrowRight,
    Filter
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../context/StoreContext';

const Landing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser, allShops, setShopInfo } = useStore();

    const services = [
        { id: 1, name: 'Soch', icon: <Scissors size={20} />, color: 'bg-purple-100 text-primary', delay: 0.1 },
        { id: 2, name: 'Soqol', icon: <Wind size={20} />, color: 'bg-blue-100 text-blue-600', delay: 0.2 },
        { id: 3, name: 'Stil', icon: <Zap size={20} />, color: 'bg-orange-100 text-orange-600', delay: 0.3 },
        { id: 4, name: 'Parvarish', icon: <Sparkles size={20} />, color: 'bg-pink-100 text-pink-600', delay: 0.4 },
    ];

    const topShops = allShops.slice(0, 5);

    return (
        <div className="flex flex-col gap-0 pb-32 bg-white min-h-screen overflow-x-hidden select-none">
            {/* Elegant Header Section */}
            <div className="px-6 pt-12 pb-6 flex flex-col gap-8">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center p-2.5 shadow-lg shadow-slate-200 overflow-hidden border border-slate-800">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Xush Kelibsiz</p>
                            <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                                Salom, {currentUser?.user_metadata?.full_name?.split(' ')[0] || 'Mijoz'}!
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 relative active:scale-95 transition-all">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white" />
                        </button>
                    </div>
                </header>

                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                        type="text"
                        placeholder="Salon qidirish..."
                        className="w-full h-16 pl-16 pr-6 bg-slate-50 border-none rounded-[2rem] outline-none text-sm font-black text-slate-800 placeholder:text-slate-300 focus:bg-white focus:shadow-2xl focus:shadow-slate-100 transition-all"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <main className="flex flex-col gap-10">
                {/* Visual Promo Section */}
                <section className="px-6 mt-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-56 rounded-[3rem] bg-slate-900 relative overflow-hidden shadow-2xl group cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 z-20 p-8 flex flex-col justify-center gap-4">
                            <span className="bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-[0.5em] px-4 py-1.5 rounded-full w-fit">Yangi Taklif</span>
                            <h2 className="text-3xl font-black text-white leading-none uppercase italic tracking-tighter max-w-[200px]">
                                Soch Turmagi Endi <span className="text-white bg-slate-900 px-2">-30%</span>
                            </h2>
                            <button className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest mt-2 group">
                                Batafsil <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Categories with Horizontal Scroll and Stagger */}
                <section className="flex flex-col gap-6 px-1">
                    <div className="px-5 flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Xizmatlar</h2>
                        <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">Hammasi</button>
                    </div>
                    <div className="flex gap-6 overflow-x-auto px-5 pb-4 scrollbar-hide">
                        {services.map((s) => (
                            <motion.button
                                key={s.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: s.delay }}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-4 shrink-0"
                            >
                                <div className={`${s.color} w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-slate-100 border border-white transition-all`}>
                                    {s.icon}
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{s.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Featured Shop Story Style */}
                <section className="flex flex-col gap-6">
                    <div className="px-6 flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Mashhur Salonlar</h2>
                        <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80" onClick={() => navigate('/discovery')}>Xaritada</button>
                    </div>
                    <div className="flex flex-col gap-6 px-6">
                        {allShops.map((shop, idx) => (
                            <motion.div
                                key={shop.id || idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => {
                                    setShopInfo(shop);
                                    navigate('/booking');
                                }}
                                className="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-100 border border-slate-50 group cursor-pointer active:scale-[0.98] transition-all"
                            >
                                <div className="h-64 relative overflow-hidden">
                                    <img
                                        src={shop.imageUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80"}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                    <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                                            <Star size={14} fill="#FFD700" className="text-[#FFD700]" />
                                            <span className="text-white text-xs font-black">4.9 (1.2k)</span>
                                        </div>
                                        <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all">
                                            <Heart size={20} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1">
                                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none group-hover:translate-x-1 transition-transform">{shop.name}</h3>
                                        <div className="flex items-center gap-2 text-white/70">
                                            <MapPin size={14} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{shop.address || 'Toshkent, Chilonzor'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Narxlaridan</p>
                                        <span className="text-2xl font-black text-primary tracking-tighter">80,000 so'm</span>
                                    </div>
                                    <button className="h-14 bg-slate-900 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all">
                                        Band qilish <ArrowRight size={18} className="text-primary" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default Landing;
