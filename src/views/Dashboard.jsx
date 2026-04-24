import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, CheckCircle, Clock, Trash2,
    MonitorPlay, Users, Phone, Scissors,
    ChevronLeft, Plus, LayoutGrid, Store,
    ArrowRight, MapPin, MoreVertical, AlertTriangle, Check,
    BarChart3, TrendingUp, Star, MessageSquare
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        shopInfo, setShopInfo, updateShopInfo,
        queue, updateBookingStatus, deleteBooking,
        myShops, loadingShops, deleteShop,
        reviews, fetchReviews
    } = useStore();

    const [viewMode, setViewMode] = useState('list'); // 'list' or 'manage'
    const [managementTab, setManagementTab] = useState('queue'); // 'queue', 'stats', 'settings', 'reviews'
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(shopInfo || {});
    const [serviceInput, setServiceInput] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [shopToDelete, setShopToDelete] = useState(null);
    const [successToast, setSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedUserDetails, setSelectedUserDetails] = useState(null);
    const [chartType, setChartType] = useState('customers'); // 'customers' or 'income'

    const showToast = (msg) => {
        setSuccessMessage(msg);
        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 3000);
    };

    // Handle initial state and direct access
    useEffect(() => {
        if (shopInfo && shopInfo.id) {
            setViewMode('manage');
            setFormData(shopInfo || {});
        } else {
            setViewMode('list');
        }
    }, [shopInfo?.id]);

    useEffect(() => {
        setFormData(shopInfo || {});
    }, [shopInfo]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);


    const handleSave = async (e) => {
        e.preventDefault();
        const firstTime = !shopInfo.id;
        const result = await updateShopInfo(formData);

        if (result && (result.success || !result.error)) {
            showToast(t('settingsSaved') || "Sozlamalar saqlandi!");
            setIsEditing(false);
            if (firstTime) {
                navigate('/success');
            }
        } else {
            alert("Xatolik: " + (result?.error || "Saqlash imkoni bo'lmadi"));
        }
    };

    const addService = () => {
        const currentServices = formData.services || [];
        if (serviceInput.trim() && servicePrice.trim()) {
            const newService = { name: serviceInput.trim(), price: parseInt(servicePrice) };
            setFormData({ ...formData, services: [...currentServices, newService] });
            setServiceInput('');
            setServicePrice('');
        }
    };

    const removeService = (serviceName) => {
        const currentServices = formData.services || [];
        setFormData({ ...formData, services: currentServices.filter(s => (typeof s === 'string' ? s : s.name) !== serviceName) });
    };

    const pendingQueue = queue.filter(q => q.status === 'Pending');
    const confirmedQueue = queue.filter(q => q.status === 'Waiting' || q.status === 'In progress');
    const completedQueue = queue.filter(q => q.status === 'Done');

    const handleSelectShop = (shop) => {
        setShopInfo(shop);
        setViewMode('manage');
        setManagementTab('queue');
    };

    const getStatsData = () => {
        const days = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
        // Initialize with 0
        const dataMap = days.reduce((acc, day) => {
            acc[day] = { name: day, customers: 0, income: 0 };
            return acc;
        }, {});

        queue.forEach(item => {
            if (item.status === 'Done' && item.createdAt) {
                const date = new Date(item.createdAt);
                const dayName = days[date.getDay()];
                dataMap[dayName].customers += 1;
                dataMap[dayName].income += (item.price || 50000); // Use real price from booking
            }
        });

        // Reorder to start from Monday (Du)
        return ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(day => dataMap[day]);
    };

    const dynamicStatsData = getStatsData();
    const todayStr = new Date().toISOString().split('T')[0];
    const completedToday = queue.filter(q => q.status === 'Done' && q.createdAt?.startsWith(todayStr));
    const incomeToday = completedToday.reduce((acc, q) => acc + (q.price || 50000), 0);

    // Percentage growth mock logic based on real data (comparing to yesterday if possible, but let's keep it simple for now)
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const completedYesterday = queue.filter(q => q.status === 'Done' && q.createdAt?.startsWith(yesterdayStr)).length;
    const growth = completedYesterday === 0 ? 100 : Math.round(((completedToday.length - completedYesterday) / completedYesterday) * 100);

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
        : "5.0";

    const handleAddNew = () => {
        setShopInfo({ name: '', services: [], workingHours: { start: '09:00', end: '18:00' } });
        setViewMode('manage');
        setIsEditing(true);
        setManagementTab('settings');
    };

    // --- RENDER MODES ---

    // 1. Overview List Mode
    if (viewMode === 'list') {
        return (
            <div className="max-w-6xl mx-auto py-10 px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl font-black text-dark tracking-tighter mb-3">
                            {t('myShops')}
                        </h1>
                        <p className="text-gray-500 text-lg font-medium">
                            {t('allControlled')}
                        </p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="group flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all shadow-2xl shadow-primary/20 active:scale-95"
                    >
                        <Plus size={24} />
                        {t('newSalon')}
                    </button>
                </div>

                {loadingShops ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {myShops.map((shop, index) => (
                            <motion.div
                                key={shop.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -8 }}
                                className="bg-white group cursor-pointer rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all relative overflow-hidden"
                                onClick={() => handleSelectShop(shop)}
                            >
                                {/* Background Decoration */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                                <div className="relative z-10">
                                    <div className="absolute -top-2 -right-2 z-20">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === shop.id ? null : shop.id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-dark hover:bg-gray-100 rounded-full transition-all"
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        <AnimatePresence>
                                            {activeMenuId === shop.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                                    className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-30"
                                                >
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShopToDelete(shop);
                                                            setDeleteModalOpen(true);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 font-black text-sm transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                        {t('delete') || "O'chirish"}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                                        <Store size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-dark mb-2 group-hover:text-primary transition-colors truncate">
                                        {shop.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-400 font-bold text-sm mb-6">
                                        <Clock size={16} />
                                        {shop.workingHours?.start} — {shop.workingHours?.end}
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                            <span className="text-xs font-black text-primary uppercase tracking-widest">Active</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-dark font-black text-sm group-hover:translate-x-2 transition-transform">
                                            {t('edit')} <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        ))}

                        {myShops.length === 0 && (
                            <div
                                onClick={handleAddNew}
                                className="col-span-full border-2 border-dashed border-gray-200 rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:bg-gray-50/50 transition-all cursor-pointer group"
                            >
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Plus size={40} />
                                </div>
                                <p className="text-2xl font-black">{t('noShops')}</p>
                                <p className="font-bold mt-2 opacity-60 underline">{t('newSalon')}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {deleteModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setDeleteModalOpen(false)}
                                className="absolute inset-0 bg-dark/40 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl overflow-hidden"
                            >
                                {/* Modal Background Decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50"></div>

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-8 rotate-3">
                                        <AlertTriangle size={40} />
                                    </div>

                                    <h2 className="text-3xl font-black text-dark tracking-tight mb-4">
                                        {t('deleteShopConfirm')}
                                    </h2>

                                    <p className="text-gray-500 font-bold mb-10 leading-relaxed">
                                        <span className="text-red-500 font-black">"{shopToDelete?.name}"</span> {t('deleteWarning')}
                                    </p>

                                    <div className="flex flex-col w-full gap-3">
                                        <button
                                            onClick={async () => {
                                                const result = await deleteShop(shopToDelete.id);
                                                if (result.success) {
                                                    setDeleteModalOpen(false);
                                                    setShopToDelete(null);
                                                    showToast("Salon muvaffaqiyatli o'chirildi");
                                                } else {
                                                    alert("Xatolik: " + result.error);
                                                }
                                            }}
                                            className="w-full bg-red-500 text-white py-5 rounded-2xl font-black text-lg hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-95"
                                        >
                                            {t('yesDelete')}
                                        </button>

                                        <button
                                            onClick={() => setDeleteModalOpen(false)}
                                            className="w-full bg-gray-50 text-gray-500 py-5 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all active:scale-95"
                                        >
                                            {t('cancel') || "Bekor qilish"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Success Toast */}
                <AnimatePresence>
                    {successToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] bg-primary text-white px-8 py-4 rounded-[2rem] shadow-2xl shadow-primary/30 flex items-center gap-4 border border-white/20 backdrop-blur-md"
                        >
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Check size={18} className="text-white" />
                            </div>
                            <span className="font-black tracking-tight">{successMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


        );
    }

    // 2. Management Mode
    return (
        <div className="relative min-h-[calc(100vh-120px)] pb-20">
            {/* Header / Sub-Nav */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setViewMode('list')}
                        className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-dark hover:bg-gray-50 transition-all group"
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-dark tracking-tight">{shopInfo.name}</h1>
                        <p className="text-gray-500 font-bold mt-1 uppercase tracking-widest text-xs opacity-60">Boshqaruv paneli</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white/60 gap-1 shadow-sm">
                    {[
                        { id: 'queue', icon: Users, label: 'Navbat' },
                        { id: 'stats', icon: BarChart3, label: 'Statistika' },
                        { id: 'reviews', icon: Star, label: 'Izohlar' },
                        { id: 'settings', icon: Settings, label: 'Sozlamalar' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setManagementTab(tab.id);
                                if (tab.id === 'settings') setIsEditing(true);
                                else setIsEditing(false);
                            }}
                            className={`flex items-center gap-3 px-6 py-3.5 rounded-[1.5rem] text-sm font-black transition-all ${managementTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-400 hover:text-dark hover:bg-white'}`}
                        >
                            <tab.icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                    <div className="w-[1px] h-8 bg-gray-200 mx-2 hidden sm:block"></div>
                    <Link to="/display" target="_blank" className="p-4 bg-dark text-white rounded-2xl hover:bg-gray-800 transition-all group shadow-lg">
                        <MonitorPlay size={20} className="group-hover:scale-110 transition-transform" />
                    </Link>
                </div>
            </div>


            <div className="max-w-7xl mx-auto">
                {managementTab === 'queue' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Stats Sidebar */}
                        <div className="lg:col-span-4 h-fit sticky top-24">
                            <div className="bg-primary text-white rounded-[3rem] p-8 shadow-2xl shadow-primary/20 relative overflow-hidden mb-8">
                                <div className="relative z-10">
                                    <h4 className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Navbat holati</h4>
                                    <p className="text-3xl font-black mb-6">Bugun faol</p>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold opacity-80">Jami mijozlar</span>
                                            <span className="text-xl font-black">{queue.length}</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/20 rounded-full">
                                            <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${(queue.filter(q => q.status === 'Done').length / (queue.length || 1)) * 100}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
                                            <span>Boshlandi</span>
                                            <span>Tugadi</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-black text-dark mb-6 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={16} className="text-primary" /> Bugunlik xulosa
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                        <span className="text-xs font-bold text-gray-500">Kutilmoqda</span>
                                        <span className="font-black text-amber-500">{pendingQueue.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                        <span className="text-xs font-bold text-gray-500">Xizmatda</span>
                                        <span className="font-black text-secondary">{queue.filter(q => q.status === 'In progress').length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                        <span className="text-xs font-bold text-gray-500">Tugallandi</span>
                                        <span className="font-black text-primary">{completedQueue.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Queue Central Area */}
                        <div className="lg:col-span-8 space-y-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm min-h-[500px]">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-3xl font-black text-dark tracking-tight">{t('todaysQueue')}</h2>
                                    <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        Live
                                    </span>
                                </div>

                                <div className="space-y-8">
                                    {/* Pending */}
                                    {pendingQueue.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-4">Tasdiqlash kutilmoqda</h4>
                                            {pendingQueue.map(item => (
                                                <div key={item.id} className="bg-amber-50/50 border-2 border-dashed border-amber-200 p-6 rounded-[2rem] flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><Clock size={20} /></div>
                                                        <div className="cursor-pointer group/name" onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedUserDetails(item);
                                                        }}>
                                                            <h5 className="font-black text-dark group-hover/name:text-amber-600 transition-colors">{item.name}</h5>
                                                            <p className="text-xs font-bold text-gray-400">{item.service} • {item.time}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => updateBookingStatus(item.id, 'Waiting')} className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-500/20">{t('accept')}</button>
                                                        <button onClick={() => deleteBooking(item.id)} className="p-2.5 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Active Queue */}
                                    {confirmedQueue.length === 0 && pendingQueue.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><Users size={32} className="text-gray-200" /></div>
                                            <p className="text-gray-400 font-bold">{t('noActiveBookings')}</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {confirmedQueue.map((item, idx) => (
                                                <motion.div key={item.id} layout className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${item.status === 'In progress' ? 'border-secondary bg-secondary/5' : 'border-gray-50 bg-white hover:border-gray-100 shadow-sm'}`}>
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${item.status === 'In progress' ? 'bg-secondary text-white ring-4 ring-secondary/20' : 'bg-gray-50 text-gray-400'}`}>#{idx + 1}</div>
                                                        <div className="cursor-pointer group/name" onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedUserDetails(item);
                                                        }}>
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="font-black text-xl text-dark tracking-tight group-hover/name:text-primary transition-colors">{item.name}</h4>
                                                                {item.status === 'In progress' && <span className="text-[8px] bg-secondary text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{t('inService')}</span>}
                                                            </div>
                                                            <p className="text-[12px] font-bold text-gray-400 mt-1 flex items-center gap-4">
                                                                <span className="flex items-center gap-1.5"><Scissors size={14} className="text-primary" /> {item.service}</span>
                                                                <span className="flex items-center gap-1.5"><Clock size={14} /> {item.time}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {item.status === 'Waiting' ? (
                                                            <button onClick={() => updateBookingStatus(item.id, 'In progress')} className="px-6 py-3 bg-secondary text-white rounded-xl font-black text-xs shadow-lg shadow-secondary/20">{t('startBtn')}</button>
                                                        ) : (
                                                            <button onClick={() => updateBookingStatus(item.id, 'Done')} className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs shadow-lg shadow-primary/20">{t('completeBtn')}</button>
                                                        )}
                                                        <button onClick={() => deleteBooking(item.id)} className="p-3 text-gray-300 hover:text-red-500 rounded-xl transition-all"><Trash2 size={22} /></button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}

                {managementTab === 'stats' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                                <div className="relative z-10">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Kunlik mijozlar</p>
                                    <h4 className="text-4xl font-black text-dark tracking-tight">{completedToday.length}</h4>
                                    <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        <TrendingUp size={14} className={growth < 0 ? 'rotate-180' : ''} />
                                        {growth >= 0 ? '+' : ''}{growth}% {growth >= 0 ? "o'sish" : "pasayish"}
                                    </p>
                                </div>
                                <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:scale-110 transition-transform"><Users size={64} /></div>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                                <div className="relative z-10">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Kunlik daromad</p>
                                    <h4 className="text-4xl font-black text-dark tracking-tight">{incomeToday.toLocaleString()}</h4>
                                    <p className="text-xs font-bold text-gray-400 mt-2">Valyuta: UZS</p>
                                </div>
                                <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:scale-110 transition-transform"><BarChart3 size={64} /></div>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                                <div className="relative z-10">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">O'rtacha reyting</p>
                                    <h4 className="text-4xl font-black text-dark tracking-tight">{avgRating}</h4>
                                    <div className="flex gap-1 mt-2">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-8 text-amber-500/10 group-hover:scale-110 transition-transform"><Star size={64} /></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                                <div>
                                    <h3 className="text-2xl font-black text-dark tracking-tight">Haftalik diagramma</h3>
                                    <p className="text-gray-400 font-bold">{chartType === 'customers' ? 'Mijozlar tashrifi va aktivligini kuzating' : 'Daromadlar dinamikasini kuzating'}</p>
                                </div>
                                <div className="flex bg-gray-50 p-1 rounded-xl">
                                    <button
                                        onClick={() => setChartType('customers')}
                                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${chartType === 'customers' ? 'bg-white shadow-sm text-dark' : 'text-gray-400 hover:text-dark'}`}
                                    >
                                        Mijozlar
                                    </button>
                                    <button
                                        onClick={() => setChartType('income')}
                                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${chartType === 'income' ? 'bg-white shadow-sm text-dark' : 'text-gray-400 hover:text-dark'}`}
                                    >
                                        Daromad
                                    </button>
                                </div>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dynamicStatsData}>
                                        <defs>
                                            <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={chartType === 'customers' ? '#10b981' : '#f59e0b'} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={chartType === 'customers' ? '#10b981' : '#f59e0b'} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} dx={-10} tickFormatter={(value) => chartType === 'income' ? (value >= 1000 ? `${value / 1000}k` : value) : value} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                                            formatter={(value) => [chartType === 'income' ? `${value.toLocaleString()} UZS` : value, chartType === 'income' ? 'Daromad' : 'Mijozlar']}
                                        />
                                        <Area type="monotone" dataKey={chartType} stroke={chartType === 'customers' ? '#10b981' : '#f59e0b'} strokeWidth={5} fillOpacity={1} fill="url(#colorWave)" animationDuration={2000} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                )}

                {managementTab === 'reviews' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
                        <section className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-dark tracking-tight">Mijozlar fikri</h3>
                                    <p className="text-gray-400 font-bold">Xizmat sifati bo'yicha real izohlar</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-dark">{avgRating}</div>
                                    <div className="flex gap-0.5 justify-end">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className={i <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-100"} />)}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-20 text-gray-400 font-bold">Hozircha izohlar yo'q</div>
                                ) : (
                                    reviews.map((review, idx) => (
                                        <motion.div
                                            key={review.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="p-8 bg-gray-50 rounded-[2.5rem] border border-transparent hover:border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/40"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-primary border border-gray-100 shadow-sm">{(review.user_name || 'U')[0]}</div>
                                                    <div>
                                                        <h5 className="font-black text-dark text-lg">{review.user_name || 'Mijoz'}</h5>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Yaqinda'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={16} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-100"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 font-bold text-lg leading-relaxed italic">"{review.comment}"</p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </section>
                    </motion.div>
                )}

                {managementTab === 'settings' && (
                    <div className="max-w-2xl mx-auto">
                        <section className="bg-white rounded-[3rem] p-10 border border-white/60 shadow-xl">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"><Settings size={28} /></div>
                                <h3 className="text-2xl font-black text-dark">Salon sozlamalari</h3>
                            </div>

                            <form onSubmit={handleSave} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('shopName')}</label>
                                    <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-black text-lg" required />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('openTime')}</label>
                                        <input type="time" value={formData.workingHours?.start || '09:00'} onChange={e => setFormData({ ...formData, workingHours: { ...formData.workingHours, start: e.target.value } })} className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-black" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('closeTime')}</label>
                                        <input type="time" value={formData.workingHours?.end || '18:00'} onChange={e => setFormData({ ...formData, workingHours: { ...formData.workingHours, end: e.target.value } })} className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-black" />
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('services')}</label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input type="text" value={serviceInput} onChange={e => setServiceInput(e.target.value)} className="flex-[2] px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-black" placeholder="Hizmat nomi (masalan: Soch olish)..." />
                                        <input type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)} className="flex-1 px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-black" placeholder="Narxi (UZS)..." />
                                        <button type="button" onClick={addService} className="bg-dark text-white px-8 py-5 rounded-2xl font-black hover:bg-gray-800 transition-all flex items-center justify-center"><Plus /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {(formData.services || []).map((service, idx) => {
                                            let parsedService = service;
                                            if (typeof service === 'string' && service.startsWith('{')) {
                                                try {
                                                    parsedService = JSON.parse(service);
                                                } catch (e) {
                                                    parsedService = service;
                                                }
                                            }

                                            const sName = typeof parsedService === 'object' ? parsedService.name : parsedService;
                                            const sPrice = typeof parsedService === 'object' ? parsedService.price : 50000;

                                            return (
                                                <div key={idx} className="bg-white border border-gray-100 pl-5 pr-3 py-3 rounded-2xl text-sm font-black shadow-sm flex items-center gap-4 group min-w-[140px]">
                                                    <div className="flex flex-col">
                                                        <span className="text-dark truncate max-w-[120px]">{sName}</span>
                                                        <span className="text-[11px] text-emerald-500 font-bold uppercase tracking-tight">{sPrice.toLocaleString()} UZS</span>
                                                    </div>
                                                    <button type="button" onClick={() => removeService(sName)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-auto">×</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl hover:bg-emerald-600 shadow-2xl shadow-primary/30 active:scale-95 transition-all mt-4">{t('saveChanges')}</button>
                            </form>
                        </section>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            <AnimatePresence>
                {selectedUserDetails && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUserDetails(null)}
                            className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl overflow-hidden border border-gray-100"
                        >
                            {/* Decoration */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

                            <div className="flex flex-col items-center text-center mt-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-primary mb-6 shadow-inner">
                                    <Users size={40} />
                                </div>

                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Mijoz ma'lumotlari</h3>
                                <h2 className="text-3xl font-black text-dark mb-6">{selectedUserDetails.name}</h2>

                                <div className="w-full space-y-4 mb-8">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary transition-colors">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                            <Phone size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Telefon raqami</p>
                                            <a href={`tel:${selectedUserDetails.phone}`} className="text-lg font-black text-dark hover:text-primary transition-colors">
                                                {selectedUserDetails.phone || 'Noma\'lum'}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                                            <Scissors size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Xizmat</p>
                                            <p className="text-lg font-black text-dark">{selectedUserDetails.service}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedUserDetails(null)}
                                    className="w-full py-4 bg-dark text-white rounded-2xl font-black text-lg hover:bg-gray-800 transition-all active:scale-95"
                                >
                                    Yopish
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
