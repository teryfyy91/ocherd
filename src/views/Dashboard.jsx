import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, CheckCircle, Clock, Trash2,
    MonitorPlay, Users, Phone, Scissors,
    ChevronLeft, Plus, LayoutGrid, Store,
    ArrowRight, MapPin, MoreVertical, AlertTriangle, Check,
    BarChart3, TrendingUp, Star, MessageSquare, X, Camera, LogOut
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabase';

const CustomTimePicker = ({ label, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hour, minute] = (value || "09:00").split(':');

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ["00", "15", "30", "45"];

    const handleSelect = (newH, newM) => {
        onChange(`${newH}:${newM}`);
    };

    return (
        <div className="flex flex-col gap-2 relative z-[60]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-50 border-slate-200 px-6 py-4 rounded-2xl text-slate-800 font-bold cursor-pointer flex items-center justify-between hover:bg-slate-100 transition-all border"
            >
                <span className="text-sm">{hour}:{minute}</span>
                <Clock size={16} className="text-slate-400" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 z-[110] bg-white shadow-2xl rounded-2xl p-4 flex gap-3 mt-2 min-w-[220px] border border-slate-100"
                        >
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase text-slate-400 text-center opacity-50">HR</span>
                                <div className="h-48 overflow-y-auto scrollbar-hide flex flex-col gap-1">
                                    {hours.map(h => (
                                        <button
                                            key={h}
                                            onClick={() => handleSelect(h, minute)}
                                            className={`py-2 rounded-lg font-black text-sm transition-all ${h === hour ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="w-[1px] bg-slate-100 my-2" />
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase text-slate-400 text-center opacity-50">MIN</span>
                                <div className="h-48 overflow-y-auto scrollbar-hide flex flex-col gap-1">
                                    {minutes.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => handleSelect(hour, m)}
                                            className={`py-2 rounded-lg font-black text-sm transition-all ${m === minute ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        shopInfo, setShopInfo, updateShopInfo,
        queue, updateBookingStatus, deleteBooking,
        myShops, loadingShops, deleteShop,
        reviews, sendNotification, signOut
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
    const [salonImageFile, setSalonImageFile] = useState(null);
    const [salonImagePreview, setSalonImagePreview] = useState(null);
    const salonFileInputRef = React.useRef(null);

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

        let imageUrl = formData.imageUrl;

        if (salonImageFile) {
            try {
                const fileExt = salonImageFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, salonImageFile);

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(fileName);
                    imageUrl = urlData.publicUrl;
                }
            } catch (err) {
                console.error("Image upload error:", err);
            }
        }

        const result = await updateShopInfo({ ...formData, imageUrl });
        if (result && (result.success || !result.error)) {
            showToast("Muvaffaqiyatli saqlandi!");
            setIsEditing(false);
            setSalonImageFile(null);
            if (firstTime) {
                await sendNotification("Yangi salon qabul qilasizmi?");
                navigate('/success');
            }
        }
    };

    const handleSalonImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSalonImageFile(file);
            setSalonImagePreview(URL.createObjectURL(file));
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
        setSalonImagePreview(null);
        setSalonImageFile(null);
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
        setSalonImagePreview(null);
        setSalonImageFile(null);
    };

    if (viewMode === 'list') {
        return (
            <div className="flex flex-col gap-10 pb-32 pt-6">
                <div className="flex flex-col gap-6 mt-4">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic italic leading-none">Meniki</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Salonlar boshqaruvi</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={signOut} className="bg-red-50 text-red-500 rounded-2xl p-4 shadow-sm hover:bg-red-500 hover:text-white transition-all">
                                <LogOut size={24} />
                            </button>
                            <button onClick={handleAddNew} className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl hover:scale-105 active:scale-95 transition-all">
                                <Plus size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {loadingShops ? (
                    <div className="flex flex-col gap-6">
                        {[1, 2].map(i => <div key={i} className="h-44 w-full bg-slate-50 border border-slate-100 rounded-3xl animate-pulse" />)}
                    </div>
                ) : myShops.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-24 text-center flex flex-col items-center gap-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]"
                    >
                        <div className="w-24 h-auto flex items-center justify-center overflow-hidden">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-black text-slate-800 uppercase italic">Salonlar topilmadi</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] max-w-[200px] mx-auto">
                                Birinchi salonni qo'shish uchun + ni bosing
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {myShops.map((shop, index) => (
                            <motion.div
                                key={shop.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleSelectShop(shop)}
                                className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 relative overflow-hidden group cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-primary overflow-hidden border border-slate-100">
                                            {shop.imageUrl ? (
                                                <img src={shop.imageUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-3 opacity-20" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-xl font-black text-slate-800 uppercase italic group-hover:text-primary transition-colors">{shop.name}</h3>
                                            <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><Clock size={12} /> {shop.workingHours?.start} - {shop.workingHours?.end}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShopToDelete(shop);
                                            setDeleteModalOpen(true);
                                        }}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Delete Modal */}
                <AnimatePresence>
                    {deleteModalOpen && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 text-center">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModalOpen(false)} className="absolute inset-0 bg-white/80 backdrop-blur-md" />
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-2xl relative z-10 max-w-sm w-full">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
                                <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase italic">Ishonchingiz komilmi?</h2>
                                <p className="text-slate-400 text-xs font-bold mb-8 uppercase tracking-widest leading-loose">"{shopToDelete?.name}" butunlay o'chib ketadi.</p>
                                <div className="flex flex-col gap-3">
                                    <button onClick={async () => { await deleteShop(shopToDelete.id); setDeleteModalOpen(false); showToast("O'chirildi!"); }} className="py-4 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-200">Ha, o'chirish</button>
                                    <button onClick={() => setDeleteModalOpen(false)} className="py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest">Bekor qilish</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Success Toast */}
                <AnimatePresence>
                    {successToast && (
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-3 text-xs uppercase tracking-widest">
                            <Check size={16} className="text-primary" /> {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Management Mode
    return (
        <div className="flex flex-col gap-8 pb-32 pt-6">
            <header className="flex flex-col gap-6 mt-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewMode('list')} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm"><ChevronLeft size={24} /></button>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">{shopInfo.name}</h1>
                        <p className="text-primary font-black text-[9px] uppercase tracking-[0.4em] mt-1">Hozirda faol</p>
                    </div>
                </div>
                <div className="flex overflow-x-auto scrollbar-hide flex-nowrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                    {[
                        { id: 'queue', icon: Users, label: 'Navbat' },
                        { id: 'stats', icon: BarChart3, label: 'Statistika' },
                        { id: 'reviews', icon: Star, label: 'Izohlar' },
                        { id: 'settings', icon: Settings, label: 'Sozlamalar' }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setManagementTab(tab.id)} className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${managementTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                            <tab.icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            <div className="min-h-[500px]">
                {managementTab === 'queue' && (
                    <div className="flex flex-col gap-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-[2.5rem] border border-emerald-100 bg-emerald-50 shadow-sm">
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Qabulda</p>
                                <p className="text-3xl font-black text-slate-800">{confirmedQueue.length}</p>
                            </div>
                            <div className="p-6 rounded-[2.5rem] border border-amber-100 bg-amber-50 shadow-sm">
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1">Kutilmoqda</p>
                                <p className="text-3xl font-black text-slate-800">{pendingQueue.length}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-800 uppercase italic">Bugunlik navbat</h2>
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full">{queue.length} kishi</span>
                            </div>
                            <div className="flex flex-col gap-4">
                                {pendingQueue.map(item => (
                                    <motion.div key={item.id} layout className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <h4 className="font-black text-slate-800 text-lg italic">{item.name}</h4>
                                            <p className="text-[10px] text-amber-600/60 font-black uppercase tracking-widest">{item.service} • {item.time}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => updateBookingStatus(item.id, 'Waiting')} className="px-6 py-3 bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-200">Qabul</button>
                                        </div>
                                    </motion.div>
                                ))}
                                {confirmedQueue.map((item, idx) => (
                                    <motion.div key={item.id} layout className={`bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-xl shadow-slate-100 flex items-center justify-between relative overflow-hidden ${item.status === 'In progress' ? 'border-primary/30 ring-2 ring-primary/5' : ''}`}>
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${item.status === 'In progress' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>
                                                {idx + 1}
                                            </div>
                                            <div onClick={() => setSelectedUserDetails(item)} className="flex flex-col gap-1 cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-slate-800 text-lg uppercase italic">{item.name}</h4>
                                                    {item.status === 'In progress' && <span className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest animate-pulse">Service</span>}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.service} • {item.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {item.status === 'In progress' ? (
                                                <button onClick={() => updateBookingStatus(item.id, 'Done')} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl">Tugatish</button>
                                            ) : (
                                                <button onClick={() => updateBookingStatus(item.id, 'In progress')} className="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Boshlash</button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {queue.length === 0 && (
                                    <div className="py-24 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 shadow-sm"><Users size={32} /></div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Hozircha hech kim yo'q</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {managementTab === 'stats' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Mijozlar</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black">{completedToday.length}</p>
                                    <span className="text-[10px] text-primary font-black">+12%</span>
                                </div>
                            </div>
                            <div className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Daromad</p>
                                <p className="text-3xl font-black text-slate-800">{incomeToday.toLocaleString()}</p>
                                <p className="text-[9px] font-black text-slate-300 mt-1 uppercase">So'm</p>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-xl shadow-slate-100 h-[400px]">
                            <h3 className="text-lg font-black text-slate-800 uppercase italic mb-8">Haftalik statistika</h3>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dynamicStatsData}>
                                        <defs>
                                            <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                                        <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', background: '#FFFFFF', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', color: '#1e293b' }} />
                                        <Area type="monotone" dataKey="customers" stroke="#7C3AED" strokeWidth={5} fill="url(#colorWave)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                )}

                {managementTab === 'reviews' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                        <section className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-xl">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-xl font-black text-slate-800 uppercase italic">Mijozlar fikri</h3>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-slate-800">{avgRating}</div>
                                    <div className="flex gap-0.5 justify-end"><Star size={12} className="fill-amber-400 text-amber-400 border-none" /></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                {reviews.length === 0 ? (
                                    <div className="py-24 text-center flex flex-col items-center gap-4 opacity-30">
                                        <MessageSquare size={48} />
                                        <p className="text-xs font-black uppercase tracking-widest">Hozircha izohlar yo'q</p>
                                    </div>
                                ) : reviews.map((review, idx) => (
                                    <div key={review.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center font-black text-primary uppercase">{(review.user_name || 'U')[0]}</div>
                                                <h5 className="font-black text-slate-800 text-sm">{review.user_name || 'Mijoz'}</h5>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />)}
                                            </div>
                                        </div>
                                        <p className="text-slate-500 font-bold text-sm italic leading-relaxed">"{review.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </motion.div>
                )}

                {managementTab === 'settings' && (
                    <div className="flex flex-col gap-8 max-w-xl mx-auto">
                        <section className="bg-white border border-slate-100 p-8 md:p-10 rounded-[3rem] shadow-2xl">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"><Settings size={28} /></div>
                                <h3 className="text-2xl font-black text-slate-800 uppercase italic">Sozlamalar</h3>
                            </div>
                            <form onSubmit={handleSave} className="flex flex-col gap-8">
                                <div className="flex flex-col items-center gap-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salon rasmi</label>
                                    <div
                                        onClick={() => salonFileInputRef.current?.click()}
                                        className="relative w-full h-56 rounded-[2.5rem] cursor-pointer group overflow-hidden border-2 border-dashed border-slate-100 bg-slate-50"
                                    >
                                        {salonImagePreview || formData.imageUrl ? (
                                            <img src={salonImagePreview || formData.imageUrl} alt="Salon" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                                                <Camera size={40} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Rasm yuklash</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <Camera size={32} className="text-white" />
                                        </div>
                                        <input ref={salonFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleSalonImageChange} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salon nomi</label>
                                    <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none text-slate-800 font-bold focus:border-primary transition-all" required />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <CustomTimePicker label="Ochilish" value={formData.workingHours?.start || '09:00'} onChange={val => setFormData({ ...formData, workingHours: { ...formData.workingHours, start: val } })} />
                                    <CustomTimePicker label="Yopilish" value={formData.workingHours?.end || '18:00'} onChange={val => setFormData({ ...formData, workingHours: { ...formData.workingHours, end: val } })} />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Xizmatlar</label>
                                    <div className="flex flex-col gap-3">
                                        <input type="text" value={serviceInput} onChange={e => setServiceInput(e.target.value)} className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-slate-800 font-bold text-sm" placeholder="Xizmat nomi..." />
                                        <div className="flex gap-3">
                                            <input type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)} className="flex-1 bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-slate-800 font-bold text-sm" placeholder="Narxi..." />
                                            <button type="button" onClick={addService} className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus /></button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {(formData.services || []).map((service, idx) => {
                                            const p = typeof service === 'string' && service.startsWith('{') ? JSON.parse(service) : service;
                                            const sN = typeof p === 'object' ? p.name : p;
                                            const sP = typeof p === 'object' ? p.price : 50000;
                                            return (
                                                <div key={idx} className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black text-slate-600 flex items-center gap-3 border border-slate-100">
                                                    <span>{sN} • {sP.toLocaleString()}</span>
                                                    <button onClick={() => removeService(sN)} className="text-red-400 p-1 hover:bg-red-50 rounded-lg"><X size={14} /></button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-6 bg-primary text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all">Saqlash</button>
                            </form>
                        </section>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            <AnimatePresence>
                {selectedUserDetails && (
                    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 text-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUserDetails(null)} className="absolute inset-0 bg-white/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white border border-slate-100 p-10 rounded-[3rem] max-w-sm w-full relative z-10 shadow-2xl">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-6"><Users size={40} /></div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mijoz ma'lumotlari</h3>
                            <h2 className="text-2xl font-black text-slate-800 mb-8 uppercase italic leading-none">{selectedUserDetails.name}</h2>
                            <div className="flex flex-col gap-4 text-left mb-10">
                                <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex items-center gap-4">
                                    <Phone size={18} className="text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase">Telefon</span>
                                        <a href={`tel:${selectedUserDetails.phone}`} className="text-slate-800 font-bold">{selectedUserDetails.phone}</a>
                                    </div>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex items-center gap-4">
                                    <Scissors size={18} className="text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase">Xizmat turi</span>
                                        <span className="text-slate-800 font-bold">{selectedUserDetails.service}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUserDetails(null)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest">Yopish</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {successToast && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-3 text-xs uppercase tracking-widest">
                        <Check size={16} className="text-primary" /> {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
