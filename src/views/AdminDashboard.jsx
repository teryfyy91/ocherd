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
    Building2, Star, MessageSquare, ShieldCheck,
    Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabase';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const {
        shopInfo, queue, updateBookingStatus,
        deleteBooking, reviews, currentUser, allShops: contextShops,
        deleteShop, approveShop, refreshShops, signOut, setAllShops
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
                        try {
                            let msg = n.message || '';
                            let type = 'system';
                            let salonDetails = null;

                            if (msg.startsWith('NEW_SALON_REGISTRATION|||')) {
                                type = 'new_salon_registration';
                                const pendingId = msg.split('|||')[1];
                                if (pendingId && pendingId !== 'null') {
                                    const { data: salonData } = await supabase
                                        .from('pending_salons')
                                        .select('*')
                                        .eq('id', pendingId)
                                        .maybeSingle();

                                    if (salonData) {
                                        salonDetails = salonData;
                                        msg = "Yangi salon so'rovi bor, qabul qilasizmi?";
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
                            };
                        } catch (err) {
                            console.error('Error mapping notification:', err);
                            return { id: n.id, message: n.message, type: 'system', created_at: n.created_at };
                        }
                    }));

                    setNotifications(dbMapped);

                } catch (err) {
                    console.error('Error fetching admin data:', err);
                }
                setLoading(false);
            };
            fetchAllData();

            const notificationChannel = supabase
                .channel('admin-notifications-sync')
                .on('postgres_changes', { event: 'INSERT', table: 'notifications' }, async payload => {
                    try {
                        let msg = payload.new.message || '';
                        let type = 'system';
                        let salonDetails = null;

                        if (msg.startsWith('NEW_SALON_REGISTRATION|||')) {
                            type = 'new_salon_registration';
                            const pendingId = msg.split('|||')[1];
                            if (pendingId && pendingId !== 'null') {
                                const { data: salonData } = await supabase
                                    .from('pending_salons')
                                    .select('*')
                                    .eq('id', pendingId)
                                    .maybeSingle();

                                if (salonData) {
                                    salonDetails = salonData;
                                    msg = "Yangi salon so'rovi bor, qabul qilasizmi?";
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
                    } catch (err) {
                        console.error('Real-time notification error:', err);
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

    const handleApproveNewRegistration = async (notif) => {
        if (!notif || !notif.salonDetails) {
            console.error('notif yoki salonDetails topilmadi');
            return;
        }
        setLoading(true);
        try {
            const d = notif.salonDetails;

            // 1. Build insert payload
            let insertPayload = {
                owner_id: d.owner_id,
                name: d.name || 'Nomsiz Salon',
                status: 'Active',
                image_url: d.image_url || '',
                phone: d.owner_phone || ''
            };
            if (d.services) insertPayload.services = d.services;
            if (d.working_hours) insertPayload.working_hours = d.working_hours;

            let insertError = null;
            let success = false;

            // Auto-retry loop to strip missing columns
            let attempts = 0;
            while (!success && attempts < 5) {
                attempts++;
                const { error } = await supabase.from('shops').insert([insertPayload]);

                if (error) {
                    if (error.code === '23505') {
                        // Duplicate owner - already exists in shops, so it's already active!
                        success = true;
                        break;
                    }
                    if (error.message && error.message.includes("Could not find the") && error.message.includes("column")) {
                        const match = error.message.match(/'([^']+)'/);
                        if (match && match[1] && insertPayload[match[1]] !== undefined) {
                            console.warn(`Ustun topilmadi: ${match[1]}, olib tashlab qayta urinamiz...`);
                            delete insertPayload[match[1]];
                            continue;
                        }
                    }
                    insertError = error;
                    break;
                } else {
                    success = true;
                }
            }

            if (insertError) {
                console.error('Insert error:', insertError);
                alert('Bazada xatolik: ' + insertError.message);
                return;
            }

            // 2. Mark pending_salon as approved
            await supabase.from('pending_salons').update({ status: 'approved' }).eq('id', d.id);

            // 3. Remove notification from DB
            await supabase.from('notifications').delete().eq('id', notif.id);

            // 4. Immediately remove notification from local state
            setNotifications(prev => prev.filter(n => n.id !== notif.id));

            // 5. Optimistic update: add the new shop immediately to local state
            const newShop = {
                id: 'temp-' + Date.now(),
                ownerId: d.owner_id,
                name: d.name || 'Nomsiz Salon',
                imageUrl: d.image_url || '',
                services: d.services || [],
                workingHours: d.working_hours || { start: '09:00', end: '18:00' },
                status: 'Active',
                createdAt: new Date().toISOString()
            };
            setAllShops(prev => [newShop, ...prev]);

            // 6. Then refresh from server to get real ID
            await refreshShops();
        } catch (err) {
            console.error('Tasdiqlashda xatolik:', err);
            alert('Tasdiqlashda kutilmagan xatolik yuz berdi.');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectNewRegistration = async (notif) => {
        setLoading(true);
        try {
            if (notif.salonDetails) {
                await supabase.from('pending_salons').update({ status: 'rejected' }).eq('id', notif.salonDetails.id);
            }
            await supabase.from('notifications').delete().eq('id', notif.id);
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
        } catch (err) {
            console.error('Error rejecting new registration:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveShop = async (id) => {
        setLoading(true);
        try {
            await approveShop(id);
            await refreshShops();
        } catch (err) {
            console.error('Error approving shop:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteShop = async (id) => {
        if (window.confirm("Rostdan ham ushbu salonni o'chirishni xohlaysizmi?")) {
            setLoading(true);
            try {
                await deleteShop(id);
                await refreshShops();
            } catch (err) {
                console.error('Error deleting shop:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const SuperGatewayTab = () => (
        <div className="flex flex-col gap-12 py-10">
            <div className="text-center relative py-12 md:py-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[150px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.3em]">Admin Paneli</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-800 uppercase tracking-tight leading-none">
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
                    <h3 className="text-xl font-bold text-slate-800 uppercase mb-3">Salonlar</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[7px] max-w-[200px] leading-relaxed">Salonlar boshqaruvi</p>
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
                    <h3 className="text-xl font-bold text-slate-800 uppercase mb-3">Statistika</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[7px] max-w-[200px] leading-relaxed">Platforma faolligi</p>
                </motion.button>
            </div>
        </div>
    );

    const SuperSalonsTab = () => {
        const pendingShops = [
            ...allShops.filter(s => s.status === 'Pending'),
            ...notifications.filter(n => n.type === 'new_salon_registration').map(n => ({
                id: n.id,
                name: n.salonDetails?.name || 'Kutilmoqda',
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
                        <h3 className="text-xl font-bold text-slate-800 italic uppercase tracking-tight">Salonlar</h3>
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
                            <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Yangi so'rovlar ({pendingShops.length})</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingShops.map((s) => (
                                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-red-100 p-8 rounded-[3rem] shadow-xl shadow-red-50 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50" />
                                    <div className="flex flex-col gap-8 relative z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 font-bold text-2xl">
                                                {s.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-slate-800 italic uppercase">{s.name}</h4>
                                                <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest mt-1">Kutilmoqda</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                disabled={loading}
                                                onClick={() => {
                                                    if (s.isNewReg) {
                                                        handleRejectNewRegistration(s.notifData);
                                                    } else {
                                                        handleDeleteShop(s.id);
                                                    }
                                                }}
                                                className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
                                            >
                                                {loading ? '...' : 'Bekor qilish'}
                                            </button>
                                            <button
                                                disabled={loading}
                                                onClick={() => {
                                                    if (s.isNewReg) {
                                                        handleApproveNewRegistration(s.notifData);
                                                    } else {
                                                        handleApproveShop(s.id);
                                                    }
                                                }}
                                                className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="animate-spin size-4" /> : 'Tasdiqlash'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Barcha salonlar</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredActive.map((s, i) => (
                            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-lg shadow-slate-100 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary font-bold text-xl border border-slate-100 shadow-sm">
                                        {s.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800 uppercase italic leading-none">{s.name}</h4>
                                        <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Faol</p>
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
                <h3 className="text-2xl font-bold text-slate-800 italic uppercase tracking-tighter">Foydalanuvchilar</h3>
            </div>

            <div className="bg-slate-900 border-none p-10 md:p-16 rounded-[4rem] text-center relative overflow-hidden w-full text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="w-20 h-20 bg-white/10 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5"><Users size={40} /></div>
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-4">Tizim Faolligi</h4>
                <p className="text-5xl md:text-7xl font-bold italic tracking-tight mb-4">{stats.totalUsers}</p>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Jami ro'yxatdan o'tgan foydalanuvchilar</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl mx-auto">
                    {[
                        { label: 'Faol Hozir', val: stats.activeNow, color: 'text-emerald-400' },
                        { label: 'Salonlar', val: allShops.length, color: 'text-blue-400' },
                        { label: 'Bloklangan', val: 0, color: 'text-red-400' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.val}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-xl">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 ml-1">So'nggi harakatlar</h5>
                    <div className="flex flex-col gap-6">
                        {stats.recentActions.length > 0 ? stats.recentActions.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-[2rem] transition-all hover:bg-slate-100">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary font-bold uppercase">{item.name[0]}</div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 line-clamp-1 italic">{item.name} {item.action}</p>
                                    <p className="text-[9px] text-slate-400 uppercase font-bold mt-1 tracking-widest">{item.time}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-slate-300 font-bold uppercase text-[9px] italic tracking-widest">Hozircha bo'sh</div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-xl h-fit">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 ml-1">Tizim holati</h5>
                    <div className="flex flex-col gap-4">
                        {[
                            { name: 'Server', status: 'Online', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { name: 'Bazalar', status: 'Optimal', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { name: 'Xavfsizlik', status: 'Yaxshi', color: 'text-emerald-500', bg: 'bg-emerald-50' }
                        ].map((s, i) => (
                            <div key={i} className="flex justify-between items-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <span className="text-sm text-slate-600 font-bold uppercase italic">{s.name}</span>
                                <span className={`px-4 py-1.5 ${s.bg} ${s.color} text-[8px] font-bold rounded-full uppercase tracking-widest`}>{s.status}</span>
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
                                            initial={{ opacity: 0, scale: 0.95, y: 50 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 50 }}
                                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                            className="w-full max-w-4xl max-h-[85vh] h-auto flex flex-col bg-white shadow-[0_50px_100px_rgba(0,0,0,0.4)] rounded-[2.5rem] overflow-hidden border border-slate-100 pointer-events-auto"
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
                                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase italic tracking-tighter leading-none">Bildirishnomalar</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{notifications.length} ta yangi xabar</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-8 md:p-10 flex flex-col gap-8 scrollbar-hide pt-12 md:pt-16">
                                                {notifications.length > 0 ? notifications.map((n, i) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        key={n.id || i}
                                                        className={`p-8 rounded-[2.5rem] border flex flex-col gap-8 transition-all hover:shadow-xl ${(n.type === 'new_salon_registration' || n.type === 'registration') ? 'bg-indigo-50/50 border-indigo-100 shadow-sm shadow-indigo-100/10' : 'bg-slate-50 border-slate-100'}`}
                                                    >
                                                        <div className="flex gap-6">
                                                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg ${(n.type === 'new_salon_registration' || n.type === 'registration') ? 'bg-indigo-500 text-white shadow-indigo-200' : 'bg-primary text-white shadow-primary/20'}`}>
                                                                {(n.type === 'new_salon_registration' || n.type === 'registration') ? <Building2 size={28} /> : <Bell size={28} />}
                                                            </div>
                                                            <div className="flex-1 flex flex-col gap-4">
                                                                <div className="flex items-center justify-between">
                                                                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${(n.type === 'new_salon_registration' || n.type === 'registration') ? 'bg-indigo-100 text-indigo-600' : 'bg-primary/10 text-primary'}`}>
                                                                        {(n.type === 'new_salon_registration' || n.type === 'registration') ? "Yangi Salon Tasdiqlash" : "Xabar"}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic opacity-60">
                                                                        {new Date(n.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-lg md:text-xl font-bold text-slate-800 leading-tight italic tracking-tight">{n.message}</p>

                                                                {n.salonDetails && (
                                                                    <div className="bg-white/80 backdrop-blur-xl border border-indigo-100/50 rounded-[2rem] p-6 flex flex-col gap-4 mt-2 shadow-sm">
                                                                        <div className="flex items-center gap-4">
                                                                            <User size={18} className="text-indigo-400" />
                                                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{n.salonDetails.owner_name}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-4">
                                                                            <Phone size={18} className="text-indigo-400" />
                                                                            <span className="text-xs font-bold text-slate-700 tracking-widest">{n.salonDetails.owner_phone}</span>
                                                                        </div>
                                                                        {n.salonDetails.description && (
                                                                            <p className="text-[10px] text-slate-500 font-bold italic line-clamp-2 mt-1 leading-relaxed border-t border-slate-100 pt-3">
                                                                                "{n.salonDetails.description}"
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {(n.type === 'new_salon_registration' || n.type === 'registration') && (
                                                            <div className="flex gap-4">
                                                                <button
                                                                    onClick={async () => {
                                                                        if (n.type === 'new_salon_registration') {
                                                                            await handleRejectNewRegistration(n);
                                                                        } else {
                                                                            await deleteShop(n.id);
                                                                            refreshShops();
                                                                        }
                                                                    }}
                                                                    className="flex-1 h-14 bg-white border border-red-100 text-red-500 rounded-[1.5rem] font-bold text-[11px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
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
                                                                    className="flex-[2] h-14 bg-emerald-500 text-white rounded-[1.5rem] font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all"
                                                                >
                                                                    Tasdiqlash
                                                                </button>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )) : (
                                                    <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-30 py-20">
                                                        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
                                                            <Bell size={48} strokeWidth={1} />
                                                        </div>
                                                        <p className="text-[11px] font-bold uppercase text-slate-400 tracking-[0.5em] italic">Hozircha bo'sh</p>
                                                    </div>
                                                )}
                                            </div>

                                            {notifications.length > 0 && (
                                                <div className="p-8 md:p-10 border-t border-slate-100 bg-slate-50/50 shrink-0">
                                                    <button
                                                        onClick={() => setNotifications([])}
                                                        className="w-full h-16 bg-slate-900 text-white rounded-[2rem] font-bold text-[11px] uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all"
                                                    >
                                                        Barchasini tozalash
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
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed bottom-32 left-4 right-4 md:left-auto md:right-8 md:w-[400px] z-[9999] bg-slate-900/95 backdrop-blur-2xl text-white p-6 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/10 flex items-center gap-6 overflow-hidden"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute -right-20 -top-20 w-40 h-40 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />

                        <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-2xl shadow-emerald-500/40 relative z-10">
                            <Bell size={28} className="animate-bounce" />
                        </div>

                        <div className="flex flex-col gap-1.5 flex-1 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400">Yangi Bildirishnoma</span>
                            </div>
                            <p className="text-base font-bold italic tracking-tight leading-tight">{newNotificationToast}</p>
                        </div>

                        <button
                            onClick={() => setNewNotificationToast(null)}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all relative z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* Progress bar at the bottom */}
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 8, ease: "linear" }}
                            className="absolute bottom-0 left-0 h-1.5 bg-emerald-500/50"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col px-6">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        {activeTab === 'gateway' && <SuperGatewayTab />}
                        {activeTab === 'salons' && <SuperSalonsTab />}
                        {activeTab === 'super-users' && <SuperUsersTab />}
                        {activeTab === 'settings' && <div className="py-32 text-center text-slate-300 font-bold uppercase tracking-[0.5em] italic">Yaqinda...</div>}
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
