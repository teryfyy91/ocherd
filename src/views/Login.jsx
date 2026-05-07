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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-50 border-slate-200 px-6 py-4 rounded-2xl text-slate-800 font-bold cursor-pointer flex items-center justify-between hover:bg-slate-100 transition-all border"
            >
                <span className="text-xl">{hour}:{minute}</span>
                <Clock size={18} className="text-slate-400" />
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
            <div className="fixed inset-0 z-[2000] bg-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-sm"
                >
                    <div className="bg-white border-slate-100 p-10 rounded-[2.5rem] flex flex-col items-center gap-8 shadow-2xl border">
                        <div className="w-20 h-20 bg-primary rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-primary/20">
                            <Clock size={40} />
                        </div>

                        <div className="flex flex-col gap-4">
                            <h2 className="text-3xl font-black text-slate-800 italic tracking-tight uppercase leading-tight">
                                So'rovnomangiz <br /> yuborildi!
                            </h2>
                            <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] opacity-80 leading-relaxed">
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
                            className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/30 mt-4 active:scale-95 transition-all"
                        >
                            Tushunarli
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen w-full mx-auto bg-white overflow-x-hidden pt-8 md:pt-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm md:max-w-4xl"
            >
                {!role ? (
                    <div className="flex flex-col w-full min-h-screen relative overflow-hidden bg-white px-4">
                        <div className="h-[45vh] bg-[#7C3AED] -mx-4 rounded-b-[3.5rem] relative flex flex-col items-center justify-center pt-10 shadow-2xl shadow-purple-500/20 mb-12">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                            <div className="text-center relative z-10">
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-2 mb-4">
                                    <span className="text-white/60 text-[8px] font-black uppercase tracking-[0.4em]">Welcome to</span>
                                </motion.div>
                                <h1 className="text-6xl md:text-8xl font-black text-white uppercase italic leading-none tracking-tighter">
                                    <span className="opacity-70">Barber</span>OS
                                </h1>
                                <p className="text-white/60 mt-4 font-bold tracking-[0.3em] text-[8px] md:text-sm uppercase max-w-[240px] mx-auto leading-relaxed">Zamonaviy xizmat ko'rsatish tizimi</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 w-full relative z-20">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setRole('user')}
                                className="group relative bg-white border border-slate-100 p-5 rounded-[2rem] flex items-center gap-5 shadow-lg shadow-slate-100 hover:border-purple-200 transition-all"
                            >
                                <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center bg-purple-50 text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white transition-all shadow-sm">
                                    <User size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-xl font-black text-slate-800 italic uppercase tracking-tight leading-none mb-1">Mijozman</h4>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-80">Navbat olish uchun</p>
                                </div>
                                <div className="ml-auto text-slate-300">
                                    <ChevronLeft className="rotate-180" size={18} />
                                </div>
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setRole('owner')}
                                className="group relative bg-white border border-slate-100 p-5 rounded-[2rem] flex items-center gap-5 shadow-lg shadow-slate-100 hover:border-emerald-200 transition-all"
                            >
                                <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                    <Building2 size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-xl font-black text-slate-800 italic uppercase tracking-tight leading-none mb-1">Salon egasi</h4>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-80">Biznes boshqarish</p>
                                </div>
                                <div className="ml-auto text-slate-300">
                                    <ChevronLeft className="rotate-180" size={18} />
                                </div>
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 w-full px-4 pb-12">
                        <button
                            onClick={() => regStep === 1 ? setRegStep(0) : setRole(null)}
                            className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-4 safe-top"
                        >
                            <ChevronLeft size={14} /> Orqaga
                        </button>

                        {regStep !== 1 && (
                            <div className="bg-[#7C3AED] -mx-4 px-6 pt-16 pb-20 rounded-b-[3.5rem] relative shadow-xl shadow-purple-500/20 mb-8 overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col gap-2">
                                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-tight">
                                        {isLoginMode ? 'Kirish' : 'Ro\'yxatdan o\'tish'}
                                    </h2>
                                    <p className="text-white/60 font-black text-[9px] uppercase tracking-[0.3em] ml-1">
                                        {role === 'owner' ? 'Sizning boshqaruv paneli' : 'Xush kelibsiz!'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {errorMsg && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black text-center border border-red-100 uppercase tracking-wider mb-4">
                                    {errorMsg}
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-purple-50 text-purple-600 rounded-2xl text-[10px] font-black text-center border border-purple-100 uppercase tracking-wider mb-4">
                                    {successMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {regStep === 1 ? (
                                <div className="flex flex-col gap-6">
                                    <div className="bg-[#7C3AED] -mx-4 px-6 pt-16 pb-20 rounded-b-[3.5rem] relative shadow-xl shadow-purple-500/20 mb-8 overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className="w-14 h-14 bg-white/20 text-white rounded-[1rem] flex items-center justify-center border border-white/20 backdrop-blur-md">
                                                <Settings size={28} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-3xl font-black text-white leading-tight tracking-tighter uppercase italic">Sozlamalar</h3>
                                                <p className="text-white/60 text-[9px] font-black mt-1 uppercase tracking-[0.3em]">Salon ma'lumotlari</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Salon nomi</label>
                                            <div className="relative">
                                                <Building2 size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="text" value={salonName} onChange={(e) => setSalonName(e.target.value)} className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-800 font-bold text-base focus:border-primary/50 transition-all" placeholder="Salon nomi qanday?" required />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ish vaqti</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <CustomTimePicker label="Ochilish" value={workingHours.start} onChange={val => setWorkingHours(prev => ({ ...prev, start: val }))} />
                                                <CustomTimePicker label="Yopilish" value={workingHours.end} onChange={val => setWorkingHours(prev => ({ ...prev, end: val }))} />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Xizmatlar qo'shing</label>
                                            <div className="p-5 bg-slate-50 border border-slate-200 rounded-[2rem] flex flex-col gap-4">
                                                <input type="text" value={serviceInput} onChange={e => setServiceInput(e.target.value)} className="w-full bg-white border border-slate-200 px-5 py-3 rounded-xl text-slate-800 font-bold text-sm outline-none focus:border-primary/50" placeholder="Masalan: Soch olish" />
                                                <div className="flex gap-3">
                                                    <input type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)} className="flex-1 bg-white border border-slate-200 px-5 py-3 rounded-xl text-slate-800 font-bold text-sm outline-none focus:border-primary/50" placeholder="Narxi (so'mda)" />
                                                    <button type="button" onClick={addService} className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"><Plus size={24} /></button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {services.map((s, idx) => (
                                                        <div key={idx} className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-700 flex items-center gap-2 shadow-sm">
                                                            <span>{s.name} - {s.price.toLocaleString()}</span>
                                                            <button type="button" onClick={() => removeService(s.name)} className="text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors"><X size={12} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || !salonName.trim() || services.length === 0}
                                            className="w-full mt-4 py-5 bg-primary text-white rounded-2xl font-black text-base uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="animate-spin size-6" /> : 'Barchasi tayyor'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-5">
                                    {!isLoginMode && (
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ism familiya</label>
                                            <div className="relative">
                                                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-800 font-bold text-base focus:border-primary/50 transition-all" placeholder="Ismingizni kiriting..." required />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Telefon raqam</label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-800 font-bold text-base focus:border-primary/50 transition-all" placeholder="90 123 45 67" required />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Maxfiy parol</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-800 font-bold text-base focus:border-primary/50 transition-all" placeholder="••••••••" required />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg mt-4 shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-4">
                                        {loading ? <Loader2 className="animate-spin size-6" /> : (isLoginMode ? 'Kirish' : 'Davom etish')}
                                    </button>

                                    <p className="text-center text-slate-400 font-black text-[10px] md:text-sm mt-4 uppercase tracking-widest leading-loose">
                                        {isLoginMode ? 'Hisobingiz yo\'qmi?' : 'Hisobingiz bormi?'}{' '}
                                        <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setRegStep(0); }} className="text-primary font-black hover:underline ml-2">
                                            {isLoginMode ? 'Ro\'yxatdan o\'tish' : 'Kirish'}
                                        </button>
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
