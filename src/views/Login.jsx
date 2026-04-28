import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Phone, Lock, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import { supabase } from '../utils/supabase';

const Login = ({ onLogin }) => {
    const { t } = useTranslation();
    const [role, setRole] = useState(null);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        const cleanPhone = phone.replace(/[^\d+]/g, '');
        const email = `${cleanPhone}@ocherd.app`;

        try {
            if (isLoginMode) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                if (error) throw error;
                if (role === 'owner') localStorage.setItem('currentUserPhone', phone);
                onLogin(role);
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: { data: { full_name: name, phone: phone, role: role } }
                });
                if (error) throw error;
                if (data.user) {
                    if (data.session) onLogin(role);
                    else {
                        setSuccessMsg('Muvaffaqiyatli ro\'yxatdan o\'tdingiz! Endi kirishingiz mumkin.');
                        setIsLoginMode(true);
                    }
                }
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 w-full max-w-sm mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                {!role ? (
                    <div className="flex flex-col gap-8 w-full">
                        <div className="text-center flex flex-col gap-3">
                            <h1 className="text-4xl font-black text-text-main tracking-tight uppercase">OCHERD</h1>
                            <p className="text-text-muted font-bold tracking-widest text-[10px] uppercase">Xush kelibsiz</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setRole('user')}
                                className="glass-card p-8 flex flex-col items-center gap-4 bg-white/5 border-white/5 hover:border-primary/40 hover:bg-white/10 transition-all text-center group"
                            >
                                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-text-main">Mijozman</h4>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Navbat olish uchun</p>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setRole('owner')}
                                className="glass-card p-8 flex flex-col items-center gap-4 bg-white/5 border-white/5 hover:border-primary/40 hover:bg-white/10 transition-all text-center group"
                            >
                                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Building2 size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-text-main">Salon egasiman</h4>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Biznes boshqarish</p>
                                </div>
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        <button onClick={() => setRole(null)} className="flex items-center gap-2 text-text-muted font-bold text-xs uppercase tracking-widest hover:text-text-main transition-colors">
                            <ChevronLeft size={16} /> Orqaga
                        </button>

                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl font-black text-text-main tracking-tight">{isLoginMode ? 'Kirish' : 'Ro\'yxatdan o\'tish'}</h2>
                            <p className="text-text-muted font-medium text-sm">{role === 'owner' ? 'Salon boshqaruviga kirish' : 'Xizmatlardan foydalanish'}</p>
                        </div>

                        <AnimatePresence mode="wait">
                            {errorMsg && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold text-center border border-red-500/10">
                                    {errorMsg}
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-primary/10 text-primary rounded-xl text-xs font-bold text-center border border-primary/10">
                                    {successMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {!isLoginMode && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">To'liq ism</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full glass-card bg-white/5 border-white/5 px-6 py-5 rounded-2xl outline-none text-text-main font-bold" placeholder="Shuhrat Karimov" required />
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Telefon</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-14 pr-6 py-5 glass-card bg-white/5 border-white/5 rounded-2xl outline-none text-text-main font-bold" placeholder="+998 90 123 45 67" required />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Parol</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-14 pr-6 py-5 glass-card bg-white/5 border-white/5 rounded-2xl outline-none text-text-main font-bold" placeholder="••••••••" required />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary py-5 text-xl mt-4 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" /> : (isLoginMode ? 'Kirish' : 'Ro\'yxatdan o\'tish')}
                            </button>

                            <p className="text-center text-text-muted font-bold text-sm mt-4">
                                {isLoginMode ? 'Hisobingiz yo\'qmi?' : 'Hisobingiz bormi?'}{' '}
                                <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} className="text-primary font-black hover:underline uppercase text-xs ml-1">
                                    {isLoginMode ? 'Sig’ilmoq' : 'Kirish'}
                                </button>
                            </p>
                        </form>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
