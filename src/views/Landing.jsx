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
    const { currentUser } = useStore();

    const services = [
        { id: 1, name: 'Haircut', icon: <Scissors size={20} />, color: 'bg-[#F5F3FF] text-[#7C3AED]' },
        { id: 2, name: 'Shaving', icon: <Wind size={20} />, color: 'bg-[#F0F9FF] text-[#0ea5e9]' },
        { id: 3, name: 'Styling', icon: <Zap size={20} />, color: 'bg-[#FDF2F8] text-[#db2777]' },
        { id: 4, name: 'Coloring', icon: <Palette size={20} />, color: 'bg-[#FFF7ED] text-[#ea580c]' },
        { id: 5, name: 'Make Up', icon: <Sparkles size={20} />, color: 'bg-[#F0FDF4] text-[#16a34a]' },
    ];

    const topSalons = [
        {
            id: 1,
            name: 'GlowUp Studio',
            address: 'Tower Plaza, Sheikh Zayed Road',
            price: '$200',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop'
        },
        {
            id: 2,
            name: 'Classic Cuts',
            address: 'Downtown, Dubai Mall',
            price: '$150',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop'
        }
    ];

    return (
        <div className="flex flex-col gap-6 pb-32 -mt-6">
            {/* Main Purple Header Section */}
            <div className="bg-[#7C3AED] -mx-6 px-6 pt-10 pb-12 rounded-b-[2.5rem] relative shadow-2xl shadow-purple-500/20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

                {/* User Info & Actions */}
                <header className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/30 p-0.5 bg-white/20">
                            <img
                                src={currentUser?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                alt="avatar"
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-white/70 text-[10px] font-medium tracking-wide">Hello Jobby,</p>
                            <h4 className="text-base font-bold text-white">
                                Good Morning
                            </h4>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform">
                            <Heart size={18} />
                        </button>
                        <div className="relative">
                            <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform">
                                <Bell size={18} />
                            </button>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-[#7C3AED] rounded-full"></span>
                        </div>
                    </div>
                </header>

                {/* Search Bar inside header */}
                <div className="relative z-10 translate-y-6">
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Salon, Specialist"
                            className="w-full h-12 pl-11 pr-11 rounded-2xl bg-white shadow-xl focus:outline-none text-sm font-medium transition-all"
                        />
                        <div className="absolute right-3 w-8 h-8 rounded-lg bg-[#7C3AED]/5 flex items-center justify-center text-[#7C3AED]">
                            <SlidersHorizontal size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Special Offers Sections - Starts a bit lower due to search bar translate */}
            <section className="flex flex-col gap-3 mt-8">
                <div className="flex justify-between items-end px-1">
                    <h2 className="text-lg font-bold text-text-main">Special Offers</h2>
                    <Link to="/discovery" className="text-[#7C3AED] text-xs font-bold flex items-center gap-1 group">
                        See All <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="min-w-[88%] h-40 rounded-[2rem] bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] p-5 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-purple-500/10"
                    >
                        <div className="absolute right-[-5%] top-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <div className="relative z-10 flex flex-col gap-1.5 max-w-[65%]">
                            <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-bold py-0.5 px-3 rounded-full w-fit">
                                Just For You
                            </span>
                            <h3 className="text-xl font-black text-white leading-tight">
                                Get Special Discount Up to 40%
                            </h3>
                            <button className="mt-1 bg-white text-[#7C3AED] text-[10px] font-black py-2 px-5 rounded-full w-fit shadow-md active:scale-95 transition-all">
                                Book Now
                            </button>
                        </div>
                        <img
                            src="https://images.unsplash.com/photo-1599351473299-d8395e693175?w=400&auto=format&fit=crop"
                            alt="promo"
                            className="absolute bottom-0 right-0 h-full w-[40%] object-cover object-left-top mask-fade-left opacity-90"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Services */}
            <section className="flex flex-col gap-3 mt-2">
                <div className="flex justify-between items-end px-1">
                    <h2 className="text-lg font-bold text-text-main">Services</h2>
                    <Link to="/discovery" className="text-[#7C3AED] text-xs font-bold flex items-center gap-1 group">
                        See All <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="flex justify-between px-1">
                    {services.map((s) => (
                        <motion.button
                            key={s.id}
                            whileTap={{ scale: 0.9 }}
                            className="flex flex-col items-center gap-2"
                            onClick={() => navigate('/discovery')}
                        >
                            <div className={`${s.color} w-13 h-13 rounded-full flex items-center justify-center shadow-sm border border-black/5`}>
                                {s.icon}
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{s.name}</span>
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* Top Rated Salons */}
            <section className="flex flex-col gap-3 mt-2 pb-4">
                <div className="flex justify-between items-end px-1">
                    <h2 className="text-lg font-bold text-text-main">Top Rated Salons</h2>
                    <Link to="/discovery" className="text-[#7C3AED] text-xs font-bold flex items-center gap-1 group">
                        See All <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="flex flex-col gap-3 px-1">
                    {topSalons.map((salon) => (
                        <motion.div
                            key={salon.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/discovery')}
                            className="bg-white rounded-[2rem] p-2.5 flex gap-4 shadow-sm border border-slate-100/50 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="w-24 h-24 rounded-2xl overflow-hidden relative shrink-0">
                                <img src={salon.image} alt={salon.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[#7C3AED] text-[9px] font-black px-1.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                                    <Star size={9} fill="#7C3AED" className="text-[#7C3AED]" /> {salon.rating}
                                </div>
                            </div>
                            <div className="flex-1 py-1 flex flex-col justify-between pr-2">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{salon.name}</h4>
                                    <div className="flex items-center gap-1 mt-1">
                                        <MapPin size={10} className="text-slate-400" />
                                        <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{salon.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-[#7C3AED] font-black text-sm">{salon.price}</span>
                                    <div className="w-7 h-7 rounded-full bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white transition-all">
                                        <Navigation size={12} fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
                .mask-fade-left {
                    mask-image: linear-gradient(to right, transparent 0%, black 30%);
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 30%);
                }
            `}} />
        </div>
    );
};

export default Landing;


