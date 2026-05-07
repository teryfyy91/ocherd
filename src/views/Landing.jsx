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
    MapPin
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../context/StoreContext';

const Landing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser, allShops } = useStore();

    const services = [
        { id: 1, name: 'Soch', icon: <Scissors size={20} />, color: 'bg-purple-50 text-primary' },
        { id: 2, name: 'Soqol', icon: <Wind size={20} />, color: 'bg-blue-50 text-blue-500' },
        { id: 3, name: 'Stil', icon: <Zap size={20} />, color: 'bg-pink-50 text-pink-500' },
        { id: 4, name: 'Bo\'yash', icon: <Palette size={20} />, color: 'bg-orange-50 text-orange-500' },
        { id: 5, name: 'Grim', icon: <Sparkles size={20} />, color: 'bg-emerald-50 text-emerald-500' },
    ];

    // Get real shops or fallback to mocks if needed
    const displayedSalons = allShops.length > 0 ? allShops.slice(0, 3) : [
        {
            id: 1,
            name: 'GlowUp Studio',
            address: 'Toshkent, Chilonzor',
            price: '150k',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop'
        },
        {
            id: 2,
            name: 'Classic Cuts',
            address: 'Yunusobod, 4-kvartal',
            price: '100k',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop'
        }
    ];

    const handleSalonSelect = (salon) => {
        // Find existing shop or use mock
        navigate('/booking');
    };

    return (
        <div className="flex flex-col gap-8 pb-32 bg-white min-h-screen overflow-x-hidden">
            <div className="bg-primary px-6 pt-16 pb-20 rounded-b-[4rem] relative shadow-2xl shadow-purple-500/20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

                <header className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/30 p-0.5 bg-white/20 shadow-xl">
                            <img
                                src={currentUser?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                alt="avatar"
                                className="w-full h-full rounded-[0.8rem] object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Xush kelibsiz,</p>
                            <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                                {currentUser?.user_metadata?.full_name?.split(' ')[0] || 'Mijoz'}
                            </h4>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform">
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                <div className="relative z-10 translate-y-8">
                    <div className="relative flex items-center">
                        <Search className="absolute left-5 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Salon yoki mutaxassis..."
                            className="w-full h-14 pl-14 pr-11 rounded-[1.5rem] bg-white shadow-2xl focus:outline-none text-sm font-bold text-slate-800 transition-all placeholder:text-slate-300"
                        />
                        <div className="absolute right-3 w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group active:scale-95 transition-all">
                            <SlidersHorizontal size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex flex-col gap-10 px-6 mt-6">
                <section className="flex flex-col gap-4">
                    <div className="flex justify-between items-end px-1">
                        <h2 className="text-xl font-black text-slate-800 uppercase italic leading-none">Maxsus takliflar</h2>
                        <button className="text-primary text-[10px] font-black uppercase tracking-widest border-b-2 border-primary/20 pb-0.5">Barchasi</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            className="min-w-[85%] h-44 rounded-[3rem] bg-slate-900 p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute right-[-5%] top-[-10%] w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                            <div className="relative z-10 flex flex-col gap-2 max-w-[70%]">
                                <span className="bg-primary/20 text-primary text-[8px] font-black uppercase tracking-[0.3em] py-1.5 px-4 rounded-full w-fit">Chegirma</span>
                                <h3 className="text-2xl font-black text-white leading-tight uppercase italic tracking-tighter">
                                    Ilk tashrif uchun 40% <span className="text-primary">bonus.</span>
                                </h3>
                                <button className="mt-2 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-full w-fit shadow-xl active:scale-95 transition-all">Band qilish</button>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1599351473299-d8395e693175?w=400&auto=format&fit=crop"
                                alt="promo"
                                className="absolute bottom-0 right-[-10%] h-full w-[50%] object-cover opacity-60 mask-fade-left"
                            />
                        </motion.div>
                    </div>
                </section>

                <section className="flex flex-col gap-4">
                    <div className="flex justify-between items-end px-1">
                        <h2 className="text-xl font-black text-slate-800 uppercase italic leading-none">Xizmatlar</h2>
                    </div>
                    <div className="flex justify-between px-1">
                        {services.map((s) => (
                            <motion.button
                                key={s.id}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center gap-3"
                                onClick={() => navigate('/discovery')}
                            >
                                <div className={`${s.color} w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-slate-100 border border-slate-50`}>
                                    {s.icon}
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </section>

                <section className="flex flex-col gap-5 pb-8">
                    <div className="flex justify-between items-end px-1">
                        <h2 className="text-xl font-black text-slate-800 uppercase italic leading-none">Top salonlar</h2>
                        <button className="text-primary text-[10px] font-black uppercase tracking-widest">Ko'proq</button>
                    </div>
                    <div className="flex flex-col gap-4 px-1">
                        {displayedSalons.map((salon) => (
                            <motion.div
                                key={salon.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setShopInfo(salon);
                                    navigate('/booking');
                                }}
                                className="bg-white rounded-[2.5rem] p-3 flex gap-5 shadow-xl shadow-slate-100 border border-slate-50 relative group transition-all"
                            >
                                <div className="w-28 h-28 rounded-[2rem] overflow-hidden relative shrink-0">
                                    <img src={salon.image || salon.imageUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80'} alt={salon.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-primary text-[10px] font-black px-2 py-1 rounded-xl flex items-center gap-1 shadow-xl">
                                        <Star size={10} fill="currentColor" /> {salon.rating || '4.9'}
                                    </div>
                                </div>
                                <div className="flex-1 py-2 flex flex-col justify-between">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter leading-none">{salon.name}</h4>
                                        <div className="flex items-center gap-1 mt-1 text-slate-400">
                                            <MapPin size={10} />
                                            <p className="text-[9px] font-bold uppercase tracking-widest line-clamp-1">{salon.address || 'Toshkent shahri'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-primary font-black text-lg tracking-tighter">{salon.price || '80k'}</span>
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                            <Navigation size={16} fill="currentColor" />
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
                .mask-fade-left {
                    mask-image: linear-gradient(to right, transparent 0%, black 40%);
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 40%);
                }
            `}} />
        </div>
    );
};

export default Landing;
