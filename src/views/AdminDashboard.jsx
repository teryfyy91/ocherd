import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Clock, Scissors,
    Settings, LogOut, Bell, Search,
    Plus, CheckCircle2, X, MoreVertical,
    TrendingUp, ArrowUpRight, ArrowDownRight,
    Search as SearchIcon, Filter, Calendar,
    UserPlus, ChevronRight, User, Phone,
    Building2, Star, MessageSquare
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabase';

// Mock Data for Charts
const chartData = [
    { name: 'Mon', customers: 12, revenue: 450000 },
    { name: 'Tue', customers: 18, revenue: 620000 },
    { name: 'Wed', customers: 15, revenue: 510000 },
    { name: 'Thu', customers: 22, revenue: 780000 },
    { name: 'Fri', customers: 30, revenue: 950000 },
    { name: 'Sat', customers: 45, revenue: 1400000 },
    { name: 'Sun', customers: 38, revenue: 1100000 },
];

const AdminDashboard = () => {
    const { t } = useTranslation();
    const {
        shopInfo, queue, updateBookingStatus,
        deleteBooking, reviews, currentUser, allShops: contextShops,
        deleteShop, approveShop, refreshShops, signOut
    } = useStore();

    const userPhone = localStorage.getItem('currentUserPhone');
    const isSuperAdmin = userPhone === '+998505521107';

    const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'gateway' : 'overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const allShops = contextShops;
    const [stats, setStats] = useState({ totalUsers: 0, activeNow: 0, recentActions: [] });
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (isSuperAdmin) {
            const fetchAllData = async () => {
                setLoading(true);
                // Refresh shops in context
                await refreshShops();

                // Fetch real users stats from bookings & shops
                try {
                    const { data: bookings } = await supabase
                        .from('bookings')
                        .select('user_phone, user_name, created_at, shop_name')
                        .order('created_at', { ascending: false });

                    if (bookings) {
                        const uniquePhones = new Set();
                        allShops.forEach(s => uniquePhones.add(s.ownerId)); // Add owners
                        bookings.forEach(b => uniquePhones.add(b.user_phone)); // Add customers

                        setStats({
                            totalUsers: uniquePhones.size,
                            activeNow: Math.floor(uniquePhones.size * 0.4), // Approximation
                            recentActions: bookings.slice(0, 5).map(b => ({
                                name: b.user_name || 'Mijoz',
                                action: `${b.shop_name} uchun navbat oldi`,
                                time: new Date(b.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
                            }))
                        });
                    }

                    // Use pending shops as notifications
                    const pending = allShops.filter(s => s.status === 'Pending');
                    setNotifications(pending.map(s => ({
                        id: s.id,
                        message: `Yangi salon: ${s.name}. Sanga sorov keldi, qabul qilasanmi?`,
                        type: 'registration',
                        created_at: s.createdAt,
                        status: 'unread'
                    })));

                } catch (err) {
                    console.error('Error fetching stats:', err);
                }
                setLoading(false);
            };
            fetchAllData();

            // Realtime subscription for shops to detect new pending ones
            const channel = supabase
                .channel('admin-shops-sync')
                .on('postgres_changes', { event: 'INSERT', table: 'shops' }, payload => {
                    if (payload.new.status === 'Pending') {
                        const newNotify = {
                            id: payload.new.id,
                            message: `Yangi salon: ${payload.new.name}. Sanga sorov keldi, qabul qilasanmi?`,
                            type: 'registration',
                            created_at: payload.new.created_at,
                            status: 'unread'
                        };
                        setNotifications(prev => [newNotify, ...prev]);
                        alert(`YANGI SO'ROVNOMA: ${payload.new.name}`);
                        refreshShops();
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [isSuperAdmin]);

    const NAV_ITEMS = isSuperAdmin ? [
        { id: 'gateway', label: 'Asosiy', icon: LayoutDashboard },
        { id: 'salons', label: 'Salonlar', icon: Building2 },
        { id: 'super-users', label: 'Foydalanuvchilar', icon: Users },
        { id: 'settings', label: 'Tizim', icon: Settings },
    ] : [
        { id: 'overview', label: 'Xulosa', icon: LayoutDashboard },
        { id: 'queue', label: 'Navbat', icon: Clock },
        { id: 'customers', label: 'Mijozlar', icon: Users },
        { id: 'staff', label: 'Xodimlar', icon: Scissors },
        { id: 'settings', label: 'Sozlamalar', icon: Settings },
    ];

    const handleDeleteShop = async (id) => {
        if (window.confirm("Rostdan ham ushbu salonni o'chirishni xohlaysizmi? O'chirilgan ma'lumotlarni qaytarib bo'lmaydi.")) {
            await deleteShop(id);
        }
    };

    const SuperGatewayTab = () => (
        <div className="flex flex-col gap-12 py-10">
            <div className="text-center relative py-8 md:py-16 overflow-visible">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                <motion.h2
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-5xl md:text-7xl font-black mb-6 uppercase italic tracking-tighter relative leading-[0.9]"
                >
                    <span className="text-gradient">Xush Kelibsiz,</span> <br />
                    <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">Admin</span>
                </motion.h2>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-4"
                >
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/10" />
                    <p className="text-text-muted font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs">
                        Platformani boshqarish markazi
                    </p>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/10" />
                </motion.div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full px-4">
                <motion.button
                    whileHover={{ y: -10, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('salons')}
                    className="glass-card p-16 flex flex-col items-center justify-center text-center group relative overflow-hidden border border-primary/10 min-h-[400px]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-28 h-28 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mb-10 shadow-[0_0_50px_rgba(0,200,151,0.2)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                        <Building2 size={56} />
                    </div>
                    <h3 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tighter">Salonlar</h3>
                    <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-[10px] max-w-[200px] leading-relaxed">Platformadagi barcha salonlarni boshqarish va nazorat qilish</p>
                    <div className="mt-10 flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        O'tish <ChevronRight size={14} />
                    </div>
                </motion.button>

                <motion.button
                    whileHover={{ y: -10, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('super-users')}
                    className="glass-card p-16 flex flex-col items-center justify-center text-center group relative overflow-hidden border border-blue-500/10 min-h-[400px]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-28 h-28 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center text-blue-400 mb-10 shadow-[0_0_50px_rgba(59,130,246,0.2)] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                        <Users size={56} />
                    </div>
                    <h3 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tighter">Foydalanuvchilar</h3>
                    <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-[10px] max-w-[200px] leading-relaxed">Platforma statistikasi va foydalanuvchilar ma'lumotlari</p>
                    <div className="mt-10 flex items-center gap-2 text-blue-400 font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        O'tish <ChevronRight size={14} />
                    </div>
                </motion.button>
            </div>
        </div>
    );

    const handleApproveShop = async (id) => {
        await approveShop(id);
    };

    const SuperSalonsTab = () => {
        const pendingShops = allShops.filter(s => s.status === 'Pending');
        const activeShops = allShops.filter(s => s.status !== 'Pending');
        const filteredActive = activeShops.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

        return (
            <div className="flex flex-col gap-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveTab('gateway')} className="p-3 glass rounded-xl hover:text-primary transition-colors"><ChevronRight size={20} className="rotate-180" /></button>
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Salonlarni Boshqarish</h3>
                    </div>
                    <div className="flex glass-card bg-white/5 px-6 py-2 rounded-xl gap-3 w-full md:w-80 border-white/5">
                        <SearchIcon size={18} className="text-text-muted" />
                        <input
                            type="text"
                            placeholder="Salonlarni qidirish..."
                            className="bg-transparent border-none outline-none text-white text-sm w-full"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Pending Requests */}
                {pendingShops.length > 0 && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                            <h4 className="text-sm font-black text-rose-400 uppercase tracking-[0.3em]">Yangi So'rovnomalar ({pendingShops.length})</h4>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {pendingShops.map((s, i) => (
                                <motion.div key={s.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 border-rose-500/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl" />
                                    <div className="flex items-center justify-between gap-6 relative z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-rose-400 border-rose-500/20 font-black text-2xl shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                                                {s.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-white italic">{s.name}</h4>
                                                <p className="text-[10px] text-rose-400/60 uppercase tracking-widest font-black mt-1">Tasdiqlash kutilmoqda</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleDeleteShop(s.id)} className="p-4 glass text-white/20 hover:text-rose-400 rounded-2xl hover:bg-rose-400/5 transition-all"><X size={20} /></button>
                                            <button onClick={() => handleApproveShop(s.id)} className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2">Qabul qilish <CheckCircle2 size={16} /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Shops */}
                <div className="flex flex-col gap-6">
                    <h4 className="text-sm font-black text-text-muted uppercase tracking-[0.3em] ml-1">Barcha Salonlar</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredActive.map((s, i) => (
                            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-6 flex flex-wrap items-center justify-between group gap-4 border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-primary font-black text-2xl shadow-glow">
                                        {s.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white">{s.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Faol</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 text-white/50">
                                    <button className="p-3 glass hover:bg-white/10 rounded-xl transition-all" title="Ko'rish"><ArrowUpRight size={18} /></button>
                                    <button onClick={() => handleDeleteShop(s.id)} className="p-3 text-white/20 hover:text-rose-400 hover:bg-rose-400/5 rounded-xl transition-all" title="O'chirish"><X size={18} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const SuperUsersTab = () => (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('gateway')} className="p-3 glass rounded-xl hover:text-primary transition-colors"><ChevronRight size={20} className="rotate-180" /></button>
                <h3 className="text-2xl font-black text-white italic">Foydalanuvchilar Paneli</h3>
            </div>

            <div className="glass-card p-6 md:p-10 text-center relative overflow-hidden w-full border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
                <Users size={48} className="mx-auto text-primary mb-4 shadow-glow" />
                <h4 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tighter">Platforma Statistikasi</h4>
                <p className="text-text-muted font-bold max-w-sm mx-auto uppercase tracking-widest text-[10px] mb-8">
                    Jami akkauntlar (Barcha): <span className="text-white">{stats.totalUsers}</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 border-emerald-500/10">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Faol</p>
                        <p className="text-2xl font-black text-white">{stats.activeNow}</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 border-blue-500/10">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Salonlar</p>
                        <p className="text-2xl font-black text-white">{allShops.length}</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 border-rose-500/10">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Bloklangan</p>
                        <p className="text-2xl font-black text-white">0</p>
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 border-white/5">
                    <h5 className="text-sm font-black text-white uppercase tracking-widest mb-4">Oxirgi harakatlar</h5>
                    <div className="flex flex-col gap-4">
                        {stats.recentActions.length > 0 ? stats.recentActions.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/2 rounded-xl transition-all">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><User size={16} /></div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-bold text-white line-clamp-1">{item.name} {item.action}</p>
                                    <p className="text-[10px] text-text-muted uppercase font-black">{item.time}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-10 text-center text-text-muted font-bold text-[10px] uppercase">Harakatlar yo'q</div>
                        )}
                    </div>
                </div>
                <div className="glass-card p-6 border-white/5">
                    <h5 className="text-sm font-black text-white uppercase tracking-widest mb-4">Tizim holati</h5>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center p-3">
                            <span className="text-sm text-text-muted font-bold">Server</span>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-emerald-500/20">Onlayn</span>
                        </div>
                        <div className="flex justify-between items-center p-3">
                            <span className="text-sm text-text-muted font-bold">Ma'lumotlar bazasi</span>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-emerald-500/20">Normal</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const Sidebar = () => (
        <div className={`fixed left-0 top-0 h-screen transition-all duration-300 z-50 ${isSidebarOpen ? 'w-72' : 'w-24'} bg-gradient-to-b from-[#0B0F14] to-[#0D1612] border-r border-white/5 flex flex-col`}>
            <div className="p-8 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Scissors className="text-bg" size={20} />
                </div>
                {isSidebarOpen && <span className="text-xl font-black text-white uppercase italic tracking-tighter"><span className="text-gradient">Barber</span>OS</span>}
            </div>
            <nav className="flex-1 px-4 py-8 flex flex-col gap-2">
                {NAV_ITEMS.map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all relative group ${activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-white hover:bg-white/5'}`}>
                        <item.icon size={20} className={activeTab === item.id ? 'text-primary' : 'group-hover:text-white'} />
                        {isSidebarOpen && <span className="font-black text-[12px] uppercase tracking-widest">{item.label}</span>}
                        {activeTab === item.id && <motion.div layoutId="active-bar" className="absolute left-0 w-1 h-6 bg-primary rounded-full" />}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-white/5">
                <button onClick={signOut} className="flex items-center gap-4 px-4 py-6 rounded-xl text-rose-400 hover:bg-rose-400/5 w-full transition-all group">
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    {isSidebarOpen && <span className="font-black text-sm uppercase tracking-widest">Chiqish</span>}
                </button>
            </div>
        </div>
    );

    const Topbar = () => (
        <header className="h-24 glass border-b border-white/5 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight">
                {isSuperAdmin ? "Platforma Admini" : NAV_ITEMS.find(i => i.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-2 md:gap-6">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative w-10 h-10 md:w-12 md:h-12 glass rounded-xl flex items-center justify-center text-text-muted hover:text-white transition-all"
                    >
                        <Bell size={20} />
                        {notifications.some(n => n.status === 'unread') && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0B0F14]" />
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-4 w-80 glass border border-white/10 rounded-2xl p-4 z-[100] shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Bildirishnomalar</h4>
                                    <button onClick={() => setNotifications([])} className="text-[8px] uppercase font-black text-rose-400 hover:underline">Tozalash</button>
                                </div>
                                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto scrollbar-hide">
                                    {notifications.length > 0 ? notifications.map((n, idx) => (
                                        <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-white font-bold leading-tight">{n.message}</p>
                                            <p className="text-[8px] text-text-muted mt-1 uppercase font-black">
                                                {new Date(n.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    )) : (
                                        <div className="py-8 text-center text-[10px] uppercase font-black text-text-muted opacity-30 italic">Hozircha xabarlar yo'q</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-3 md:gap-4 pl-3 md:pl-4 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-white font-black text-[10px] md:text-xs uppercase tracking-widest">{isSuperAdmin ? 'Super Admin' : (currentUser?.full_name || 'Admin')}</p>
                        <p className="text-text-muted text-[8px] md:text-[10px] font-bold uppercase tracking-widest">{isSuperAdmin ? 'To\'liq ruxsat' : 'Salon egasi'}</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20"><User size={24} /></div>

                    {isSuperAdmin && (
                        <button
                            onClick={signOut}
                            className="p-3 text-rose-400 hover:bg-rose-400/5 rounded-xl transition-all ml-2"
                            title="Chiqish"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );

    const OverviewTab = () => (
        <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 border-white/5">
                    <p className="text-text-muted text-[10px] font-black uppercase mb-1">Bugungi Mijozlar</p>
                    <h3 className="text-3xl font-black text-white">12</h3>
                </div>
                <div className="glass-card p-6 text-primary border-white/5">
                    <p className="text-text-muted text-[10px] font-black uppercase mb-1">Daromad</p>
                    <h3 className="text-3xl font-black">450k</h3>
                </div>
                <div className="glass-card p-6 text-emerald-400 border-white/5">
                    <p className="text-text-muted text-[10px] font-black uppercase mb-1">Faol Navbat</p>
                    <h3 className="text-3xl font-black">3</h3>
                </div>
                <div className="glass-card p-6 text-amber-400 border-white/5">
                    <p className="text-text-muted text-[10px] font-black uppercase mb-1">Reyting</p>
                    <h3 className="text-3xl font-black">4.9</h3>
                </div>
            </div>
            <div className="glass-card p-10 h-[400px] flex items-center justify-center text-text-muted font-black uppercase tracking-widest border-dashed opacity-30">
                Analitika grafigi (Tez kunda)
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg text-text-main flex font-['Outfit'] overflow-hidden">
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[250px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[250px]" />
            </div>

            {!isSuperAdmin && <Sidebar />}

            <main className={`flex-1 flex flex-col transition-all duration-300 ${!isSuperAdmin ? (isSidebarOpen ? 'ml-72' : 'ml-24') : ''} h-screen overflow-y-auto custom-scrollbar`}>
                <Topbar />
                <div className="p-6 md:p-10 flex flex-col gap-10">
                    <AnimatePresence mode="wait">
                        {isSuperAdmin ? (
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                {activeTab === 'gateway' && <SuperGatewayTab />}
                                {activeTab === 'salons' && <SuperSalonsTab />}
                                {activeTab === 'super-users' && <SuperUsersTab />}
                                {activeTab === 'settings' && <div className="glass-card p-10 text-center uppercase font-black text-text-muted italic border-white/5">Tizim sozlamalari (Yaqinda)</div>}
                            </motion.div>
                        ) : (
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                {activeTab === 'overview' && <OverviewTab />}
                                {activeTab === 'queue' && <div className="glass-card p-10 border-white/5">Navbat mantiqi yuklanmoqda...</div>}
                                {activeTab === 'settings' && <div className="glass-card p-10 text-center uppercase font-black text-text-muted italic border-white/5">Shaxsiy sozlamalar (Yaqinda)</div>}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
