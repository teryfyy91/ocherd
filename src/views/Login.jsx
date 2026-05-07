import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Phone, Lock, Loader2, CheckCircle2, ChevronLeft, Settings, Clock, Plus, X } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useStore } from '../context/StoreContext';

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
            <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full glass-card bg-slate-50 border-slate-100 px-8 py-6 rounded-2xl text-slate-800 font-bold cursor-pointer flex items-center justify-between hover:bg-slate-100 transition-all border"
            >
                <span className="text-xl md:text-2xl">{hour}:{minute}</span>
                <Clock size={24} className="text-slate-400" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 z-[110] bg-white shadow-2xl rounded-2xl p-4 flex gap-4 mt-2 min-w-[200px] border border-slate-100"
                        >
                            <div className="flex-1 flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 text-center opacity-50">HR</span>
                                <div className="h-64 overflow-y-auto scrollbar-hide flex flex-col gap-1">
                                    {hours.map(h => (
                                        <button
                                            key={h}
                                            type="button"
                                            onClick={() => handleSelect(h, minute)}
                                            className={`py-3 rounded-lg font-black text-xl transition-all ${h === hour ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="w-[1px] bg-slate-100 my-2" />
                            <div className="flex-1 flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 text-center opacity-50">MIN</span>
                                <div className="h-64 overflow-y-auto scrollbar-hide flex flex-col gap-1">
                                    {minutes.map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => handleSelect(hour, m)}
                                            className={`py-3 rounded-lg font-black text-xl transition-all ${m === minute ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
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

const Login = ({ onLogin }) => {
    const { t } = useTranslation();
    const { sendNotification } = useStore();
    const [role, setRole] = useState(null);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [regStep, setRegStep] = useState(0);
    const [salonName, setSalonName] = useState('');
    const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '18:00' });
    const [services, setServices] = useState([]);
    const [serviceInput, setServiceInput] = useState('');
    const [servicePrice, setServicePrice] = useState('');

    const [regSuccess, setRegSuccess] = useState(false);

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

        if (!isLoginMode && role === 'owner' && regStep === 0) {
            setRegStep(1);
            return;
        }

        if (isLoginMode) {
            setLoading(true);
            try {
                const { data: signInData, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                if (error) throw error;

                // Super Admin Check
                const isAdmin = cleanPhone === '998505521107' || cleanPhone === '+998505521107' || cleanPhone === '505521107';
                const finalRole = isAdmin ? 'owner' : role;

                // If logging in as owner (non-admin), check approval status
                if (finalRole === 'owner' && !isAdmin) {
                    const userId = signInData?.user?.id;
                    if (userId) {
                        const { data: shopData } = await supabase
                            .from('shops')
                            .select('status')
                            .eq('owner_id', userId)
                            .single();

                        if (shopData && shopData.status === 'Pending') {
                            // Not approved yet — show waiting screen and sign out
                            sessionStorage.setItem('awaitingApproval', 'true');
                            setRegSuccess(true);
                            await supabase.auth.signOut();
                            setLoading(false);
                            return;
                        }
                    }
                }

                localStorage.setItem('currentUserPhone', cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`);
                onLogin(finalRole);
            } catch (error) {
                setErrorMsg(error.message);
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        try {
            let { data, error } = await supabase.auth.signUp({
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

            if (error && error.message.includes('User already registered')) {
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (signInError) throw new Error("Bu raqam band. Iltimos parolni to'g'ri kiriting yoki 'Kirish' bo'limidan foydalaning.");
                data = signInData;
                error = null;
            }

            if (error) throw error;

            if (data?.user) {
                if (data.session && role === 'owner') {
                    const { data: existingShop } = await supabase
                        .from('shops')
                        .select('id')
                        .eq('owner_id', data.user.id)
                        .single();

                    if (!existingShop) {
                        const { error: shopError } = await supabase
                            .from('shops')
                            .insert([{
                                owner_id: data.user.id,
                                name: salonName,
                                services: services,
                                working_hours: workingHours,
                                status: 'Pending'
                            }]);
                        if (shopError) console.error("Salon yaratishda xatolik:", shopError);
                    }

                    sessionStorage.setItem('awaitingApproval', 'true');
                    setRegSuccess(true);
                } else if (!data.session) {
                    setSuccessMsg('Muvaffaqiyatli ro\'yxatdan o\'tdingiz! Endi kirishingiz mumkin.');
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
            <div className="fixed inset-0 z-[2000] bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-sm md:max-w-xl mx-auto"
                >
                    <div className="glass-card bg-white border-slate-100 p-12 md:p-20 rounded-[3rem] flex flex-col items-center gap-10 shadow-2xl border-2">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-primary rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                            <Clock size={48} className="md:size-16" />
                        </div>

                        <div className="flex flex-col gap-6">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-800 italic tracking-tighter uppercase leading-[0.9]">
                                Sorovnomangiz <br /> yuborildi!
                            </h2>
                            <p className="text-[#7C3AED] font-black uppercase tracking-[0.4em] text-[10px] md:text-sm opacity-90 leading-relaxed">
                                Admin tasdiqlashini kuting. <br /> Tez orada faol bo'ladi.
                            </p>
                        </div>

                        <button
                            onClick={async () => {
                                sessionStorage.removeItem('awaitingApproval');
                                await supabase.auth.signOut();
                                setRegSuccess(false);
                                setRole(null);
                                setIsLoginMode(true);
                                setRegStep(0);
                                setErrorMsg('');
                                setSuccessMsg('');
                                localStorage.removeItem('isLoggedIn');
                                localStorage.removeItem('userRole');
                                localStorage.removeItem('currentUserPhone');
                            }}
                            className="w-full py-8 md:py-10 bg-primary text-white rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/30 mt-6"
                        >
                            Tushunarli
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 w-full mx-auto py-10 bg-bg overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={regStep === 1 ? "w-full max-w-7xl" : "w-full max-w-6xl"}
            >
                {!role ? (
                    <div className="flex flex-col gap-8 md:gap-20 w-full pt-6 md:pt-10 relative">
                        <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-primary/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

                        <div className="text-center relative z-10">
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-3 mb-4">
                                <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
                                <span className="text-primary text-[9px] font-black uppercase tracking-[0.5em]">Welcome to</span>
                                <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
                            </motion.div>
                            <h1 className="text-5xl md:text-9xl font-black text-slate-800 uppercase italic leading-none tracking-tighter">
                                <span className="text-gradient">Barber</span>OS
                            </h1>
                            <p className="text-slate-400 mt-3 font-bold tracking-widest text-[9px] md:text-lg opacity-80 uppercase">Sizga qulay va zamonaviy xizmat ko'rsatish tizimi</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full relative z-10 px-2 md:px-0">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -10 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setRole('user')}
                                className="group relative glass-card p-1 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative glass-card bg-white/40 border-slate-100 group-hover:border-primary/30 p-8 md:p-24 flex flex-col items-center gap-5 md:gap-10 transition-all duration-500">
                                    <div className="w-16 h-16 md:w-32 md:h-32 rounded-2xl md:rounded-[2rem] flex items-center justify-center bg-white/50 border border-slate-100 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <User size={28} className="md:size-16" />
                                    </div>
                                    <div className="text-center">
                                        <h4 className="text-2xl md:text-6xl font-black text-slate-800 italic uppercase tracking-tighter transition-colors group-hover:text-primary leading-none mb-2">Mijozman</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-70">Navbat olish uchun</p>
                                    </div>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -10 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setRole('owner')}
                                className="group relative glass-card p-1 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative glass-card bg-white/40 border-slate-100 group-hover:border-emerald-500/30 p-8 md:p-24 flex flex-col items-center gap-5 md:gap-10 transition-all duration-500">
                                    <div className="w-16 h-16 md:w-32 md:h-32 rounded-2xl md:rounded-[2rem] flex items-center justify-center bg-white/50 border border-slate-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <Building2 size={28} className="md:size-16" />
                                    </div>
                                    <div className="text-center">
                                        <h4 className="text-2xl md:text-6xl font-black text-slate-800 italic uppercase tracking-tighter transition-colors group-hover:text-emerald-600 leading-none mb-2">Salon egasi</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-70">Biznes boshqarish</p>
                                    </div>
                                </div>
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 w-full max-w-sm md:max-w-6xl mx-auto py-2">
                        <button
                            onClick={() => regStep === 1 ? setRegStep(0) : setRole(null)}
                            className="flex items-center gap-3 text-text-muted font-black text-xs uppercase tracking-widest hover:text-text-main transition-colors group"
                        >
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Orqaga
                        </button>

                        {regStep !== 1 && (
                            <div className="flex flex-col gap-2">
                                <h2 className="text-3xl md:text-7xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                                    {isLoginMode ? 'Kirish' : 'Ro\'yxatdan o\'tish'}
                                </h2>
                                <p className="text-slate-400 font-black text-[9px] md:text-sm uppercase tracking-[0.4em] opacity-80 ml-1">
                                    {role === 'owner' ? 'Salon boshqaruviga kirish' : 'Xizmatlardan foydalanish'}
                                </p>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {errorMsg && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-red-500/10 text-red-500 rounded-2xl text-xs md:text-sm font-black text-center border border-red-500/10">
                                    {errorMsg}
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-primary/10 text-primary rounded-2xl text-xs md:text-sm font-black text-center border border-primary/10">
                                    {successMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
                            {regStep === 1 ? (
                                <div className="w-full">
                                    <div className="glass-card p-10 md:p-24 bg-white/5 border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] relative flex flex-col gap-10 md:gap-20">
                                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[150px] -mr-[20rem] -mt-[20rem]" />

                                        <div className="flex items-center gap-8 relative z-10">
                                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center border border-slate-100">
                                                <Settings size={40} className="md:size-14" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl md:text-5xl font-black text-slate-800 leading-none tracking-tighter uppercase italic">Sozlamalar</h3>
                                                <p className="text-primary text-[10px] md:text-base font-black mt-3 uppercase tracking-[0.5em] opacity-80 italic">Ma'lumotlarni to'ldiring</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 relative z-10">
                                            <div className="flex flex-col gap-16">
                                                <div className="flex flex-col gap-6">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                                                        <label className="text-sm md:text-xl font-black text-slate-400 uppercase tracking-[0.4em]">Salon nomi</label>
                                                    </div>
                                                    <div className="relative w-full">
                                                        <Building2 size={28} className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 z-20 pointer-events-none" />
                                                        <input
                                                            type="text"
                                                            value={salonName}
                                                            onChange={(e) => setSalonName(e.target.value)}
                                                            className="w-full !pl-24 pr-10 py-6 glass-card bg-slate-50 border-slate-100 rounded-[2.5rem] outline-none text-slate-800 font-black text-lg md:text-xl focus:border-primary/50 transition-all placeholder:opacity-40 relative z-10"
                                                            placeholder="Masalan: Gold Barber"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-6">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                                                        <label className="text-sm md:text-xl font-black text-text-muted uppercase tracking-[0.4em]">Ish vaqti</label>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-10">
                                                        <CustomTimePicker label="Ochilish" value={workingHours.start} onChange={val => setWorkingHours(prev => ({ ...prev, start: val }))} />
                                                        <CustomTimePicker label="Yopilish" value={workingHours.end} onChange={val => setWorkingHours(prev => ({ ...prev, end: val }))} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-12">
                                                <div className="flex flex-col gap-6">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                                                        <label className="text-sm md:text-xl font-black text-slate-400 uppercase tracking-[0.4em]">Xizmat qo'shish</label>
                                                    </div>
                                                    <div className="p-8 glass-card bg-slate-50 border border-slate-100 rounded-[3rem] flex flex-col gap-6">
                                                        <input type="text" value={serviceInput} onChange={e => setServiceInput(e.target.value)} className="w-full bg-white border border-slate-100 px-10 py-5 rounded-2xl text-slate-800 font-black text-lg md:text-xl placeholder:opacity-40 outline-none focus:border-primary/50" placeholder="Xizmat turi..." />
                                                        <div className="flex gap-4">
                                                            <input type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)} className="flex-1 bg-white border border-slate-100 px-10 py-5 rounded-2xl text-slate-800 font-black text-lg md:text-xl placeholder:opacity-40 outline-none focus:border-primary/50" placeholder="Narxi..." />
                                                            <button type="button" onClick={addService} className="w-20 h-20 md:w-24 md:h-24 bg-primary text-white rounded-[2rem] flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-primary/30"><Plus size={32} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-4 max-h-[350px] overflow-y-auto scrollbar-hide">
                                                    {services.map((s, idx) => (
                                                        <div key={idx} className="bg-slate-50 pl-10 pr-6 py-6 rounded-[2rem] text-xl md:text-3xl font-black text-slate-800 border border-slate-100 flex items-center gap-8">
                                                            <span>{s.name} - <span className="text-primary">{s.price.toLocaleString()}</span></span>
                                                            <button type="button" onClick={() => removeService(s.name)} className="text-red-500 p-3 hover:bg-red-50 rounded-2xl transition-colors"><X size={32} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || !salonName.trim() || services.length === 0}
                                            className="w-full mt-10 md:mt-20 py-12 md:py-14 bg-primary text-bg rounded-[3.5rem] font-black text-3xl md:text-5xl shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-10 group disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {loading ? <Loader2 className="animate-spin size-24" /> : <>Tayyor <CheckCircle2 size={48} className="group-hover:rotate-12 transition-transform" /></>}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-12 w-full">
                                        {!isLoginMode && (
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[10px] md:text-xl font-black text-slate-400 uppercase tracking-[0.3em] ml-2">To'liq ism</label>
                                                <div className="relative w-full">
                                                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-20 pointer-events-none" />
                                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full !pl-12 pr-4 py-4 glass-card bg-slate-50 border-slate-100 rounded-2xl outline-none text-slate-800 font-black text-base focus:border-primary/50 relative z-10" placeholder="Ism..." required />
                                                </div>
                                            </div>
                                        )}
                                        <div className={`flex flex-col gap-3 ${isLoginMode ? 'md:col-span-2' : ''}`}>
                                            <label className="text-[10px] md:text-xl font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Telefon</label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-12 pr-4 py-4 glass-card bg-slate-50 border-slate-100 rounded-2xl outline-none text-slate-800 font-black text-base focus:border-primary/50" placeholder="90 123 45 67" required />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 flex flex-col gap-3">
                                            <label className="text-[10px] md:text-xl font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Parol</label>
                                            <div className="relative">
                                                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 glass-card bg-slate-50 border-slate-100 rounded-2xl outline-none text-slate-800 font-black text-base focus:border-primary/50" placeholder="••••••••" required />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full py-5 md:py-10 bg-primary text-white rounded-2xl md:rounded-[3rem] font-black text-lg md:text-3xl mt-4 shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 group">
                                        {loading ? <Loader2 className="animate-spin size-6" /> : (isLoginMode ? 'Kirish' : (role === 'owner' && regStep === 0 ? 'Davom etish' : 'Ro\'yxatdan o\'tish'))}
                                    </button>

                                    <p className="text-center text-text-muted font-black text-sm md:text-xl mt-4 opacity-60">
                                        {isLoginMode ? 'Hisobingiz yo\'qmi?' : 'Hisobingiz bormi?'}{' '}
                                        <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setRegStep(0); }} className="text-primary font-black hover:underline uppercase text-[10px] md:text-base ml-2 tracking-widest">
                                            {isLoginMode ? 'Ro\'yxatdan o\'tish' : 'Kirish'}
                                        </button>
                                    </p>
                                </>
                            )}
                        </form>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
