import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, LogOut, Settings, Phone, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut, currentUser } = useStore();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const navItems = [
        { path: '/', icon: Home, label: 'Asosiy' },
        { path: '/my-bookings', icon: Calendar, label: 'Navbatlar' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <div className="fixed bottom-8 left-8 z-[1100] flex pointer-events-none">
                <nav className="w-[420px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex items-stretch shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="relative flex-1 flex items-center justify-center py-5 transition-all group"
                        >
                            {isActive(item.path) && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute inset-0 bg-primary"
                                />
                            )}
                            <div className="relative z-10 flex items-center gap-4">
                                <item.icon
                                    size={24}
                                    strokeWidth={isActive(item.path) ? 3 : 2}
                                    className={`transition-colors duration-300 ${isActive(item.path) ? "text-white" : "text-slate-500 group-hover:text-white"}`}
                                />
                                {isActive(item.path) && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[13px] font-black text-white uppercase tracking-[0.3em]"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </div>
                        </button>
                    ))}
                </nav>
            </div>

            <AnimatePresence>
                {showProfileMenu && (
                    <div className="fixed inset-0 z-[1200] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 backdrop-blur-md"
                            onClick={() => setShowProfileMenu(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="bg-white w-full max-w-lg rounded-t-[4rem] p-10 pb-16 relative z-10 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] border-t border-slate-50"
                        >
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />

                            <div className="flex items-center gap-5 mb-10 px-2">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-sm overflow-hidden border border-primary/10">
                                    <img
                                        src={currentUser?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                                        {currentUser?.user_metadata?.full_name || 'Mijoz'}
                                    </h3>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">{currentUser?.user_metadata?.phone || '+998'}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/my-bookings"
                                    onClick={() => setShowProfileMenu(false)}
                                    className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-primary transition-all shadow-sm">
                                            <Calendar size={20} />
                                        </div>
                                        <span className="text-sm font-black text-slate-700 uppercase italic tracking-tight">Buyurtmalar tarixi</span>
                                    </div>
                                    <div className="text-slate-300 group-hover:translate-x-1 transition-transform">→</div>
                                </Link>

                                <button
                                    onClick={() => {
                                        signOut();
                                        setShowProfileMenu(false);
                                    }}
                                    className="flex items-center justify-between p-6 rounded-[2rem] bg-red-50 border border-red-100 hover:bg-red-500 group transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-red-500 shadow-sm">
                                            <LogOut size={20} />
                                        </div>
                                        <span className="text-sm font-black text-red-500 group-hover:text-white uppercase italic tracking-tight">Chiqish</span>
                                    </div>
                                    <div className="text-red-200 group-hover:translate-x-1 group-hover:text-white transition-all">→</div>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowProfileMenu(false)}
                                className="w-full mt-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200 active:scale-95 transition-all"
                            >
                                Yopish
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
