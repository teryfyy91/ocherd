import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, User, Building2, Phone, Lock, Loader2, CheckCircle2 } from 'lucide-react';
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

        // Clean phone number (remove spaces, plus sign for identification, etc.)
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        const email = `${cleanPhone}@queueflow.app`;

        try {
            if (isLoginMode) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) {
                    if (error.message === 'Email not confirmed') {
                        throw new Error('Hisobingiz hali tasdiqlanmagan. Supabase sozlamalarida "Confirm email"ni o\'chirib qo\'ying.');
                    }
                    if (error.message === 'Invalid login credentials') {
                        throw new Error('Telefon raqam yoki parol noto\'g\'ri');
                    }
                    throw error;
                }

                // Login successful
                if (role === 'owner') {
                    localStorage.setItem('currentUserPhone', phone);
                }
                onLogin(role);
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: name,
                            phone: phone,
                            role: role
                        }
                    }
                });

                if (error) throw error;

                if (data.user) {
                    // Check if session exists (means confirmation is OFF)
                    if (data.session) {
                        setSuccessMsg('Tizimga muvaffaqiyatli kirdingiz!');
                        onLogin(role);
                    } else {
                        setSuccessMsg('Muvaffaqiyatli ro\'yxatdan o\'tdingiz! Endi tizimga kirishingiz mumkin. (Agar xatolik bo\'lsa, Supabase-da email tasdiqlashni o\'chiring)');
                        setIsLoginMode(true);
                        setName('');
                        setPassword('');
                    }
                }
            }
        } catch (error) {
            console.error('Auth error:', error.message);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center antigravity-bg px-4 relative overflow-hidden">
            {/* Deep Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-primary/20 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-secondary/20 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-400/5 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)] border border-white/80 max-w-md w-full relative z-10 overflow-hidden"
            >
                {/* Decorative glow inside */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col items-center mb-10 translate-y-0">
                    <div className="bg-black p-4 rounded-[1.5rem] shadow-2xl shadow-black/40 mb-6 group hover:rotate-12 transition-transform w-[4.5rem] h-[4.5rem] flex items-center justify-center overflow-hidden border border-gray-800 relative">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain transform scale-110 group-hover:scale-125 transition-transform" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-dark tracking-tight text-center leading-tight">
                        {role ? (isLoginMode ? t('signIn') : t('signUp')) : "Kim sifatida kirasiz?"}
                    </h2>
                </div>

                <AnimatePresence mode="wait">
                    {/* ... rest of error/success messages ... */}
                    {errorMsg && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="mb-8 p-4 bg-red-500/5 text-red-500 rounded-2xl text-sm font-bold text-center border border-red-500/10"
                        >
                            {errorMsg}
                        </motion.div>
                    )}

                    {successMsg && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="mb-8 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] text-center relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-500">
                                <CheckCircle2 size={48} />
                            </div>
                            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-emerald-500/20 transition-transform group-hover:scale-110">
                                <CheckCircle2 size={28} />
                            </div>
                            <h3 className="text-emerald-600 font-extrabold mb-1">Tabriklaymiz!</h3>
                            <p className="text-emerald-600/70 text-sm font-bold leading-relaxed px-2">
                                {successMsg}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!role ? (
                    <div className="grid grid-cols-1 gap-5">
                        <motion.button
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setRole('user');
                                setErrorMsg('');
                                setSuccessMsg('');
                            }}
                            className="relative overflow-hidden group w-full p-8 bg-white/40 border border-white/80 rounded-[2rem] sm:rounded-[2.5rem] hover:border-primary hover:bg-white hover:shadow-[0_20px_50px_rgba(16,185,129,0.12)] transition-all text-left backdrop-blur-sm"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity translate-x-4 -translate-y-4">
                                <User size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-primary/5">
                                    <User size={32} />
                                </div>
                                <h4 className="text-2xl font-black text-dark mb-1">Mijozman</h4>
                                <p className="text-[10px] font-black text-gray-400 leading-relaxed uppercase tracking-widest opacity-70">Navbat olish uchun</p>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setRole('owner');
                                setErrorMsg('');
                                setSuccessMsg('');
                            }}
                            className="relative overflow-hidden group w-full p-8 bg-white/40 border border-white/80 rounded-[2rem] sm:rounded-[2.5rem] hover:border-secondary hover:bg-white hover:shadow-[0_20px_50px_rgba(14,165,233,0.12)] transition-all text-left backdrop-blur-sm"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity translate-x-4 -translate-y-4">
                                <Building2 size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:bg-secondary group-hover:text-white transition-all shadow-inner border border-secondary/5">
                                    <Building2 size={32} />
                                </div>
                                <h4 className="text-2xl font-black text-dark mb-1">Biznes egasiman</h4>
                                <p className="text-[10px] font-black text-gray-400 leading-relaxed uppercase tracking-widest opacity-70">Salonni boshqarish</p>
                            </div>
                        </motion.button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLoginMode && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 opacity-60">{t('name')}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4.5 bg-gray-50/50 rounded-[1.25rem] border border-gray-100 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all font-bold placeholder:text-gray-300"
                                        placeholder="Shuhrat Karimov"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={!isLoginMode}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 opacity-60">{t('phone')}</label>
                            <div className="relative group/input">
                                <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary transition-colors" />
                                <input
                                    type="tel"
                                    className="w-full pl-14 pr-6 py-4.5 bg-gray-50/50 rounded-[1.25rem] border border-gray-100 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all font-bold placeholder:text-gray-300"
                                    placeholder="+998 90 123 45 67"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 opacity-60">{t('password')}</label>
                            <div className="relative group/input">
                                <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary transition-colors" />
                                <input
                                    type="password"
                                    className="w-full pl-14 pr-6 py-4.5 bg-gray-50/50 rounded-[1.25rem] border border-gray-100 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all font-bold placeholder:text-gray-300"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-dark text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-black transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] active:scale-[0.98] mt-4 flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/10 -skew-x-12 -translate-x-full group-hover:animate-shine" />
                            {loading ? <Loader2 className="animate-spin" /> : (isLoginMode ? t('loginBtn') : t('createAccountBtn'))}
                        </button>

                        <div className="pt-6 text-center border-t border-gray-100 space-y-5">
                            <p className="text-sm font-bold text-gray-400 leading-relaxed">
                                {isLoginMode ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLoginMode(!isLoginMode);
                                        setErrorMsg('');
                                        setSuccessMsg('');
                                    }}
                                    className="text-primary font-black hover:underline underline-offset-4"
                                >
                                    {isLoginMode ? "Ro'yxatdan o'tish" : "Kirish"}
                                </button>
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setRole(null);
                                    setErrorMsg('');
                                    setSuccessMsg('');
                                }}
                                className="text-[10px] font-black text-gray-300 hover:text-dark transition-colors uppercase tracking-[0.3em] inline-flex items-center gap-2"
                            >
                                <span className="w-4 h-px bg-gray-200"></span>
                                Orqaga qaytish
                                <span className="w-4 h-px bg-gray-200"></span>
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
