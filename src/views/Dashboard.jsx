import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, CheckCircle, Clock, Trash2,
    MonitorPlay, Users, Phone, Scissors,
    ChevronLeft, Plus, LayoutGrid, Store,
    ArrowRight, MapPin, MoreVertical, AlertTriangle, Check,
    BarChart3, TrendingUp, Star, MessageSquare, X, Camera, LogOut,
    Search, Bell, Heart, Filter, User, Home, ShoppingBag,
    Wallet, Receipt, Tag, PlusCircle, MinusCircle, DollarSign,
    Play
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
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
                                <span className="text-[8px] font-bold uppercase text-slate-400 text-center opacity-50">HR</span>
                                <div className="h-48 overflow-y-auto scrollbar-hide flex flex-col gap-1">
                                    {hours.map(h => (
                                        <button
                                            key={h}
                                            onClick={() => handleSelect(h, minute)}
                                            className={`py-2 rounded-lg font-bold text-sm transition-all ${h === hour ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="w-[1px] bg-slate-100 my-2" />
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[8px] font-bold uppercase text-slate-400 text-center opacity-50">MIN</span>
                                <div className="h-48 overflow-y-auto scrollbar-hide flex flex-col gap-1">
                                    {minutes.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => handleSelect(hour, m)}
                                            className={`py-2 rounded-lg font-bold text-sm transition-all ${m === minute ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
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

const SessionTimer = ({ bookingId, createdAt }) => {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        const getStartTime = () => {
            const stored = localStorage.getItem('booking_start_' + bookingId);
            if (stored) return parseInt(stored);
            if (createdAt) return new Date(createdAt).getTime();
            return Date.now();
        };

        const startTime = getStartTime();

        const updateTimer = () => {
            const diffMs = Date.now() - startTime;
            const diffSec = Math.max(0, Math.floor(diffMs / 1000));
            const hours = Math.floor(diffSec / 3600);
            const minutes = Math.floor((diffSec % 3600) / 60);
            const seconds = diffSec % 60;

            const pad = (num) => num.toString().padStart(2, '0');

            if (hours > 0) {
                setElapsed(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
            } else {
                setElapsed(`${pad(minutes)}:${pad(seconds)}`);
            }
        };

        updateTimer();
        const timerId = setInterval(updateTimer, 1000);
        return () => clearInterval(timerId);
    }, [bookingId, createdAt]);

    return (
        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping duration-1000" />
            <span>{elapsed}</span>
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
        reviews, sendNotification, signOut, addBooking
    } = useStore();

    const [viewMode, setViewMode] = useState('list'); // 'list' or 'manage'
    const [managementTab, setManagementTab] = useState('queue');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(shopInfo || {});

    // === WALK-IN CLIENT & TIMER STATES ===
    const [showWalkInModal, setShowWalkInModal] = useState(false);
    const [walkInName, setWalkInName] = useState('Mijoz');
    const [selectedService, setSelectedService] = useState(null);
    const [isCustomService, setIsCustomService] = useState(false);
    const [customServiceName, setCustomServiceName] = useState('');
    const [customServicePrice, setCustomServicePrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Wrapped update & delete to track timers in localStorage
    const handleUpdateStatus = async (id, status) => {
        if (status === 'In progress') {
            localStorage.setItem('booking_start_' + id, Date.now().toString());
        } else if (status === 'Done') {
            localStorage.removeItem('booking_start_' + id);
        }
        await updateBookingStatus(id, status);
    };

    const handleDeleteBooking = async (id) => {
        localStorage.removeItem('booking_start_' + id);
        await deleteBooking(id);
    };
    const [primaryImageFile, setPrimaryImageFile] = useState(null);
    const [primaryPreview, setPrimaryPreview] = useState(shopInfo?.imageUrl || '');
    const [serviceInput, setServiceInput] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [shopToDelete, setShopToDelete] = useState(null);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [successToast, setSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedUserDetails, setSelectedUserDetails] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const primaryImageInputRef = React.useRef(null);
    const fileInputRef = React.useRef(null);

    // === XARAJATLAR ===
    const expensesKey = `expenses_${shopInfo?.id || 'default'}`;
    const [expenses, setExpenses] = useState(() => {
        try { return JSON.parse(localStorage.getItem(expensesKey)) || []; } catch { return []; }
    });
    const [expenseName, setExpenseName] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('Umumiy');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        try { localStorage.setItem(expensesKey, JSON.stringify(expenses)); } catch {}
    }, [expenses, expensesKey]);

    const addExpense = () => {
        if (!expenseName.trim() || !expenseAmount.trim()) return;
        const newExp = {
            id: Date.now(),
            name: expenseName.trim(),
            amount: parseInt(expenseAmount),
            category: expenseCategory,
            date: expenseDate,
            createdAt: new Date().toISOString()
        };
        setExpenses(prev => [newExp, ...prev]);
        setExpenseName('');
        setExpenseAmount('');
        setExpenseDate(new Date().toISOString().split('T')[0]);
    };

    const deleteExpense = (id) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const expenseCategories = ['Umumiy', 'Ijara', 'Asbob-uskunalar', 'Ish haqi', 'Mahsulotlar', 'Kommunal', 'Reklama', 'Boshqa'];
    const totalExpenses = React.useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);
    const thisMonthExpenses = React.useMemo(() => {
        const m = new Date().toISOString().slice(0, 7);
        return expenses.filter(e => e.date?.startsWith(m)).reduce((s, e) => s + (e.amount || 0), 0);
    }, [expenses]);

    const showToast = (msg) => {
        setSuccessMessage(msg);
        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 3000);
    };

    useEffect(() => {
        if (shopInfo && shopInfo.id) {
            setViewMode('manage');
            setFormData(shopInfo || {});
            setPrimaryPreview(shopInfo?.imageUrl || '');
        } else {
            setViewMode('list');
        }
    }, [shopInfo?.id]);

    useEffect(() => {
        setFormData(shopInfo || {});
        setPrimaryPreview(shopInfo?.imageUrl || '');
    }, [shopInfo]);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Auto-add any pending service inputs before saving
            let updatedServices = [...(formData.services || [])];
            if (serviceInput.trim() && servicePrice.trim()) {
                const newService = { name: serviceInput.trim(), price: parseInt(servicePrice) };
                updatedServices.push(newService);
                setServiceInput('');
                setServicePrice('');
            }

            const firstTime = !shopInfo.id;
            let finalGallery = [...(formData.gallery || [])];

            // Upload primary salon image if changed
            let finalImageUrl = formData.imageUrl || '';
            if (primaryImageFile) {
                try {
                    const fileExt = primaryImageFile.name.split('.').pop();
                    const fileName = `primary_${Date.now()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('avatars')
                        .upload(fileName, primaryImageFile);
                    if (!uploadError) {
                        const { data: urlData } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(fileName);
                        finalImageUrl = urlData.publicUrl;
                    } else {
                        throw uploadError;
                    }
                } catch (err) {
                    console.error("Primary image upload error:", err);
                    throw new Error(`Salon rasmi yuklashda xatolik: ${err.message}`);
                }
            }

            // Upload gallery images
            if (galleryFiles.length > 0) {
                for (const file of galleryFiles) {
                    try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                        const { error: uploadError } = await supabase.storage
                            .from('avatars')
                            .upload(fileName, file);

                        if (!uploadError) {
                            const { data: urlData } = supabase.storage
                                .from('avatars')
                                .getPublicUrl(fileName);
                            finalGallery.push(urlData.publicUrl);
                        } else {
                            if (uploadError.message.includes('Bucket not found')) {
                                throw new Error("Supabase-da 'avatars' nomli public bucket topilmadi. Iltimos, bazada bucket yarating.");
                            }
                            throw uploadError;
                        }
                    } catch (err) {
                        console.error("Gallery upload error:", err);
                        throw new Error(`Rasm yuklashda xatolik: ${err.message || 'Noma\'lum xato'}`);
                    }
                }
            }

            const result = await updateShopInfo({
                ...formData,
                services: updatedServices,
                imageUrl: finalImageUrl,
                gallery: finalGallery
            });

            if (result && result.success) {
                showToast("Muvaffaqiyatli saqlandi!");
                setIsEditing(false);
                setPrimaryImageFile(null);
                setGalleryFiles([]);
                setGalleryPreviews([]);
                setManagementTab('queue');
                if (firstTime) {
                    await sendNotification("Yangi salon qabul qilasizmi?");
                }
            } else {
                alert(result?.error || "Saqlashda xatolik yuz berdi");
            }
        } catch (err) {
            console.error("Critical save error:", err);
            alert(`Kutilmagan xatolik: ${err.message || 'Noma\'lum xato'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setGalleryFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setGalleryPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeGalleryImage = (index, isNew) => {
        if (isNew) {
            const newFiles = [...galleryFiles];
            newFiles.splice(index, 1);
            setGalleryFiles(newFiles);

            const newPreviews = [...galleryPreviews];
            newPreviews.splice(index, 1);
            setGalleryPreviews(newPreviews);
        } else {
            const newGallery = [...(formData.gallery || [])];
            newGallery.splice(index, 1);
            setFormData({ ...formData, gallery: newGallery });
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

    const pendingQueue = React.useMemo(() => queue.filter(q => q.status === 'Pending'), [queue]);
    const confirmedQueue = React.useMemo(() => queue.filter(q => q.status === 'Waiting' || q.status === 'In progress'), [queue]);
    const completedQueue = React.useMemo(() => queue.filter(q => q.status === 'Done'), [queue]);

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

    const dynamicStatsData = React.useMemo(() => getStatsData(), [queue]);
    const todayStr = React.useMemo(() => new Date().toISOString().split('T')[0], []);
    const completedToday = React.useMemo(() => queue.filter(q => q.status === 'Done' && q.createdAt?.startsWith(todayStr)), [queue, todayStr]);
    const incomeToday = React.useMemo(() => completedToday.reduce((acc, q) => acc + (q.price || 50000), 0), [completedToday]);
    const avgRating = React.useMemo(() => reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1) : "5.0", [reviews]);

    const handleAddNew = () => {
        setShopInfo({ name: '', services: [], workingHours: { start: '09:00', end: '18:00' } });
        setViewMode('manage');
        setIsEditing(true);
        setManagementTab('settings');
    };

    if (viewMode === 'list') {
        return (
            <div className="min-h-screen bg-[#FDFCFE] flex justify-center overflow-x-hidden">
                <div className="w-full max-w-[500px] bg-white min-h-screen shadow-2xl relative pb-40">
                    <header className="bg-primary rounded-b-[4rem] px-8 pt-16 pb-14 relative overflow-hidden shadow-2xl shadow-primary/20">
                        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-white/10 rounded-full blur-[100px] animate-pulse" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-white/5 rounded-full blur-[80px]" />

                        <div className="relative z-10 flex justify-between items-start mb-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[7px] font-bold text-white/50 uppercase tracking-widest">BarberOS</span>
                                <h1 className="text-base font-bold text-white uppercase tracking-tight">Mening Salonim</h1>
                            </div>
                            <button onClick={signOut} className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-all">
                                <LogOut size={20} />
                            </button>
                        </div>

                        <div className="relative z-10">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-2 rounded-3xl flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                                    <User size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">Salon Egasi</span>
                                    <span className="text-xs font-bold text-white uppercase tracking-tight">{localStorage.getItem('currentUserPhone')}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="px-8 mt-12 space-y-12">
                        <section className="flex flex-col gap-6">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-lg font-bold text-slate-800 uppercase italic tracking-tight leading-none">Salon Faoliyati</h3>
                            </div>

                            {loadingShops ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => <div key={i} className="h-40 bg-slate-50 rounded-[3rem] animate-pulse" />)}
                                </div>
                            ) : myShops.length === 0 ? (
                                <div className="py-20 text-center flex flex-col items-center gap-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[4rem]">
                                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 shadow-xl"><Store size={40} /></div>
                                    <div className="flex flex-col gap-2">
                                        <h4 className="text-slate-800 font-bold uppercase italic text-base tracking-tight leading-none">Salon Topilmadi</h4>
                                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest opacity-60">Hali hech qanday salon ro'yxatga olinmagan</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {myShops.map((shop) => (
                                        <motion.div
                                            key={shop.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => handleSelectShop(shop)}
                                            className="group relative bg-white border border-slate-100 rounded-[3rem] p-5 shadow-2xl shadow-slate-100 cursor-pointer active:scale-[0.98] transition-all hover:border-primary/20"
                                        >
                                            <div className="flex gap-6 items-center">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0 shadow-lg relative">
                                                    {shop.imageUrl ? (
                                                        <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-200"><Store size={32} /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
                                                    </div>
                                                    <h4 className="text-base font-bold text-slate-800 uppercase italic leading-none truncate group-hover:text-primary transition-colors">{shop.name}</h4>
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Clock size={12} className="text-primary" />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{shop.workingHours?.start} - {shop.workingHours?.end}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setShopToDelete(shop); setDeleteModalOpen(true); }}
                                                    className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-xl shadow-red-500/10"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <AnimatePresence>
                        {deleteModalOpen && (
                            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-10 rounded-[4rem] shadow-2xl max-w-sm w-full relative overflow-hidden text-center">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16" />
                                    <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/10 relative z-10"><AlertTriangle size={48} /></div>
                                    <h3 className="text-xl font-bold text-slate-800 uppercase italic mb-3">O'chirilsinmi?</h3>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10 leading-loose opacity-60">"{shopToDelete?.name}" barcha ma'lumotlari bilan birga butunlay o'chiriladi.</p>
                                    <div className="flex flex-col gap-4">
                                        <button onClick={async () => { await deleteShop(shopToDelete.id); setDeleteModalOpen(false); showToast("O'chirildi!"); }} className="w-full h-16 bg-red-500 text-white rounded-[2rem] font-bold text-xs uppercase tracking-widest shadow-2xl shadow-red-500/40 active:scale-95 transition-all">Ha, O'chirish</button>
                                        <button onClick={() => setDeleteModalOpen(false)} className="w-full h-16 bg-slate-100 text-slate-400 rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Bekor Qilish</button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCFE] flex justify-center overflow-x-hidden">
            <div className="w-full max-w-[500px] bg-white min-h-screen shadow-2xl relative pb-32">
                <header className="bg-primary rounded-b-[4rem] px-8 pt-16 pb-12 shadow-2xl shadow-primary/20 relative overflow-hidden transition-all duration-700">
                    <div className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-white/10 rounded-full blur-[120px]" />

                    <div className="relative z-10 flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setShopInfo({ name: '', services: [], workingHours: { start: '09:00', end: '18:00' } });
                                        setViewMode('list');
                                    }}
                                    className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <div className="flex flex-col">
                                    <h1 className="text-base font-bold text-white uppercase leading-none">{shopInfo.name}</h1>
                                    <span className="text-[7px] font-bold text-white/50 uppercase tracking-widest mt-1">Salon Boshqaruvi</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowWalkInModal(true)}
                                    className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/30 transition-all shadow-lg hover:scale-105 active:scale-95 animate-fade-in"
                                    title="Walk-in qabul"
                                >
                                    <Plus size={20} />
                                </button>
                                <button onClick={() => setManagementTab('settings')} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/30 transition-all">
                                    <Settings size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] flex gap-1 items-center overflow-x-auto scrollbar-hide">
                            {[
                                { id: 'queue', icon: Users, label: 'Navbat' },
                                { id: 'stats', icon: BarChart3, label: 'Stats' },
                                { id: 'expenses', icon: Wallet, label: 'Xarajat' },
                                { id: 'reviews', icon: Star, label: 'Izohlar' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setManagementTab(tab.id)}
                                    className={`flex-1 min-w-[90px] flex flex-col items-center gap-1.5 py-4 rounded-[2rem] transition-all duration-500 ${managementTab === tab.id ? 'bg-white text-primary shadow-2xl shadow-primary/30 scale-105' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                >
                                    <tab.icon size={18} />
                                    <span className="text-[8px] font-bold uppercase tracking-widest">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    <AnimatePresence mode="wait">
                        {managementTab === 'queue' && (
                            <motion.div key="queue" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex flex-col gap-16">
                                <section className="grid grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50 relative overflow-visible group">
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10 px-1">Qabulda</p>
                                        <p className="text-xl font-bold text-slate-800 tracking-tight relative z-10 leading-none px-1">{confirmedQueue.length}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50 relative overflow-visible group">
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10 px-1">Kutilmoqda</p>
                                        <p className="text-xl font-bold text-slate-800 tracking-tight relative z-10 leading-none px-1">{pendingQueue.length}</p>
                                    </div>
                                </section>

                                <section className="space-y-8 pt-4">
                                    <div className="flex justify-between items-center px-2">
                                        <h2 className="text-sm font-bold text-slate-800 uppercase leading-none tracking-tight">Bugungi Reja</h2>
                                        <span className="flex items-center gap-2 bg-slate-900 text-white text-[7px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">{queue.length} mijoz</span>
                                    </div>

                                    <div className="space-y-6">
                                        {pendingQueue.map((item) => (
                                            <motion.div key={item.id} layout className="bg-amber-50/30 border-2 border-dashed border-amber-200 p-6 rounded-[3rem] flex items-center justify-between shadow-xl shadow-amber-50">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 bg-white rounded-[1.8rem] flex items-center justify-center text-amber-500 shadow-xl shadow-amber-100">
                                                        <Clock size={28} />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <h4 className="font-bold text-slate-800 text-base uppercase leading-none">{item.name}</h4>
                                                        <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest">{item.service} • {item.time}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleUpdateStatus(item.id, 'Waiting')} className="h-14 px-8 bg-amber-500 text-white rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-amber-200 active:scale-95 transition-all hover:brightness-110">Qabul</button>
                                            </motion.div>
                                        ))}

                                        {confirmedQueue.map((item, idx) => (
                                            <motion.div key={item.id} layout className={`relative bg-white border border-slate-100 p-6 rounded-[3.5rem] shadow-2xl shadow-slate-100 flex items-center justify-between overflow-hidden group ${item.status === 'In progress' ? 'ring-4 ring-primary/5 border-primary/20 scale-[1.02]' : ''}`}>
                                                {item.status === 'In progress' && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 animate-pulse" />}

                                                <div className="flex items-center gap-6 relative z-10">
                                                    <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center font-bold text-xl transition-all duration-700 ${item.status === 'In progress' ? 'bg-primary text-white shadow-2xl shadow-primary/40 rotate-6' : 'bg-slate-50 text-slate-300'}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div onClick={() => setSelectedUserDetails(item)} className="flex flex-col gap-1 cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="font-bold text-slate-800 text-base uppercase leading-none group-hover:text-primary transition-colors">{item.name}</h4>
                                                            {item.status === 'In progress' && <SessionTimer bookingId={item.id} createdAt={item.createdAt} />}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Scissors size={12} className="text-primary/40" />
                                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{item.service} • <span className="text-primary">{item.time}</span></p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="relative z-10">
                                                    {item.status === 'In progress' ? (
                                                        <button onClick={() => handleUpdateStatus(item.id, 'Done')} className="w-16 h-16 bg-slate-900 text-white rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-slate-900/40 hover:scale-110 active:scale-95 transition-all">
                                                            <Check size={28} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleUpdateStatus(item.id, 'In progress')} className="h-14 px-8 bg-white border border-slate-200 text-slate-400 rounded-[1.5rem] font-bold text-[10px] uppercase tracking-widest hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">Boshlash</button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}

                                        {queue.length === 0 && (
                                            <div className="py-24 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center gap-8 opacity-40">
                                                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-200 shadow-xl"><Users size={40} /></div>
                                                <div className="flex flex-col gap-2">
                                                    <h4 className="text-slate-800 font-bold uppercase text-base tracking-tight leading-none">Navbat Bo'sh</h4>
                                                    <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">Mijozlar kutishmoqda...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {managementTab === 'stats' && (
                            <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900 px-6 py-6 rounded-[2rem] flex flex-col items-center text-center shadow-xl relative overflow-hidden">
                                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl" />
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Bugun</span>
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <span className="text-2xl font-bold text-white">{completedToday.length}</span>
                                            <TrendingUp size={16} className="text-primary" />
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Mijozlar</span>
                                    </div>
                                    <div className="bg-white border border-slate-100 px-6 py-6 rounded-[2rem] flex flex-col items-center text-center shadow-xl shadow-slate-50">
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Daromad</span>
                                        <span className="text-2xl font-bold text-slate-800 mb-1.5">{incomeToday.toLocaleString()}</span>
                                        <span className="text-[8px] font-bold text-primary uppercase tracking-widest">SO'M</span>
                                    </div>
                                </div>

                                <section className="bg-white border border-slate-100 p-4 rounded-[2rem] shadow-xl shadow-slate-50 h-[350px]">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 px-2">Haftalik O'sish</h3>
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={dynamicStatsData}>
                                                <defs>
                                                    <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} dy={15} />
                                                <Tooltip contentStyle={{ borderRadius: '2rem', border: 'none', background: '#1e293b', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} />
                                                <Area type="monotone" dataKey="customers" stroke="#7C3AED" strokeWidth={6} fill="url(#colorWave)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {managementTab === 'expenses' && (
                            <motion.div key="expenses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">

                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900 px-6 py-6 rounded-[2rem] flex flex-col items-center text-center shadow-xl relative overflow-hidden">
                                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-red-500/20 rounded-full blur-2xl" />
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Bu Oy</span>
                                        <span className="text-xl font-bold text-white mb-1">{thisMonthExpenses.toLocaleString()}</span>
                                        <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest">SO'M</span>
                                    </div>
                                    <div className="bg-white border border-slate-100 px-6 py-6 rounded-[2rem] flex flex-col items-center text-center shadow-xl shadow-slate-50">
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Jami</span>
                                        <span className="text-xl font-bold text-slate-800 mb-1">{totalExpenses.toLocaleString()}</span>
                                        <span className="text-[8px] font-bold text-primary uppercase tracking-widest">SO'M</span>
                                    </div>
                                </div>

                                {/* Add Expense Form */}
                                <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-xl shadow-slate-50 space-y-5">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                        <PlusCircle size={18} className="text-primary" />
                                        Xarajat Qo'shish
                                    </h3>

                                    {/* Name */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nomi</label>
                                        <input
                                            type="text"
                                            placeholder="Xarajat nomi..."
                                            value={expenseName}
                                            onChange={e => setExpenseName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl text-slate-800 font-bold text-sm outline-none focus:border-primary/50 focus:bg-white transition-all"
                                        />
                                    </div>

                                    {/* Amount + Date */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Summa (so'm)</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={expenseAmount}
                                                onChange={e => setExpenseAmount(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl text-slate-800 font-bold text-sm outline-none focus:border-primary/50 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sana</label>
                                            <input
                                                type="date"
                                                value={expenseDate}
                                                onChange={e => setExpenseDate(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl text-slate-800 font-bold text-sm outline-none focus:border-primary/50 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={addExpense}
                                        disabled={!expenseName.trim() || !expenseAmount.trim()}
                                        className="w-full h-16 bg-primary text-white rounded-[2rem] font-bold text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={18} />
                                        Qo'shish
                                    </button>
                                </div>

                                {/* Expenses List */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Xarajatlar</h3>
                                        <span className="bg-slate-900 text-white text-[7px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">{expenses.length} ta</span>
                                    </div>

                                    {expenses.length === 0 ? (
                                        <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center gap-6 opacity-40">
                                            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 shadow-xl">
                                                <Wallet size={36} />
                                            </div>
                                            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Hali xarajat kiritilmagan</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {expenses.map(exp => (
                                                <motion.div
                                                    key={exp.id}
                                                    layout
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="bg-white border border-slate-100 p-5 rounded-[2.5rem] shadow-lg shadow-slate-50 flex items-center justify-between group hover:border-red-100 transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-red-50 rounded-[1.5rem] flex items-center justify-center text-red-400 shrink-0">
                                                            <Receipt size={22} />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <h4 className="font-bold text-slate-800 text-sm uppercase leading-none">{exp.name}</h4>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-[8px] font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-wider">{exp.category}</span>
                                                                <span className="text-[8px] font-bold text-slate-300 uppercase">{exp.date}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className="font-bold text-slate-800 text-sm">{(exp.amount || 0).toLocaleString()} <span className="text-[8px] text-primary">so'm</span></span>
                                                        <button
                                                            onClick={() => deleteExpense(exp.id)}
                                                            className="w-10 h-10 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {managementTab === 'reviews' && (
                            <motion.div key="reviews" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <div className="bg-white border border-slate-100 p-10 rounded-[4rem] shadow-2xl shadow-slate-100 flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-xl font-bold text-slate-800 uppercase leading-none">O'rtacha Reyting</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reviews.length} mijoz fikri</p>
                                    </div>
                                    <div className="bg-amber-50 p-6 rounded-[2.5rem] flex flex-col items-center gap-2">
                                        <span className="text-4xl font-bold text-amber-500 tracking-tighter leading-none">{avgRating}</span>
                                        <div className="flex gap-0.5"><Star size={12} className="fill-amber-500 text-amber-500" /></div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {reviews.length === 0 ? (
                                        <div className="py-24 text-center flex flex-col items-center gap-8 opacity-30">
                                            <MessageSquare size={56} />
                                            <p className="text-[11px] font-bold uppercase tracking-[0.4em]">Hali izohlar mavjud emas</p>
                                        </div>
                                    ) : reviews.map((review) => (
                                        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={review.id} className="p-8 bg-white border border-slate-100 rounded-[3.5rem] shadow-xl relative overflow-hidden group">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-primary text-lg uppercase transition-all group-hover:bg-primary group-hover:text-white group-hover:rotate-6">{(review.user_name || 'U')[0]}</div>
                                                    <div className="flex flex-col">
                                                        <h5 className="font-bold text-slate-800 text-base uppercase">{review.user_name || 'Mijoz'}</h5>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 bg-amber-50/50 p-2 rounded-xl">
                                                    {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />)}
                                                </div>
                                            </div>
                                            <p className="text-slate-500 font-bold text-sm leading-relaxed pl-2 border-l-4 border-slate-100 group-hover:border-primary/20 transition-all">"{review.comment}"</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {managementTab === 'settings' && (
                            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-12">
                                <section className="bg-white border border-slate-100 p-10 rounded-[4rem] shadow-2xl shadow-slate-100">
                                    <form onSubmit={handleSave} className="space-y-10">
                                        <div className="flex flex-col gap-4">
                                            {/* === SALON ASOSIY RASMI === */}
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] ml-2">Salon Rasmi</span>
                                            <div
                                                onClick={() => primaryImageInputRef.current?.click()}
                                                className="relative w-full h-48 rounded-[2.5rem] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group flex items-center justify-center"
                                            >
                                                {primaryPreview ? (
                                                    <>
                                                        <img src={primaryPreview} alt="Salon rasmi" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                            <div className="flex flex-col items-center gap-2 text-white">
                                                                <Camera size={28} />
                                                                <span className="text-[9px] font-bold uppercase tracking-widest">Rasmni O'zgartirish</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3 text-slate-300">
                                                        <Camera size={36} className="opacity-50" />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Salon Rasmi Qo'shish</span>
                                                        <span className="text-[8px] text-slate-400 opacity-40">Foydalanuvchilarga ko'rinadi</span>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                ref={primaryImageInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setPrimaryImageFile(file);
                                                        setPrimaryPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />

                                            {/* === GALEREYA === */}
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] ml-2 mt-4">Ishlardan Namuna (Galereya)</span>

                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Existing Gallery */}
                                                {(formData.gallery || []).map((img, idx) => (
                                                    <div key={`old-${idx}`} className="relative h-40 rounded-3xl overflow-hidden group shadow-lg">
                                                        <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeGalleryImage(idx, false)}
                                                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* New Previews */}
                                                {galleryPreviews.map((img, idx) => (
                                                    <div key={`new-${idx}`} className="relative h-40 rounded-3xl overflow-hidden group shadow-lg border-2 border-primary/20">
                                                        <img src={img} className="w-full h-full object-cover" alt="New Gallery" />
                                                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                                                            <span className="text-[8px] font-bold text-white uppercase tracking-widest bg-primary px-2 py-1 rounded-full shadow-lg">Yangi</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeGalleryImage(idx, true)}
                                                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Gallery Add Button */}
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="h-40 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-100 hover:border-primary/20 transition-all text-slate-300"
                                                >
                                                    <Plus size={32} className="opacity-50" />
                                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-50">Rasm Qo'shish</span>
                                                </div>
                                            </div>
                                            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
                                        </div>

                                        <div className="space-y-8">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Salon Nomi</label>
                                                <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-16 bg-slate-50 rounded-[2rem] px-8 text-black font-bold text-base italic uppercase tracking-tight focus:bg-white focus:shadow-2xl focus:shadow-slate-100 transition-all border-none outline-none" required />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Telefon Raqami (Mijozlar uchun)</label>
                                                <input type="tel" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full h-16 bg-slate-50 rounded-[2rem] px-8 text-black font-bold text-base italic uppercase tracking-tight focus:bg-white focus:shadow-2xl focus:shadow-slate-100 transition-all border-none outline-none" placeholder="+998..." />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <CustomTimePicker label="Ochilish" value={formData.workingHours?.start || '09:00'} onChange={val => setFormData({ ...formData, workingHours: { ...formData.workingHours, start: val } })} />
                                                <CustomTimePicker label="Yopilish" value={formData.workingHours?.end || '18:00'} onChange={val => setFormData({ ...formData, workingHours: { ...formData.workingHours, end: val } })} />
                                            </div>

                                            <div className="space-y-6">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Xizmatlar</label>
                                                <div className="bg-slate-50 p-6 rounded-[3rem] space-y-4 border border-slate-100">
                                                    <input type="text" value={serviceInput} onChange={e => setServiceInput(e.target.value)} className="w-full h-14 px-6 rounded-2xl bg-white text-sm font-bold italic uppercase transition-all outline-none border-none shadow-sm focus:shadow-lg" placeholder="Xizmat nomi..." />
                                                    <div className="flex gap-4">
                                                        <input type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)} className="flex-1 h-14 px-6 rounded-2xl bg-white text-sm font-bold italic uppercase transition-all outline-none border-none shadow-sm focus:shadow-lg" placeholder="Narxi..." />
                                                        <button type="button" onClick={addService} className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all"><Plus /></button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 pt-4">
                                                        {(formData.services || []).map((service, idx) => {
                                                            const p = typeof service === 'string' && service.startsWith('{') ? JSON.parse(service) : service;
                                                            const sN = typeof p === 'object' ? p.name : p;
                                                            const sP = typeof p === 'object' ? p.price : 50000;
                                                            return (
                                                                <div key={idx} className="bg-white px-5 py-3 rounded-2xl text-[10px] font-bold text-slate-600 flex items-center gap-4 shadow-sm border border-slate-50 group hover:border-primary/20 transition-all">
                                                                    <div className="flex flex-col">
                                                                        <span className="uppercase italic">{sN}</span>
                                                                        <span className="text-primary mt-0.5">{sP.toLocaleString()}</span>
                                                                    </div>
                                                                    <button onClick={() => removeService(sN)} className="text-red-400 hover:text-red-600 p-1"><X size={14} /></button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 mt-8">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="w-full h-18 bg-primary text-white rounded-[2.5rem] font-bold text-sm uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={signOut}
                                                className="w-full h-18 bg-red-50 text-red-500 rounded-[2.5rem] font-bold text-sm uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 border border-red-100 shadow-sm active:scale-95"
                                            >
                                                <LogOut size={18} />
                                                Chiqish
                                            </button>
                                        </div>
                                    </form>
                                </section>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <AnimatePresence>
                    {showWalkInModal && (
                        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                className="bg-white rounded-[2.5rem] max-w-md w-full relative shadow-2xl border border-slate-100 overflow-hidden"
                            >
                                {/* Header */}
                                <div className="bg-primary px-7 pt-7 pb-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12" />
                                    <div className="flex items-center justify-between relative z-10">
                                        <div>
                                            <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.3em] mb-1">Tez Qabul</p>
                                            <h3 className="text-lg font-bold text-white uppercase italic leading-tight">Yangi Mijoz</h3>
                                            <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-0.5">Walk-in</p>
                                        </div>
                                        <button
                                            onClick={() => setShowWalkInModal(false)}
                                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center text-white transition-all backdrop-blur-md"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-7">
                                    <div className="space-y-5 text-left">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Mijoz Ismi</label>
                                            <input
                                                type="text"
                                                value={walkInName}
                                                onChange={e => setWalkInName(e.target.value)}
                                                className="w-full h-14 bg-slate-50 border border-slate-200 px-6 rounded-2xl text-slate-800 font-bold text-sm outline-none focus:border-primary/50 focus:bg-white transition-all"
                                                placeholder="Mijoz"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Xizmat turi</label>
                                            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                                                {(shopInfo.services || []).map((service, idx) => {
                                                    const s = typeof service === 'string' && service.startsWith('{') ? JSON.parse(service) : service;
                                                    const name = typeof s === 'object' ? s.name : s;
                                                    const price = typeof s === 'object' ? s.price : 50000;
                                                    const isSelected = selectedService?.name === name && !isCustomService;

                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedService({ name, price });
                                                                setIsCustomService(false);
                                                            }}
                                                            className={`p-3 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between h-20 ${
                                                                isSelected
                                                                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                                                                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
                                                            }`}
                                                        >
                                                            <span className={`text-[10px] font-bold uppercase truncate w-full ${isSelected ? 'text-primary' : 'text-slate-600'}`}>
                                                                {name}
                                                            </span>
                                                            <span className={`text-[11px] font-mono font-black ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                                                                {price.toLocaleString()} so'm
                                                            </span>
                                                        </button>
                                                    );
                                                })}

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCustomService(true);
                                                        setSelectedService(null);
                                                    }}
                                                    className={`p-3 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between h-20 ${
                                                        isCustomService
                                                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                                                            : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
                                                    }`}
                                                >
                                                    <span className={`text-[10px] font-bold uppercase ${isCustomService ? 'text-primary' : 'text-slate-600'}`}>
                                                        Boshqa...
                                                    </span>
                                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                                                        Custom xizmat
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {isCustomService && (
                                            <div className="space-y-4 pt-2 border-t border-slate-100 animate-slide-down">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Xizmat Nomi</label>
                                                    <input
                                                        type="text"
                                                        value={customServiceName}
                                                        onChange={e => setCustomServiceName(e.target.value)}
                                                        className="w-full h-12 bg-slate-50 border border-slate-200 px-6 rounded-xl text-slate-800 font-bold text-sm outline-none focus:border-primary/50 focus:bg-white transition-all"
                                                        placeholder="Masalan: Kal va shotchik"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Narxi (so'm)</label>
                                                    <input
                                                        type="number"
                                                        value={customServicePrice}
                                                        onChange={e => setCustomServicePrice(e.target.value)}
                                                        className="w-full h-12 bg-slate-50 border border-slate-200 px-6 rounded-xl text-slate-800 font-bold text-sm outline-none focus:border-primary/50 focus:bg-white transition-all"
                                                        placeholder="50000"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3 mt-6">
                                        <button
                                            onClick={async () => {
                                                let serviceName = '';
                                                let servicePrice = 0;

                                                if (isCustomService) {
                                                    if (!customServiceName.trim() || !customServicePrice.trim()) {
                                                        alert("Iltimos, xizmat nomi va narxini kiriting");
                                                        return;
                                                    }
                                                    serviceName = customServiceName.trim();
                                                    servicePrice = parseInt(customServicePrice);
                                                } else {
                                                    if (!selectedService) {
                                                        alert("Iltimos, xizmat turini tanlang");
                                                        return;
                                                    }
                                                    serviceName = selectedService.name;
                                                    servicePrice = selectedService.price;
                                                }

                                                const walkInBooking = {
                                                    shopId: shopInfo.id,
                                                    shopName: shopInfo.name,
                                                    name: walkInName.trim() || "Walk-in Mijoz",
                                                    phone: "+998000000000",
                                                    service: serviceName,
                                                    price: servicePrice,
                                                    time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
                                                    status: 'In progress'
                                                };

                                                setIsSubmitting(true);
                                                const res = await addBooking(walkInBooking);
                                                setIsSubmitting(false);

                                                if (res.success && res.id) {
                                                    localStorage.setItem('booking_start_' + res.id, Date.now().toString());
                                                    setShowWalkInModal(false);
                                                    setWalkInName('Mijoz');
                                                    setSelectedService(null);
                                                    setIsCustomService(false);
                                                    setCustomServiceName('');
                                                    setCustomServicePrice('');
                                                } else {
                                                    alert(res.message || "Xatolik yuz berdi");
                                                }
                                            }}
                                            disabled={isSubmitting || (!selectedService && !isCustomService)}
                                            className="w-full h-16 bg-primary text-white rounded-[2rem] font-bold text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:scale-100"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Play size={14} className="fill-current text-white" />
                                                    Xizmatni boshlash
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                    {selectedUserDetails && (
                        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-2xl">
                            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-white rounded-[4.5rem] p-12 max-w-sm w-full relative overflow-hidden shadow-2xl border border-slate-100 text-center">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24" />
                                <div className="w-28 h-28 bg-primary/10 text-primary rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-primary/10 relative z-10"><User size={56} /></div>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-3 block">Mijoz</span>
                                <h2 className="text-2xl font-bold text-slate-800 mb-12 uppercase italic leading-none tracking-tight">{selectedUserDetails.name}</h2>
                                <div className="space-y-4 mb-12">
                                    <div className="bg-slate-50 p-6 rounded-[2.5rem] flex items-center gap-6 group hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-slate-100">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl group-hover:bg-primary group-hover:text-white transition-all"><Phone size={24} /></div>
                                        <div className="text-left flex flex-col gap-0.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Telefon</span>
                                            <a href={`tel:${selectedUserDetails.phone}`} className="text-slate-800 font-bold text-lg">{selectedUserDetails.phone}</a>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-[2.5rem] flex items-center gap-6 group hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-slate-100">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl group-hover:bg-primary group-hover:text-white transition-all"><Scissors size={24} /></div>
                                        <div className="text-left flex flex-col gap-0.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Xizmat</span>
                                            <span className="text-slate-800 font-bold text-lg">{selectedUserDetails.service}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUserDetails(null)} className="w-full h-18 bg-slate-900 text-white rounded-[2.2rem] font-bold text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all">Yopish</button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {logoutModalOpen && (
                        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white p-10 rounded-[4rem] shadow-2xl max-w-sm w-full relative overflow-hidden text-center"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16" />
                                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/10 relative z-10">
                                    <LogOut size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 uppercase italic mb-3 relative z-10">Chiqish</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10 leading-loose opacity-60 relative z-10">
                                    Tizimdan chiqishni tasdiqlaysizmi?
                                </p>
                                <div className="flex flex-col gap-4 relative z-10">
                                    <button
                                        onClick={() => { setLogoutModalOpen(false); signOut(); }}
                                        className="w-full h-16 bg-red-500 text-white rounded-[2rem] font-bold text-xs uppercase tracking-widest shadow-2xl shadow-red-500/40 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <LogOut size={16} />
                                        Ha, Chiqish
                                    </button>
                                    <button
                                        onClick={() => setLogoutModalOpen(false)}
                                        className="w-full h-16 bg-slate-100 text-slate-400 rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Bekor Qilish
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {successToast && (
                        <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1300] bg-slate-900 text-white px-10 py-6 rounded-[2.5rem] font-bold shadow-2xl flex items-center gap-6 text-xs uppercase tracking-widest border border-white/10 backdrop-blur-2xl">
                            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-2xl"><Check size={20} /></div>
                            {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Dashboard;
