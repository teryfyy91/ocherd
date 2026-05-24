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



    const activeShops = React.useMemo(() => (allShops || []).filter(s => s.status === 'Active' || !s.status), [allShops]);
    const topShops = React.useMemo(() => activeShops.slice(0, 5), [activeShops]);

    return (
        <div className="flex flex-col gap-0 pb-32 bg-white min-h-screen overflow-x-hidden select-none">
            {/* Elegant Header Section */}
            <div className="px-6 pt-12 pb-6 flex flex-col gap-8">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-auto flex items-center justify-center overflow-hidden">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Xush Kelibsiz</p>
                            <h1 className="text-2xl font-black text-slate-800 uppercase leading-none">
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

                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Salon qidirish..."
                        className="w-full h-16 px-8 pr-14 bg-slate-50 border-none rounded-[2rem] outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:shadow-2xl focus:shadow-slate-100 transition-all shadow-sm"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <main className="flex flex-col gap-10">


                {/* Featured Shop Story Style */}
                <section className="flex flex-col gap-6">
                    <div className="px-6 flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Mashhur Salonlar</h2>
                    </div>
                    <div className="flex flex-col gap-6 px-6">
                        {activeShops.map((shop, idx) => (
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
                                        <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none group-hover:translate-x-1 transition-transform">{shop.name}</h3>
                                        <div className="flex items-center gap-2 text-white/70">
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Tasdiqlangan Salon</span>
                                        </div>
                                    </div>
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
        </div >
    );
};

export default Landing;
