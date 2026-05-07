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
    Building2, Star, MessageSquare, ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabase';

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
                await refreshShops();
                try {
                    const { data: bookings } = await supabase
                        .from('bookings')
                        .select('user_phone, user_name, created_at, shop_name')
                        .order('created_at', { ascending: false });

                    if (bookings) {
                        const uniquePhones = new Set();
                        allShops.forEach(s => uniquePhones.add(s.ownerId));
                        bookings.forEach(b => uniquePhones.add(b.user_phone));

                        setStats({
                            totalUsers: uniquePhones.size,
                            activeNow: Math.floor(uniquePhones.size * 0.4),
                            recentActions: bookings.slice(0, 5).map(b => ({
                                name: b.user_name || 'Mijoz',
                                action: `${b.shop_name} uchun navbat oldi`,
                                time: new Date(b.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
                            }))
                        });
                    }

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

            const channel = supabase
                .channel('admin-shops-sync')
                .on('postgres_changes', { event: 'INSERT', table: 'shops' }, payload => {
                    if (payload.new.status === 'Pending') {
                        refreshShops();
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [isSuperAdmin]);

    const handleDeleteShop = async (id) => {
        if (window.confirm("Rostdan ham ushbu salonni o'chirishni xohlaysizmi?")) {
            await deleteShop(id);
        }
    };

    const handleApproveShop = async (id) => {
        await approveShop(id);
    };

    const SuperGatewayTab = () => (
        <div className="flex flex-col gap-12 py-10">
            <div className="text-center relative py-12 md:py-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[150px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4">
                    <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Boshqaruv Markazi</span>
                    <h2 className="text-5xl md:text-8xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                        Xush Kelibsiz, <br /> <span className="text-primary italic">Admin</span>
                    </h2>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full px-4">
                <motion.button
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('salons')}
                    className="bg-white border border-slate-100 p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 flex flex-col items-center justify-center text-center group transition-all"
                >
                    <div className="w-24 h-24 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-primary/5">
                        <Building2 size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 italic uppercase mb-3">Salonlar</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] max-w-[200px] leading-relaxed">Ro'yxatdan o'tgan va tasdiqlash kutilayotgan salonlar boshqaruvi</p>
                </motion.button>

                <motion.button
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('super-users')}
                    className="bg-white border border-slate-100 p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 flex flex-col items-center justify-center text-center group transition-all"
                >
                    <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-[2rem] flex items-center justify-center mb-8 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-xl shadow-blue-100">
                        <Users size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 italic uppercase mb-3">Statistika</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] max-w-[200px] leading-relaxed">Foydalanuvchilar soni va platforma faolligi monitoringi</p>
                </motion.button>
            </div>
        </div>
    );

    const SuperSalonsTab = () => {
        const pendingShops = allShops.filter(s => s.status === 'Pending');
        const activeShops = allShops.filter(s => s.status !== 'Pending');
        const filteredActive = activeShops.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

        return (
            <div className="flex flex-col gap-10 pt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setActiveTab('gateway')} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm"><ChevronRight size={20} className="rotate-180" /></button>
                        <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Salonlar</h3>
                    </div>
                    <div className="flex bg-slate-100 px-6 py-4 rounded-[2rem] gap-3 w-full md:w-96">
                        <SearchIcon size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Salon qidirish..."
                            className="bg-transparent border-none outline-none text-slate-800 font-bold text-sm w-full"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {pendingShops.length > 0 && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Yangi so'rovlar ({pendingShops.length})</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingShops.map((s) => (
                                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-red-100 p-8 rounded-[3rem] shadow-xl shadow-red-50 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50" />
                                    <div className="flex flex-col gap-8 relative z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 font-black text-2xl">
                                                {s.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-slate-800 italic uppercase">{s.name}</h4>
                                                <p className="text-[9px] text-red-400 font-black uppercase tracking-widest mt-1">Kutilmoqda</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleDeleteShop(s.id)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Bekor qilish</button>
                                            <button onClick={() => handleApproveShop(s.id)} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Tasdiqlash</button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Barcha salonlar</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredActive.map((s, i) => (
                            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-lg shadow-slate-100 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary font-black text-xl border border-slate-100 shadow-sm">
                                        {s.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-800 uppercase italic leading-none">{s.name}</h4>
                                        <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-1">Faol</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteShop(s.id)} className="w-10 h-10 rounded-xl text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all">
                                    <X size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const SuperUsersTab = () => (
        <div className="flex flex-col gap-10 pt-6">
            <div className="flex items-center gap-4">
                <button onClick={() => setActiveTab('gateway')} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm"><ChevronRight size={20} className="rotate-180" /></button>
                <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Foydalanuvchilar</h3>
            </div>

            <div className="bg-slate-900 border-none p-10 md:p-16 rounded-[4rem] text-center relative overflow-hidden w-full text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="w-20 h-20 bg-white/10 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5"><Users size={40} /></div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Tizim Faolligi</h4>
                <p className="text-6xl md:text-8xl font-black italic tracking-tighter mb-4">{stats.totalUsers}</p>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Jami ro'yxatdan o'tgan foydalanuvchilar</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl mx-auto">
                    {[
                        { label: 'Faol Hozir', val: stats.activeNow, color: 'text-emerald-400' },
                        { label: 'Salonlar', val: allShops.length, color: 'text-blue-400' },
                        { label: 'Bloklangan', val: 0, color: 'text-red-400' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                            <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-xl">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 ml-1">So'nggi harakatlar</h5>
                    <div className="flex flex-col gap-6">
                        {stats.recentActions.length > 0 ? stats.recentActions.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-[2rem] transition-all hover:bg-slate-100">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary font-black uppercase">{item.name[0]}</div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-slate-800 line-clamp-1 italic">{item.name} {item.action}</p>
                                    <p className="text-[9px] text-slate-400 uppercase font-black mt-1 tracking-widest">{item.time}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-slate-300 font-bold uppercase text-[9px] italic tracking-widest">Hozircha bo'sh</div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-xl h-fit">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 ml-1">Tizim holati</h5>
                    <div className="flex flex-col gap-4">
                        {[
                            { name: 'Server', status: 'Online', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { name: 'Bazalar', status: 'Optimal', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { name: 'Xavfsizlik', status: 'Yaxshi', color: 'text-emerald-500', bg: 'bg-emerald-50' }
                        ].map((s, i) => (
                            <div key={i} className="flex justify-between items-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <span className="text-sm text-slate-600 font-black uppercase italic">{s.name}</span>
                                <span className={`px-4 py-1.5 ${s.bg} ${s.color} text-[8px] font-black rounded-full uppercase tracking-widest`}>{s.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-slate-800 flex flex-col font-['Inter'] pb-32">
            <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-[50]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShieldCheck size={24} />
                    </div>
                    <h2 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                        BarberOS <br /> <span className="text-[8px] text-primary tracking-[0.4em] uppercase">Control Panel</span>
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={signOut} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <LogOut size={20} />
                    </button>
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                        <User size={20} />
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col px-6">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        {activeTab === 'gateway' && <SuperGatewayTab />}
                        {activeTab === 'salons' && <SuperSalonsTab />}
                        {activeTab === 'super-users' && <SuperUsersTab />}
                        {activeTab === 'settings' && <div className="py-32 text-center text-slate-300 font-black uppercase tracking-[0.5em] italic">Yaqinda...</div>}
                    </motion.div>
                </AnimatePresence>
            </main>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900 p-2 rounded-[2.5rem] shadow-2xl z-[100] border border-white/5">
                {[
                    { id: 'gateway', icon: LayoutDashboard },
                    { id: 'salons', icon: Building2 },
                    { id: 'super-users', icon: BarChart3 },
                    { id: 'settings', icon: Settings }
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === item.id ? 'bg-primary text-white scale-110 shadow-xl shadow-primary/30' : 'text-slate-500 hover:text-white'}`}
                    >
                        <item.icon size={22} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
