import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Phone, Lock, Loader2, CheckCircle2, ChevronLeft, Settings, Clock, Plus, X, ArrowRight, ShieldCheck, Search } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useStore } from '../context/StoreContext';
import PendingApproval from '../components/PendingApproval';

const CustomTimePicker = ({ label, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const timeValue = value || "09:00";
    const [hour, minute] = timeValue.split(':');

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ["00", "15", "30", "45"];

    const handleSelect = (newH, newM) => {
        onChange(`${newH}:${newM}`);
    };

    return (
        <div className="flex flex-col gap-2 relative z-[60]">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full glass-input h-14 px-6 rounded-2xl text-slate-800 font-black cursor-pointer flex items-center justify-between hover:border-primary/50 transition-all font-premium"
            >
                <span className="text-base tabular-nums">{hour}:{minute}</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Clock size={14} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 z-[110] bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2rem] p-6 flex gap-4 mt-4 border border-white"
                        >
                            <div className="flex-1 flex flex-col gap-3">
                                <span className="text-[8px] font-black uppercase text-slate-300 text-center tracking-widest">Soat</span>
                                <div className="h-48 overflow-y-auto scrollbar-hide flex flex-col gap-1">
                                    {hours.map(h => (
                                        <button
                                            key={h}
                                            type="button"
                                            onClick={() => handleSelect(h, minute)}
                                            className={`py-3 rounded-xl font-black text-lg transition-all ${h === hour ? 'bg-primary text-white shadow-xl' : 'text-slate-300 hover:text-slate-800'}`}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="w-[1px] bg-slate-100 my-4" />
                            <div className="flex-1 flex flex-col gap-3">
                                <span className="text-[8px] font-black uppercase text-slate-300 text-center tracking-widest">Daqiqa</span>
                                <div className="h-48 overflow-y-auto scrollbar-hide flex flex-col gap-1">
                                    {minutes.map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => handleSelect(hour, m)}
                                            className={`py-3 rounded-xl font-black text-lg transition-all ${m === minute ? 'bg-primary text-white shadow-xl' : 'text-slate-300 hover:text-slate-800'}`}
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

const FloatingInput = ({ icon: Icon, label, type, value, onChange, placeholder, required }) => (
    <div className="flex flex-col gap-2 group">
        <div className="relative">
            <div className={`absolute left-0 -top-6 transition-all duration-300 ${value ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] font-premium">{label}</span>
            </div>
            <div className="relative flex items-center">
                <Icon size={18} className="absolute left-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className="w-full h-16 pl-16 pr-6 glass-input rounded-2xl outline-none text-slate-800 font-bold text-base placeholder:text-slate-300 placeholder:font-medium focus:ring-4 focus:ring-primary/5 transition-all"
                    placeholder={placeholder}
                    required={required}
                />
            </div>
        </div>
    </div>
);

const Login = ({ onLogin }) => {
    const { t } = useTranslation();
    const {
        sendNotification,
        allShops,
        refreshShops
    } = useStore();
    const [role, setRole] = useState(null);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [regStep, setRegStep] = useState(0); // 0: initial/select, 1: next step
    const [salonName, setSalonName] = useState('');
    const [salonImage, setSalonImage] = useState('');
    const [salonDescription, setSalonDescription] = useState('');
    const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '18:00' });
    const [services, setServices] = useState([]);
    const [serviceInput, setServiceInput] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [regSuccess, setRegSuccess] = useState(false);
    const [pendingSalonId, setPendingSalonId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedShopId, setSelectedShopId] = useState(null);

    useEffect(() => {
        if (allShops.length === 0) {
            refreshShops();
        }
    }, []);

    const addService = () => {
        if (serviceInput.trim() && servicePrice.trim()) {
            setServices([...services, { name: serviceInput.trim(), price: parseInt(servicePrice) }]);
            setServiceInput('');
            setServicePrice('');
        }
    };

    const removeService = (nameToRemove) => {
        setServices(services.filter(s => s.name !== nameToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        const cleanPhone = phone.replace(/[^\d+]/g, '');
        const email = `${cleanPhone}@ocherd.app`;

        if (!isLoginMode && regStep === 0) {
            if (!name || !phone || !password) {
                setErrorMsg("Iltimos, barcha maydonlarni to'ldiring.");
                return;
            }
            if (role === 'owner') {
                setRegStep(1);
                return;
            }
        }

        if (isLoginMode) {
            setLoading(true);
            try {
                const { data: signInData, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                if (error) throw error;

                const isAdmin = cleanPhone === '998505521107' || cleanPhone === '505521107';
                const finalRole = isAdmin ? 'owner' : role;

                if (finalRole === 'owner' && !isAdmin) {
                    const userId = signInData?.user?.id;
                    if (userId) {
                        // Check in shops
                        const { data: shopData } = await supabase
                            .from('shops')
                            .select('id')
                            .eq('owner_id', userId)
                            .limit(1);

                        // Also check in pending_salons
                        const { data: pendingData } = await supabase
                            .from('pending_salons')
                            .select('status')
                            .eq('owner_id', userId)
                            .order('created_at', { ascending: false })
                            .limit(1);

                        const isApproved = shopData && shopData.length > 0;
                        const isPending = !isApproved && (pendingData && pendingData[0]?.status === 'pending');
                        const isRejected = !isApproved && (pendingData && pendingData[0]?.status === 'rejected');

                        if (isPending || (!isApproved && !isRejected)) {
                            sessionStorage.setItem('awaitingApproval', 'true');
                            setRegSuccess(true);
                            await supabase.auth.signOut();
                            setLoading(false);
                            return;
                        }

                        if (isRejected) {
                            setErrorMsg("Sizning so'rovingiz rad etilgan. Batafsil ma'lumot uchun admin bilan bog'laning.");
                            await supabase.auth.signOut();
                            setLoading(false);
                            return;
                        }
                    }
                }

                localStorage.setItem('currentUserPhone', cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`);
                onLogin(finalRole);
            } catch (error) {
                setErrorMsg("Telefon raqam yoki parol xato.");
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        try {
            let { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        phone: phone,
                        role: role,
                    }
                }
            });

            if (signUpError && signUpError.message.includes('User already registered')) {
                setErrorMsg("Ushbu raqam allaqachon ro'yxatdan o'tgan.");
                setLoading(false);
                return;
            }

            if (signUpError) throw signUpError;

            if (signUpData?.user) {
                if (role === 'owner') {
                    // Save to pending_salons table
                    const { data: pendingResult, error: pendingError } = await supabase
                        .from('pending_salons')
                        .insert([{
                            owner_id: signUpData.user.id,
                            owner_name: name,
                            owner_phone: phone,
                            name: salonName,
                            image_url: salonImage,
                            description: salonDescription,
                            services: services,
                            working_hours: workingHours,
                            status: 'pending'
                        }])
                        .select();

                    if (pendingError) {
                        console.error('Pending salon registration error:', pendingError);
                        setErrorMsg("Salon ma'lumotlarini saqlashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
                        setLoading(false);
                        return;
                    }

                    if (pendingResult && pendingResult[0]) {
                        const newId = pendingResult[0].id;
                        setPendingSalonId(newId);
                        // Automate notification to admin
                        if (sendNotification) {
                            sendNotification(`NEW_SALON_REGISTRATION|||${newId}`);
                        }
                    }

                    sessionStorage.setItem('awaitingApproval', 'true');
                    setRegSuccess(true);
                } else if (!signUpData.session) {
                    setSuccessMsg('Tayyor! Endi tizimga kiring.');
                    setIsLoginMode(true);
                    setRegStep(0);
                } else {
                    onLogin(role);
                }
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (regSuccess) {
        return (
            <PendingApproval
                onConfirm={async () => {
                    sessionStorage.removeItem('awaitingApproval');
                    await supabase.auth.signOut();
                    window.location.reload();
                }}
            />
        );
    }


    return (
        <div className="min-h-screen mesh-gradient flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />

            {/* Dynamic Background Lights */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm relative z-10"
            >
                {!role ? (
                    <div className="flex flex-col items-center gap-10 w-full animate-fade-in">
                        <div className="flex flex-col items-center gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                className="relative group w-64 h-auto flex items-center justify-center p-2 mb-4"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                                    animate={{ opacity: 0.5, scale: 1, rotate: 0 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="absolute -inset-[30%] bg-primary/20 blur-[80px] rounded-full opacity-60"
                                />
                                <div className="relative rounded-[30px] overflow-hidden p-2">
                                    <motion.img
                                        src="/logo.png"
                                        alt="Logo"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                                    />
                                    {/* Sweeping Light Shimmer Effect */}
                                    <motion.div
                                        initial={{ left: "-150%" }}
                                        animate={{ left: "150%" }}
                                        transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 }}
                                        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-25deg] z-20 pointer-events-none blur-[2px]"
                                    />
                                </div>
                            </motion.div>
                        </div>

                        <div className="flex flex-col gap-5 w-full">
                            <motion.button
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setRole('user')}
                                className="glass-card group p-6 flex items-center gap-6 text-left"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <User size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xl font-black text-slate-800 uppercase italic leading-none mb-1">Mijoz</h4>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-80">Navbat olish uchun</p>
                                </div>
                                <ArrowRight className="text-slate-200 group-hover:text-primary transition-all" size={20} />
                            </motion.button>

                            <motion.button
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setRole('owner')}
                                className="glass-card group p-6 flex items-center gap-6 text-left"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center transition-all duration-300">
                                    <Building2 size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xl font-black text-slate-800 uppercase italic leading-none mb-1">Biznes</h4>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-80">Salon boshqaruvi</p>
                                </div>
                                <ArrowRight className="text-slate-200 group-hover:text-slate-900 transition-all" size={20} />
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 w-full">
                        <header className="flex flex-col gap-6 ml-1">
                            <motion.button
                                whileHover={{ x: -2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    if (regStep === 1) {
                                        setRegStep(0);
                                    } else {
                                        setRole(null);
                                        setRegStep(0);
                                        setIsLoginMode(true);
                                    }
                                }}
                                className="w-10 h-10 glass-card flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </motion.button>

                            <div className="flex flex-col gap-2">
                                <h3 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                                    {regStep === 1 ? 'Salon' : isLoginMode ? 'Kirish' : "Ro'yxatdan o'tish"}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="h-[2px] w-6 bg-primary rounded-full" />
                                    <p className="text-primary font-black text-[9px] uppercase tracking-[0.4em] italic opacity-80">
                                        {regStep === 1 ? 'Yakunlash' : isLoginMode ? 'Xush kelibsiz' : 'Yangi hisob'}
                                    </p>
                                </div>
                            </div>
                        </header>

                        <AnimatePresence mode="wait">
                            {errorMsg && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-4 bg-red-50/50 backdrop-blur-xl border border-red-100 rounded-2xl flex items-center gap-3"
                                >
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.1em]">{errorMsg}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                            <div className="glass-card p-8 flex flex-col gap-8 pt-10">
                                {regStep === 1 ? (
                                    role === 'owner' ? (
                                        <div className="flex flex-col gap-8">
                                            <FloatingInput
                                                icon={Building2}
                                                label="Salon Nomi"
                                                type="text"
                                                value={salonName}
                                                onChange={(e) => setSalonName(e.target.value)}
                                                placeholder="Salon nomi"
                                                required
                                            />

                                            <FloatingInput
                                                icon={User}
                                                label="Tavsif"
                                                type="text"
                                                value={salonDescription}
                                                onChange={(e) => setSalonDescription(e.target.value)}
                                                placeholder="Salon haqida qisqacha"
                                            />

                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock size={14} className="text-primary" />
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Ish tartibi</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <CustomTimePicker label="Ochilish" value={workingHours.start} onChange={val => setWorkingHours(prev => ({ ...prev, start: val }))} />
                                                    <CustomTimePicker label="Yopilish" value={workingHours.end} onChange={val => setWorkingHours(prev => ({ ...prev, end: val }))} />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Xizmatlar</span>
                                                    <span className="text-[8px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full">{services.length} ta</span>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <input type="text" value={serviceInput} onChange={e => setServiceInput(e.target.value)} className="w-full h-12 px-5 glass-input rounded-xl text-sm font-bold" placeholder="Xizmat nomi" />
                                                    <div className="flex gap-3">
                                                        <input type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)} className="flex-1 h-12 px-5 glass-input rounded-xl text-sm font-bold" placeholder="Narxi" />
                                                        <button type="button" onClick={addService} className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"><Plus size={20} /></button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {services.map((s, idx) => (
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key={idx} className="bg-white pl-4 pr-2 py-2 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-slate-700 uppercase italic">{s.name}</span>
                                                                <span className="text-[8px] font-bold text-primary opacity-60">{s.price.toLocaleString()}</span>
                                                            </div>
                                                            <button type="button" onClick={() => removeService(s.name)} className="w-6 h-6 rounded-lg hover:bg-red-50 text-red-400 transition-colors flex items-center justify-center"><X size={12} /></button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full h-16 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] shadow-2xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                                            >
                                                {loading ? <Loader2 className="animate-spin size-6" /> : (
                                                    <>
                                                        TAYYOR
                                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ) : null
                                ) : isLoginMode ? (
                                    <div className="flex flex-col gap-10">
                                        <FloatingInput
                                            icon={Phone}
                                            label="Telefon"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Telefon raqam"
                                            required
                                        />
                                        <FloatingInput
                                            icon={Lock}
                                            label="Maxfiy Parol"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Parol"
                                            required
                                        />

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-16 bg-primary text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.5em] shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-4 group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                            {loading ? <Loader2 className="animate-spin size-6" /> : 'KIRISH'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-10">
                                        <FloatingInput
                                            icon={User}
                                            label="F.I.SH"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ism familiya"
                                            required
                                        />
                                        <FloatingInput
                                            icon={Phone}
                                            label="Telefon"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Telefon raqam"
                                            required
                                        />
                                        <FloatingInput
                                            icon={Lock}
                                            label="Maxfiy Parol"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Parol"
                                            required
                                        />

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-16 bg-primary text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.5em] shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-4 group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                            {loading ? <Loader2 className="animate-spin size-6" /> : (role === 'user' ? "RO'YXATDAN O'TISH" : 'DAVOM ETISH')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>

                        <div className="flex flex-col items-center gap-4">
                            <button
                                type="button"
                                onClick={() => { setIsLoginMode(!isLoginMode); setRegStep(0); }}
                                className="group flex flex-col items-center gap-2"
                            >
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                    {isLoginMode ? "Hisobingiz yo'qmi?" : "Hisobingiz bormi?"}
                                </span>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic group-hover:translate-y-[-1px] transition-transform">
                                    {isLoginMode ? "RO'YXATDAN O'TISH" : "TIZIMGA KIRISH"}
                                </span>
                                <div className="h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-300 rounded-full" />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Premium Footer */}
            <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4 pointer-events-none select-none">
                <div className="flex items-center gap-3 opacity-20">
                    <div className="w-10 h-[1px] bg-slate-400" />
                    <ShieldCheck size={16} className="text-slate-400" />
                    <div className="w-10 h-[1px] bg-slate-400" />
                </div>
                <span className="text-[7px] font-black uppercase tracking-[0.8em] text-slate-400 opacity-30">BarberOS Cloud Security</span>
            </div>
        </div>
    );
};

export default Login;
