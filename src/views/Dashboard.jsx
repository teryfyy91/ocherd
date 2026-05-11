import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, CheckCircle, Clock, Trash2,
    MonitorPlay, Users, Phone, Scissors,
    ChevronLeft, Plus, LayoutGrid, Store,
    ArrowRight, MapPin, MoreVertical, AlertTriangle, Check,
    BarChart3, TrendingUp, Star, MessageSquare, X, Camera, LogOut,
    Search, Bell, Heart, Filter, User, Home, ShoppingBag
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
            <div className="min-h-screen bg-[#FDFCFE] flex justify-center overflow-x-hidden">
                <div className="w-full max-w-[500px] bg-white min-h-screen shadow-2xl relative pb-40">
                    <div className="bg-primary rounded-b-[3.5rem] px-6 pt-10 pb-12 shadow-2xl shadow-primary/20 relative overflow-hidden">
                        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-white/5 rounded-full blur-2xl" />

                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/50 shadow-lg bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <User className="text-white" size={28} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Xush kelibsiz!</p>
                                    <h2 className="text-white text-xl font-black italic uppercase tracking-tight leading-tight">Salon Egasi</h2>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                                    <Heart size={18} />
                                </button>
                                <button className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 relative">
                                    <Bell size={18} />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-400 rounded-full border border-white" />
                                </button>
                            </div>
                        </div>

                        <div className="relative group z-10">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Salonni qidiring..."
                                className="w-full h-15 bg-white rounded-[2rem] pl-14 pr-16 text-slate-800 font-bold placeholder:text-slate-400 outline-none shadow-2xl transition-all focus:ring-4 focus:ring-white/20"
                            />
                            <button className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="px-6 -mt-6 relative z-20 space-y-10">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-lg font-black text-slate-800 italic uppercase">Maxsus Takliflar</h3>
                                <button className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                    Hammasi <ArrowRight size={12} />
                                </button>
                            </div>
                            <div className="relative h-44 rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer active:scale-[0.98] transition-all">
                                <img
                                    src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000&auto=format&fit=crop"
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    alt="Special Offer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/40 to-transparent z-10" />
                                <div className="absolute inset-0 p-8 flex flex-col justify-center z-20">
                                    <span className="bg-white/30 backdrop-blur-md text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full w-fit mb-3 border border-white/20">Siz uchun</span>
                                    <h4 className="text-white text-2xl font-black italic max-w-[180px] leading-tight mb-2 uppercase tracking-tight">Biznesingizni Rivojlantiring!</h4>
                                    <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Premium xizmatlar</p>
                                </div>
                                <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl z-10" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-lg font-black text-slate-800 italic uppercase">Xizmatlar</h3>
                                <button className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                    Hammasi <ArrowRight size={12} />
                                </button>
                            </div>
                            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                                {[
                                    { icon: Scissors, label: 'Soch' },
                                    { icon: User, label: 'Soqol' },
                                    { icon: Star, label: 'Stil' },
                                    { icon: Camera, label: 'Foto' },
                                    { icon: MapPin, label: 'Manzil' }
                                ].map((service, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2.5 shrink-0">
                                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 flex items-center justify-center text-primary group hover:bg-primary hover:text-white transition-all cursor-pointer">
                                            <service.icon size={22} />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{service.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            {loadingShops ? (
                                <div className="h-64 w-full bg-slate-50 rounded-[3rem] animate-pulse" />
                            ) : myShops.length === 0 ? (
                                <div className="py-20 text-center flex flex-col items-center gap-6 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem]">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-xl"><Store size={32} /></div>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-slate-800 font-black uppercase italic text-lg text-center mx-auto">Salon mavjud emas</p>
                                        <button onClick={handleAddNew} className="text-primary font-black uppercase tracking-widest text-[10px] bg-primary/10 px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-all">Ro'yxatdan o'tkazish</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6 pb-10">
                                    {myShops.map((shop, index) => (
                                        <motion.div
                                            key={shop.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => handleSelectShop(shop)}
                                            className="bg-white border border-slate-100 rounded-[3rem] p-4 shadow-2xl shadow-slate-200/60 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
                                        >
                                            <div className="flex flex-col gap-4">
                                                <div className="h-44 w-full rounded-[2.5rem] overflow-hidden relative">
                                                    {shop.imageUrl ? (
                                                        <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200"><Store size={48} /></div>
                                                    )}
                                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl">
                                                        <Star size={14} className="fill-amber-400 text-amber-400" />
                                                        <span className="text-[12px] font-black text-slate-800">4.8</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setShopToDelete(shop); setDeleteModalOpen(true); }}
                                                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-xl"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-center px-2 pb-2">
                                                    <div className="flex flex-col gap-1">
                                                        <h3 className="text-lg font-black text-slate-800 uppercase italic group-hover:text-primary transition-colors leading-none">{shop.name}</h3>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full"><Clock size={10} className="text-primary" /> {shop.workingHours?.start} - {shop.workingHours?.end}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-primary text-[10px] font-black italic border-b-2 border-primary/20">ACTIVE</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-6 right-6 z-[100]">
                        <div className="bg-slate-900 rounded-[2.5rem] p-2.5 shadow-2xl flex items-center justify-between shadow-slate-900/40 border border-white/5">
                            <button className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20 transition-all"><Home size={22} /></button>
                            <button className="w-14 h-14 rounded-2xl text-slate-500 flex items-center justify-center hover:text-white transition-all"><Search size={22} /></button>
                            <button className="w-14 h-14 rounded-2xl text-slate-500 flex items-center justify-center hover:text-white transition-all"><ShoppingBag size={22} /></button>
                            <button onClick={signOut} className="w-14 h-14 rounded-2xl text-slate-500 flex items-center justify-center hover:text-red-400 transition-all"><LogOut size={22} /></button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {deleteModalOpen && (
                            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 text-center">
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-lg" />
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white border border-slate-100 p-10 rounded-[3.5rem] shadow-2xl relative z-10 max-w-sm w-full">
                                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/10"><AlertTriangle size={40} /></div>
                                    <h2 className="text-2xl font-black text-slate-800 mb-3 uppercase italic leading-tight text-center">O'chirilsinmi?</h2>
                                    <p className="text-slate-400 text-xs font-bold mb-8 uppercase tracking-widest leading-loose text-center">"{shopToDelete?.name}" butunlay o'chib ketadi.</p>
                                    <div className="flex flex-col gap-3">
                                        <button onClick={async () => { await deleteShop(shopToDelete.id); setDeleteModalOpen(false); showToast("O'chirildi!"); }} className="py-5 bg-red-500 text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-red-500/40 active:scale-95 transition-all">Ha, o'chirish</button>
                                        <button onClick={() => setDeleteModalOpen(false)} className="py-5 bg-slate-100 text-slate-400 rounded-[1.8rem] font-black text-sm uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all">Bekor qilish</button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {successToast && (
                            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-36 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white px-8 py-5 rounded-3xl font-black shadow-2xl flex items-center gap-4 text-xs uppercase tracking-widest border border-white/10 backdrop-blur-xl">
                                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg"><Check size={16} /></div>
                                {successMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCFE] flex justify-center overflow-x-hidden">
            <div className="w-full max-w-[500px] bg-white min-h-screen shadow-2xl relative pb-32">
                <header className="bg-primary rounded-b-[3.5rem] px-6 pt-12 pb-8 shadow-2xl shadow-primary/20 relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="flex flex-col gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setViewMode('list')} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-xl hover:bg-white/30 transition-all">
                                <ChevronLeft size={24} />
                            </button>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-black text-white tracking-tight uppercase italic leading-none">{shopInfo.name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <p className="text-white/70 font-black text-[9px] uppercase tracking-[0.3em]">Hozirda faol</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex overflow-x-auto scrollbar-hide flex-nowrap items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-[2rem] border border-white/10">
                            {[
                                { id: 'queue', icon: Users, label: 'Navbat' },
                                { id: 'stats', icon: BarChart3, label: 'Statistika' },
                                { id: 'reviews', icon: Star, label: 'Izohlar' },
                                { id: 'settings', icon: Settings, label: 'Sozlamalar' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setManagementTab(tab.id)}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[1.5rem] text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${managementTab === tab.id ? 'bg-white text-primary shadow-xl scale-[1.02]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                >
                                    <tab.icon size={14} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <main className="px-6 py-10 relative z-20">
                    <div className="min-h-[500px]">
                        {managementTab === 'queue' && (
                            <div className="flex flex-col gap-10">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 relative z-10">Qabulda</p>
                                        <p className="text-4xl font-black text-slate-800 relative z-10 leading-none">{confirmedQueue.length}</p>
                                    </div>
                                    <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 relative z-10">Kutilmoqda</p>
                                        <p className="text-4xl font-black text-slate-800 relative z-10 leading-none">{pendingQueue.length}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h2 className="text-xl font-black text-slate-800 uppercase italic">Bugunlik navbat</h2>
                                        <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{queue.length} kishi</span>
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        {pendingQueue.map(item => (
                                            <motion.div key={item.id} layout className="bg-amber-50/50 border-2 border-dashed border-amber-200 p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl shadow-amber-200/20">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-amber-200/30 rounded-2xl flex items-center justify-center text-amber-600">
                                                        <Clock size={24} />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <h4 className="font-black text-slate-800 text-lg italic uppercase">{item.name}</h4>
                                                        <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">{item.service} • {item.time}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => updateBookingStatus(item.id, 'Waiting')} className="px-8 py-4 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all">Qabul</button>
                                            </motion.div>
                                        ))}
                                        {confirmedQueue.map((item, idx) => (
                                            <motion.div key={item.id} layout className={`bg-white border border-slate-100 p-6 rounded-[3rem] shadow-2xl shadow-slate-200/40 flex items-center justify-between relative overflow-hidden group ${item.status === 'In progress' ? 'border-primary/30 ring-4 ring-primary/5' : ''}`}>
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center font-black text-xl shadow-xl transition-all duration-500 ${item.status === 'In progress' ? 'bg-primary text-white shadow-primary/30 rotate-3' : 'bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary group-hover:rotate-3'}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div onClick={() => setSelectedUserDetails(item)} className="flex flex-col gap-1 cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="font-black text-slate-800 text-xl uppercase italic leading-none group-hover:text-primary transition-colors">{item.name}</h4>
                                                            {item.status === 'In progress' && (
                                                                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">Band</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{item.service} • <span className="text-primary">{item.time}</span></p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {item.status === 'In progress' ? (
                                                        <button onClick={() => updateBookingStatus(item.id, 'Done')} className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all">
                                                            <Check size={24} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => updateBookingStatus(item.id, 'In progress')} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary hover:text-primary transition-all">Boshlash</button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                        {queue.length === 0 && (
                                            <div className="py-24 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center gap-6 opacity-60">
                                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-xl"><Users size={32} /></div>
                                                <div className="flex flex-col gap-2">
                                                    <p className="text-slate-800 font-black uppercase italic text-lg">Navbat bo'sh</p>
                                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Hozircha mijozlar mavjud emas</p>
                                                </div>
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
                                            <div className="flex gap-0.5 justify-end"><Star size={12} className="fill-amber-400 text-amber-400" /></div>
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
                </main>

                <AnimatePresence>
                    {selectedUserDetails && (
                        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 text-center">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUserDetails(null)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-lg" />
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white border border-slate-100 p-10 rounded-[3.5rem] max-w-sm w-full relative z-10 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                                <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/10 relative z-10"><User size={48} /></div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Mijoz ma'lumotlari</h3>
                                <h2 className="text-2xl font-black text-slate-800 mb-10 uppercase italic leading-none">{selectedUserDetails.name}</h2>
                                <div className="flex flex-col gap-5 text-left mb-10">
                                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex items-center gap-5 transition-all hover:bg-white hover:shadow-xl hover:border-primary/20 group">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all"><Phone size={20} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Telefon</span>
                                            <a href={`tel:${selectedUserDetails.phone}`} className="text-slate-800 font-bold group-hover:text-primary transition-colors">{selectedUserDetails.phone}</a>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex items-center gap-5 transition-all hover:bg-white hover:shadow-xl hover:border-primary/20 group">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all"><Scissors size={20} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Xizmat turi</span>
                                            <span className="text-slate-800 font-bold group-hover:text-primary transition-colors">{selectedUserDetails.service}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUserDetails(null)} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/30 hover:scale-105 active:scale-95 transition-all">Yopish</button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {successToast && (
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black shadow-2xl flex items-center gap-4 text-xs uppercase tracking-widest border border-white/10 backdrop-blur-xl">
                            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg"><Check size={16} /></div>
                            {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Dashboard;
