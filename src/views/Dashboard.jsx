import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, CheckCircle, Clock, Trash2,
    MonitorPlay, Users, Phone, Scissors,
    ChevronLeft, Plus, LayoutGrid, Store,
    ArrowRight, MapPin, MoreVertical, AlertTriangle, Check,
    BarChart3, TrendingUp, Star, MessageSquare, X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        shopInfo, setShopInfo, updateShopInfo,
        queue, updateBookingStatus, deleteBooking,
        myShops, loadingShops, deleteShop,
        reviews
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

    const handleSave = async (e) => {
        e.preventDefault();
        const firstTime = !shopInfo.id;
        const result = await updateShopInfo(formData);
        if (result && (result.success || !result.error)) {
            showToast("Muvaffaqiyatli saqlandi!");
            setIsEditing(false);
            if (firstTime) navigate('/success');
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
        const dataMap = days.reduce((acc, day) => {
            acc[day] = { name: day, customers: 0, income: 0 };
            return acc;
        }, {});
        queue.forEach(item => {
            if (item.status === 'Done' && item.createdAt) {
                const date = new Date(item.createdAt);
                const dayName = days[date.getDay()];
                dataMap[dayName].customers += 1;
                dataMap[dayName].income += (item.price || 50000);
            }
        });
        return ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(day => dataMap[day]);
    };

    const dynamicStatsData = getStatsData();
    const todayStr = new Date().toISOString().split('T')[0];
    const completedToday = queue.filter(q => q.status === 'Done' && q.createdAt?.startsWith(todayStr));
    const incomeToday = completedToday.reduce((acc, q) => acc + (q.price || 50000), 0);
    const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1) : "5.0";

    const handleAddNew = () => {
        setShopInfo({ name: '', services: [], workingHours: { start: '09:00', end: '18:00' } });
        setViewMode('manage');
        setIsEditing(true);
        setManagementTab('settings');
    };

    if (viewMode === 'list') {
        return (
            <div className="flex flex-col gap-10 pb-32">
                <div className="flex flex-col gap-6 mt-4">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl font-black text-white tracking-tight">Mening salonlarim</h1>
                            <p className="text-text-muted font-medium">Barcha bizneslaringizni boshqaring</p>
                        </div>
                        <button onClick={handleAddNew} className="btn-primary flex items-center gap-2 !py-4">
                            <Plus size={20} /> Salon qo'shish
                        </button>
                    </div>
                </div>

                {loadingShops ? (
                    <div className="flex flex-col gap-6">
                        {[1, 2].map(i => <div key={i} className="h-44 w-full skeleton" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {myShops.map((shop, index) => (
                            <motion.div
                                key={shop.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleSelectShop(shop)}
                                className="glass-card p-8 group cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-bg transition-all">
                                            <Store size={32} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors">{shop.name}</h3>
                                            <div className="flex items-center gap-4 text-xs font-bold text-text-muted">
                                                <span className="flex items-center gap-1.5"><Clock size={14} /> {shop.workingHours?.start} - {shop.workingHours?.end}</span>
                                                <span className="flex items-center gap-1.5"><Users size={14} /> Bugun 12 kishi</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShopToDelete(shop);
                                                setDeleteModalOpen(true);
                                            }}
                                            className="w-12 h-12 glass rounded-xl flex items-center justify-center text-text-muted/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        <ArrowRight size={24} className="text-text-muted transition-transform group-hover:translate-x-2" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Delete Modal */}
                <AnimatePresence>
                    {deleteModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-center">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModalOpen(false)} className="absolute inset-0 bg-bg/80 backdrop-blur-xl" />
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card p-10 max-w-sm w-full relative z-10">
                                <div className="w-20 h-20 bg-red-400/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} /></div>
                                <h2 className="text-2xl font-black text-white mb-2">Ishonchingiz komilmi?</h2>
                                <p className="text-text-muted text-sm font-medium mb-8">"{shopToDelete?.name}" butunlay o'chirib tashlanadi.</p>
                                <div className="flex flex-col gap-3">
                                    <button onClick={async () => { await deleteShop(shopToDelete.id); setDeleteModalOpen(false); showToast("O'chirildi!"); }} className="py-4 bg-red-500 text-white rounded-2xl font-black">Ha, o'chirish</button>
                                    <button onClick={() => setDeleteModalOpen(false)} className="py-4 glass-card border-white/5 font-black text-white">Bekor qilish</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Success Toast */}
                <AnimatePresence>
                    {successToast && (
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[110] bg-primary text-bg px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-3">
                            <Check size={20} /> {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Management Mode
    return (
        <div className="flex flex-col gap-8 pb-32">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mt-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewMode('list')} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-text-muted hover:text-white transition-colors"><ChevronLeft size={24} /></button>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-white tracking-tight">{shopInfo.name}</h1>
                        <p className="text-text-muted font-medium text-xs uppercase tracking-widest">Boshqaruv</p>
                    </div>
                </div>
                <div className="flex bg-white/5 p-1 rounded-2xl overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {[
                        { id: 'queue', icon: Users, label: 'Navbat' },
                        { id: 'stats', icon: BarChart3, label: 'Stat' },
                        { id: 'reviews', icon: Star, label: 'Izoh' },
                        { id: 'settings', icon: Settings, label: 'Sozlama' }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setManagementTab(tab.id)} className={`px-5 py-3 rounded-xl text-xs font-black transition-all ${managementTab === tab.id ? 'bg-primary text-bg' : 'text-text-muted hover:text-white'}`}>
                            <tab.icon size={16} className="inline mr-2" /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-[500px]">
                {managementTab === 'queue' && (
                    <div className="flex flex-col gap-8">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-6 border-primary/20 bg-primary/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Faol</p>
                                <p className="text-3xl font-black text-white">{confirmedQueue.length}</p>
                            </div>
                            <div className="glass-card p-6 border-amber-500/20 bg-amber-500/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Kutilmoqda</p>
                                <p className="text-3xl font-black text-white">{pendingQueue.length}</p>
                            </div>
                        </div>

                        {/* Queue List */}
                        <div className="flex flex-col gap-6">
                            <h2 className="text-xl font-bold text-white">Bugunlik navbat</h2>
                            <div className="flex flex-col gap-4">
                                {pendingQueue.map(item => (
                                    <motion.div key={item.id} layout className="glass-card p-6 border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <h4 className="font-bold text-white text-lg">{item.name}</h4>
                                            <p className="text-xs text-amber-200/60 font-bold">{item.service} • {item.time}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => updateBookingStatus(item.id, 'Waiting')} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black">Qabul</button>
                                            <button onClick={() => deleteBooking(item.id)} className="p-2 text-text-muted"><Trash2 size={18} /></button>
                                        </div>
                                    </motion.div>
                                ))}
                                {confirmedQueue.map((item, idx) => (
                                    <motion.div key={item.id} layout className={`glass-card p-6 flex items-center justify-between transition-all ${item.status === 'In progress' ? 'border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(0,200,151,0.1)]' : 'bg-white/5'}`}>
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${item.status === 'In progress' ? 'bg-primary text-bg shadow-[0_0_15px_rgba(0,200,151,0.5)]' : 'bg-white/5 text-white/40'}`}>
                                                {idx + 1}
                                            </div>
                                            <div onClick={() => setSelectedUserDetails(item)} className="flex flex-col gap-1 cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-white text-lg">{item.name}</h4>
                                                    {item.status === 'In progress' && <span className="text-[8px] bg-primary text-bg px-2 py-0.5 rounded-full font-black uppercase">Service</span>}
                                                </div>
                                                <p className="text-xs text-text-muted font-bold">{item.service} • {item.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {item.status === 'In progress' ? (
                                                <button onClick={() => updateBookingStatus(item.id, 'Done')} className="px-6 py-3 bg-primary text-bg rounded-xl font-black text-xs shadow-lg shadow-primary/20">Tugatish</button>
                                            ) : (
                                                <button onClick={() => updateBookingStatus(item.id, 'In progress')} className="px-6 py-3 glass rounded-xl font-black text-xs text-white border-white/10 hover:bg-white/10">Boshlash</button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {queue.length === 0 && <div className="py-20 text-center text-text-muted font-bold">Hech qanday bandlik yo'q</div>}
                            </div>
                        </div>
                    </div>
                )}

                {managementTab === 'stats' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-6 bg-white/5">
                                <p className="text-[10px] font-black uppercase text-text-muted mb-1">Mijozlar</p>
                                <p className="text-3xl font-black text-white">{completedToday.length}</p>
                                <div className="text-[10px] font-bold text-primary mt-2 flex items-center gap-1"><TrendingUp size={12} /> +12%</div>
                            </div>
                            <div className="glass-card p-6 bg-white/5">
                                <p className="text-[10px] font-black uppercase text-text-muted mb-1">Daromad</p>
                                <p className="text-3xl font-black text-white">{incomeToday.toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-text-muted mt-2">UZS</p>
                            </div>
                        </div>
                        <div className="glass-card p-8 bg-white/5 h-[400px]">
                            <h3 className="text-lg font-black text-white mb-8">Haftalik o'sish</h3>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dynamicStatsData}>
                                        <defs>
                                            <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00C897" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#00C897" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dy={10} />
                                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: '#0B0F14', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: 'white' }} />
                                        <Area type="monotone" dataKey="customers" stroke="#00C897" strokeWidth={4} fill="url(#colorWave)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                )}

                {managementTab === 'reviews' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                        <section className="glass-card p-8 border-white/5 bg-white/2">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-white">Mijozlar fikri</h3>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-white">{avgRating}</div>
                                    <div className="flex gap-0.5 justify-end"><Star size={12} className="fill-amber-400 text-amber-400" /></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                {reviews.length === 0 ? <div className="py-20 text-center text-text-muted font-bold">Hozircha izohlar yo'q</div> : reviews.map((review, idx) => (
                                    <div key={review.id} className="p-6 glass-card bg-white/5 border-white/5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 glass rounded-xl flex items-center justify-center font-black text-primary">{(review.user_name || 'U')[0]}</div>
                                                <h5 className="font-bold text-white text-sm">{review.user_name || 'Mijoz'}</h5>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-white/10"} />)}
                                            </div>
                                        </div>
                                        <p className="text-text-muted font-medium text-sm italic">"{review.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </motion.div>
                )}

                {managementTab === 'settings' && (
                    <div className="flex flex-col gap-8 max-w-xl mx-auto">
                        <section className="glass-card p-10 bg-white/5 border-white/10 shadow-2xl">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"><Settings size={28} /></div>
                                <h3 className="text-2xl font-black text-white">Sozlamalar</h3>
                            </div>
                            <form onSubmit={handleSave} className="flex flex-col gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Salon nomi</label>
                                    <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full glass-card bg-white/5 border-white/5 px-6 py-5 rounded-2xl outline-none text-white font-bold transition-all" required />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Ochilish</label>
                                        <input type="time" value={formData.workingHours?.start || '09:00'} onChange={e => setFormData({ ...formData, workingHours: { ...formData.workingHours, start: e.target.value } })} className="w-full glass-card bg-white/5 border-white/5 px-6 py-5 rounded-2xl text-white font-bold" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Yopilish</label>
                                        <input type="time" value={formData.workingHours?.end || '18:00'} onChange={e => setFormData({ ...formData, workingHours: { ...formData.workingHours, end: e.target.value } })} className="w-full glass-card bg-white/5 border-white/5 px-6 py-5 rounded-2xl text-white font-bold" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Xizmatlar</label>
                                    <div className="flex flex-col gap-3">
                                        <input type="text" value={serviceInput} onChange={e => setServiceInput(e.target.value)} className="glass-card bg-white/5 border-white/5 px-6 py-5 rounded-2xl text-white font-bold" placeholder="Xizmat nomi..." />
                                        <div className="flex gap-3">
                                            <input type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)} className="flex-1 glass-card bg-white/5 border-white/5 px-6 py-5 rounded-2xl text-white font-bold" placeholder="Narxi..." />
                                            <button type="button" onClick={addService} className="w-16 glass rounded-2xl text-primary border-primary flex items-center justify-center"><Plus /></button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {(formData.services || []).map((service, idx) => {
                                            const p = typeof service === 'string' && service.startsWith('{') ? JSON.parse(service) : service;
                                            const sN = typeof p === 'object' ? p.name : p;
                                            const sP = typeof p === 'object' ? p.price : 50000;
                                            return (
                                                <div key={idx} className="bg-white/5 pl-4 pr-2 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-3 border border-white/5">
                                                    <span>{sN} • {sP.toLocaleString()}</span>
                                                    <button onClick={() => removeService(sN)} className="text-red-400 p-1 hover:bg-red-400/10 rounded-lg"><X size={14} /></button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary py-5 text-xl mt-4">Saqlash</button>
                            </form>
                        </section>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            <AnimatePresence>
                {selectedUserDetails && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 text-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUserDetails(null)} className="absolute inset-0 bg-bg/80 backdrop-blur-xl" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card p-10 max-w-sm w-full relative z-10 border-white/10">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-glow"><Users size={40} /></div>
                            <h3 className="text-sm font-black text-text-muted uppercase tracking-widest mb-2">Mijoz ma'lumotlari</h3>
                            <h2 className="text-3xl font-black text-white mb-8">{selectedUserDetails.name}</h2>
                            <div className="flex flex-col gap-4 text-left mb-10">
                                <div className="glass-card p-5 border-white/5 bg-white/5 flex items-center gap-4">
                                    <Phone size={18} className="text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-text-muted uppercase">Telefon</span>
                                        <a href={`tel:${selectedUserDetails.phone}`} className="text-white font-bold">{selectedUserDetails.phone}</a>
                                    </div>
                                </div>
                                <div className="glass-card p-5 border-white/5 bg-white/5 flex items-center gap-4">
                                    <Scissors size={18} className="text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-text-muted uppercase">Xizmat</span>
                                        <span className="text-white font-bold">{selectedUserDetails.service}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUserDetails(null)} className="w-full btn-primary py-4">Yopish</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
