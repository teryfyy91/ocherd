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

    const userPhone = localStorage.getItem('currentUserPhone') || '';
    const isSuperAdmin = userPhone.replace(/\D/g, '').includes('505521107');

    const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'gateway' : 'overview');
    const [searchQuery, setSearchQuery] = useState('');
    const allShops = contextShops;
    const [stats, setStats] = useState({ totalUsers: 0, activeNow: 0, recentActions: [] });
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [newNotificationToast, setNewNotificationToast] = useState(null);

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

                    // Fetch real notifications from DB
                    const { data: dbNotifications } = await supabase
                        .from('notifications')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(20);

                    const dbMapped = await Promise.all((dbNotifications || []).map(async n => {
                        let msg = n.message;
                        let type = 'system';
                        let salonDetails = null;

                        if (msg && msg.startsWith('NEW_SALON_REGISTRATION|||')) {
                            type = 'new_salon_registration';
                            const pendingId = msg.split('|||')[1];
                            if (pendingId && pendingId !== 'null') {
                                // Fetch details from pending_salons
                                const { data: salonData } = await supabase
                                    .from('pending_salons')
                                    .select('*')
                                    .eq('id', pendingId)
                                    .single();

                                if (salonData) {
                                    salonDetails = salonData;
                                    msg = "Yangi salon tasdiqlash kutmoqda";
                                }
                            }
                        }

                        return {
                            id: n.id,
                            message: msg,
                            type: type,
                            salonDetails: salonDetails,
                            created_at: n.created_at,
                            status: n.status
                        }
                    }));

                    setNotifications(dbMapped);

                } catch (err) {
                    console.error('Error fetching stats:', err);
                }
                setLoading(false);
            };
            fetchAllData();

            const notificationChannel = supabase
                .channel('admin-notifications-sync')
                .on('postgres_changes', { event: '*', table: 'notifications' }, async payload => {
                    if (payload.eventType === 'INSERT') {
                        let msg = payload.new.message;
                        let type = 'system';
                        let salonDetails = null;

                        if (msg && msg.startsWith('NEW_SALON_REGISTRATION|||')) {
                            type = 'new_salon_registration';
                            const pendingId = msg.split('|||')[1];
                            if (pendingId && pendingId !== 'null') {
                                const { data: salonData } = await supabase
                                    .from('pending_salons')
                                    .select('*')
                                    .eq('id', pendingId)
                                    .single();

                                if (salonData) {
                                    salonDetails = salonData;
                                    msg = "Yangi salon tasdiqlash kutmoqda";
                                }
                            }
                        }

                        const newNotif = {
                            id: payload.new.id,
                            message: msg,
                            type: type,
                            salonDetails: salonDetails,
                            created_at: payload.new.created_at,
                            status: payload.new.status
                        };
                        setNotifications(prev => [newNotif, ...prev]);
                        setNewNotificationToast(msg);
                        setTimeout(() => setNewNotificationToast(null), 8000);
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(notificationChannel);
            };
        }
    }, [isSuperAdmin]);

    // Live sync pending shops to notifications is now handled by DB fetch
    useEffect(() => {
        // No need for client-side mapping of allShops to notifications anymore
    }, [allShops]);

    const handleDeleteShop = async (id) => {
        if (window.confirm("Rostdan ham ushbu salonni o'chirishni xohlaysizmi?")) {
            await deleteShop(id);
        }
    };

    const handleApproveShop = async (id) => {
        await approveShop(id);
    };

    const handleApproveNewRegistration = async (notif) => {
        if (!notif.salonDetails) return;
        try {
            const { error: shopError } = await supabase.from('shops').insert([{
                owner_id: notif.salonDetails.owner_id,
                name: notif.salonDetails.name,
                image_url: notif.salonDetails.image_url,
                services: notif.salonDetails.services,
                working_hours: notif.salonDetails.working_hours,
                status: 'Active'
            }]);

            if (shopError) {
                console.error('Error adding shop:', shopError);
                return;
            }

            // Update pending status
            await supabase.from('pending_salons').update({ status: 'approved' }).eq('id', notif.salonDetails.id);

            // Delete notification
            await supabase.from('notifications').delete().eq('id', notif.id);

            setNotifications(prev => prev.filter(n => n.id !== notif.id));
            refreshShops();
        } catch (err) {
            console.error('Error approving new registration:', err);
        }
    };

    const handleRejectNewRegistration = async (notif) => {
        try {
            if (notif.salonDetails) {
                await supabase.from('pending_salons').update({ status: 'rejected' }).eq('id', notif.salonDetails.id);
            }
            await supabase.from('notifications').delete().eq('id', notif.id);
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
        } catch (err) {
            console.error('Error rejecting new registration:', err);
        }
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
        const pendingShops = [
            ...allShops.filter(s => s.status === 'Pending'),
            ...notifications.filter(n => n.type === 'new_registration').map(n => ({
                id: n.id, // using notif id as temp key
                name: n.shopData?.name || 'Kutilmoqda',
                status: 'Pending',
                isNewReg: true,
                notifData: n
            }))
        ];
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
                                            <button onClick={() => {
                                                if (s.isNewReg) {
                                                    handleRejectNewRegistration(s.notifData);
                                                } else {
                                                    handleDeleteShop(s.id);
                                                }
                                            }} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Bekor qilish</button>
                                            <button onClick={() => {
                                                if (s.isNewReg) {
                                                    handleApproveNewRegistration(s.notifData);
                                                } else {
                                                    handleApproveShop(s.id);
                                                }
                                            }} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Tasdiqlash</button>
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
                    <div className="w-16 h-auto flex items-center justify-center overflow-hidden">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-3 rounded-xl transition-all relative ${showNotifications ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                            <Bell size={20} />
                            {notifications.length > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setShowNotifications(false)}
                                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1001]"
                                    />
                                    <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4 md:p-8 pointer-events-none">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                            className="w-full max-w-4xl h-[85vh] flex flex-col bg-white shadow-[0_40px_100px_rgba(0,0,0,0.4)] rounded-[2.5rem] overflow-hidden border border-slate-100 pointer-events-auto"
                                        >
                                            {/* Absolute Close Button (X) */}
                                            <button
                                                onClick={() => setShowNotifications(false)}
                                                className="absolute top-6 right-6 w-14 h-14 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all duration-300 shadow-xl z-50 group"
                                            >
                                                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                                            </button>

                                            <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col justify-center bg-slate-50/50 shrink-0 relative z-40">
                                                <div className="flex flex-col gap-1 pr-16">
                                                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Bildirishnomalar</h3>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{notifications.length} ta yangi xabar</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 scrollbar-hide">
                                                {notifications.length > 0 ? notifications.map((n, i) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        key={n.id || i}
                                                        className={`p-6 rounded-[2.5rem] border flex flex-col gap-6 transition-all hover:shadow-xl ${(n.type === 'new_salon_registration' || n.type === 'registration') ? 'bg-indigo-50/50 border-indigo-100 shadow-sm shadow-indigo-50' : 'bg-slate-50 border-slate-100'}`}
                                                    >
                                                        <div className="flex gap-5">
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${(n.type === 'new_salon_registration' || n.type === 'registration') ? 'bg-indigo-500 text-white shadow-indigo-200' : 'bg-primary text-white shadow-primary/20'}`}>
                                                                {(n.type === 'new_salon_registration' || n.type === 'registration') ? <Building2 size={24} /> : <Bell size={24} />}
                                                            </div>
                                                            <div className="flex-1 flex flex-col gap-3">
                                                                <div className="flex items-center justify-between">
                                                                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${(n.type === 'new_salon_registration' || n.type === 'registration') ? 'bg-indigo-100 text-indigo-600' : 'bg-primary/10 text-primary'}`}>
                                                                        {(n.type === 'new_salon_registration' || n.type === 'registration') ? "Yangi Salon Tasdiqlash" : "Tizim"}
                                                                    </span>
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">
                                                                        {new Date(n.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm font-black text-slate-800 leading-relaxed italic">{n.message}</p>

                                                                {n.salonDetails && (
                                                                    <div className="bg-white/50 backdrop-blur-sm border border-indigo-100/50 rounded-2xl p-4 flex flex-col gap-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <User size={14} className="text-indigo-400" />
                                                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em]">{n.salonDetails.owner_name}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            <Phone size={14} className="text-indigo-400" />
                                                                            <span className="text-[10px] font-bold text-slate-600 tracking-wider ">{n.salonDetails.owner_phone}</span>
                                                                        </div>
                                                                        {n.salonDetails.description && (
                                                                            <p className="text-[9px] text-slate-400 font-medium italic line-clamp-2 mt-1">
                                                                                "{n.salonDetails.description}"
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {(n.type === 'new_salon_registration' || n.type === 'registration') && (
                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={async () => {
                                                                        if (n.type === 'new_salon_registration') {
                                                                            await handleRejectNewRegistration(n);
                                                                        } else {
                                                                            await deleteShop(n.id);
                                                                            refreshShops();
                                                                        }
                                                                    }}
                                                                    className="flex-1 h-12 bg-white border border-red-100 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                                                                >
                                                                    Rad etish
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (n.type === 'new_salon_registration') {
                                                                            await handleApproveNewRegistration(n);
                                                                        } else {
                                                                            await approveShop(n.id);
                                                                            refreshShops();
                                                                        }
                                                                    }}
                                                                    className="flex-[2] h-12 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all"
                                                                >
                                                                    Tasdiqlash
                                                                </button>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )) : (
                                                    <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-30">
                                                        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
                                                            <Bell size={48} strokeWidth={1} />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.5em] italic">Hozircha bo'sh</p>
                                                    </div>
                                                )}
                                            </div>

                                            {notifications.length > 0 && (
                                                <div className="p-8 border-t border-slate-100 bg-slate-50/50 shrink-0">
                                                    <button
                                                        onClick={() => setNotifications([])}
                                                        className="w-full h-14 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all"
                                                    >
                                                        Barchasini o'chirish
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    </div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                    <button onClick={signOut} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <LogOut size={20} />
                    </button>
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                        <User size={20} />
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {newNotificationToast && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        className="fixed top-24 right-6 z-[2000] w-80 bg-slate-900 text-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-start gap-4 backdrop-blur-xl"
                    >
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                            <Bell size={20} className="animate-bounce" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">Yangi Xabar</span>
                            <p className="text-xs font-bold leading-relaxed">{newNotificationToast}</p>
                        </div>
                        <button onClick={() => setNewNotificationToast(null)} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

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
                    { id: 'super-users', icon: TrendingUp },
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
