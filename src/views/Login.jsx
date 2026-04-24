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
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/60 max-w-md w-full relative z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-primary p-3.5 rounded-2xl text-white shadow-2xl shadow-primary/30 mb-6 group hover:rotate-12 transition-transform">
                        <Scissors size={28} />
                    </div>
                    <h2 className="text-3xl font-black text-dark tracking-tight">
                        {role ? (isLoginMode ? t('signIn') : t('signUp')) : "Kim sifatida kirasiz?"}
                    </h2>
                </div>

                <AnimatePresence mode="wait">
                    {errorMsg && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl text-sm font-bold text-center border border-red-100"
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
                    <div className="grid grid-cols-1 gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setRole('user');
                                setErrorMsg('');
                                setSuccessMsg('');
                            }}
                            className="relative overflow-hidden group w-full p-8 bg-white/50 border border-white/80 rounded-[2.5rem] hover:border-primary hover:bg-white hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] transition-all text-left"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <User size={80} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                    <User size={28} />
                                </div>
                                <h4 className="text-2xl font-black text-dark mb-1">Mijozman</h4>
                                <p className="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-widest">Navbat olish uchun</p>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setRole('owner');
                                setErrorMsg('');
                                setSuccessMsg('');
                            }}
                            className="relative overflow-hidden group w-full p-8 bg-white/50 border border-white/80 rounded-[2.5rem] hover:border-secondary hover:bg-white hover:shadow-[0_20px_50px_rgba(14,165,233,0.15)] transition-all text-left"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Building2 size={80} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:bg-secondary group-hover:text-white transition-all shadow-inner">
                                    <Building2 size={28} />
                                </div>
                                <h4 className="text-2xl font-black text-dark mb-1">Biznes egasiman</h4>
                                <p className="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-widest">Salonni boshqarish</p>
                            </div>
                        </motion.button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLoginMode && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('name')}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all font-bold placeholder:text-gray-300"
                                        placeholder="Shuhrat Karimov"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={!isLoginMode}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('phone')}</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    className="w-full pl-14 pr-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all font-bold placeholder:text-gray-300"
                                    placeholder="+998 90 123 45 67"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('password')}</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    className="w-full pl-14 pr-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all font-bold placeholder:text-gray-300"
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
                            className="w-full bg-dark text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-gray-800 transition-all shadow-2xl shadow-dark/10 active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (isLoginMode ? t('loginBtn') : t('createAccountBtn'))}
                        </button>

                        <div className="pt-4 text-center border-t border-gray-100 space-y-4">
                            <p className="text-sm font-bold text-gray-500">
                                {isLoginMode ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLoginMode(!isLoginMode);
                                        setErrorMsg('');
                                        setSuccessMsg('');
                                    }}
                                    className="text-primary font-black hover:underline"
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
                                className="text-xs font-black text-gray-400 hover:text-dark transition-colors uppercase tracking-widest"
                            >
                                ← Orqaga qaytish
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
