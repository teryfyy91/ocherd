import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useStore();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/discovery', icon: Search, label: 'Search' },
        { path: '/my-bookings', icon: ShoppingBag, label: 'Shop' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 pb-6 pt-3 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive(item.path)
                            ? 'text-[#7C3AED]'
                            : 'text-slate-400'
                            }`}
                    >
                        <div className="relative">
                            <item.icon
                                size={22}
                                strokeWidth={isActive(item.path) ? 2.5 : 2}
                                fill={isActive(item.path) ? "currentColor" : "none"}
                                className={isActive(item.path) ? "opacity-100" : "opacity-70"}
                            />
                            {isActive(item.path) && (
                                <motion.div
                                    layoutId="nav-dot"
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#7C3AED] rounded-full"
                                />
                            )}
                        </div>
                        <span className={`text-[9px] font-bold tracking-tight ${isActive(item.path) ? 'opacity-100' : 'opacity-60'}`}>
                            {item.label}
                        </span>
                    </button>
                ))}

                <button
                    onClick={() => setShowProfileMenu(true)}
                    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${showProfileMenu ? 'text-[#7C3AED]' : 'text-slate-400'}`}
                >
                    <User
                        size={22}
                        strokeWidth={showProfileMenu ? 2.5 : 2}
                        fill={showProfileMenu ? "currentColor" : "none"}
                        className={showProfileMenu ? "opacity-100" : "opacity-70"}
                    />
                    <span className={`text-[9px] font-bold tracking-tight ${showProfileMenu ? 'opacity-100' : 'opacity-60'}`}>
                        Profile
                    </span>
                </button>
            </nav>

            <AnimatePresence>
                {showProfileMenu && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                            onClick={() => setShowProfileMenu(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-lg rounded-t-[2.5rem] p-8 pb-12 relative z-10 shadow-2xl"
                        >
                            <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto mb-6" />
                            <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Settings</h2>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        signOut();
                                        setShowProfileMenu(false);
                                    }}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-all border border-red-100"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white border border-red-200 flex items-center justify-center shadow-sm">
                                        <LogOut size={20} />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-base">Sign Out</span>
                                        <span className="text-red-400/80 text-[10px] font-medium tracking-tight">Log out of your account</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setShowProfileMenu(false)}
                                    className="w-full py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;

