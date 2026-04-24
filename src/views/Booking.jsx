import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { Clock, User, Phone, Scissors, CheckCircle2 } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const generateTimeSlots = (start, end) => {
    const slots = [];
    if (!start || !end) return slots;
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        slots.push(timeString);

        currentMin += 30; // 30 min intervals
        if (currentMin >= 60) {
            currentMin -= 60;
            currentHour += 1;
        }
    }
    return slots;
};

const Booking = () => {
    const { shopInfo, queue, addBooking } = useStore();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [errorMsg, setErrorMsg] = useState('');

    if (!shopInfo || !shopInfo.name) {
        return <Navigate to="/discovery" replace />;
    }

    const timeSlots = generateTimeSlots(shopInfo.workingHours.start, shopInfo.workingHours.end);
    const bookedSlots = queue.filter(q => q.status !== 'Done').map(q => q.time);

    // Calculate est. wait time based on queue
    const activeQueue = queue.filter(q => q.status !== 'Done');
    const position = activeQueue.length + 1;
    const estWaitTime = position * 30; // approx 30 mins per person

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!selectedService || !selectedTime || !formData.name || !formData.phone) {
            setErrorMsg('Please fill all fields');
            return;
        }

        const serviceObj = shopInfo.services.find(s => (typeof s === 'string' ? s : s.name) === selectedService);
        const price = typeof serviceObj === 'string' ? 50000 : (serviceObj?.price || 50000);

        const result = await addBooking({
            shopId: shopInfo.id,
            shopName: shopInfo.name,
            service: selectedService,
            price: price,
            time: selectedTime,
            name: formData.name,
            phone: formData.phone
        });

        if (result.success) {
            navigate('/success');
        } else {
            setErrorMsg(result.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 relative px-4 sm:px-6 antigravity-bg">
            {/* Deep Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-primary/10 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-secondary/10 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply"></div>

            <div className="mb-16 text-center relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-block bg-white/60 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white shadow-lg backdrop-blur-md"
                >
                    Booking Process
                </motion.div>
                <h1 className="text-4xl sm:text-6xl font-black text-dark mb-4 tracking-tight leading-tight">{t('bookAppointment')}</h1>
                <div className="flex items-center justify-center gap-2">
                    <div className="h-px w-8 bg-gray-200"></div>
                    <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">{shopInfo.name}</p>
                    <div className="h-px w-8 bg-gray-200"></div>
                </div>
            </div>

            <div className="glass rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)] border border-white/80 overflow-hidden relative z-10 backdrop-blur-2xl">
                {/* Modern Progress bar */}
                <div className="flex bg-white/30 backdrop-blur-xl border-b border-white/50">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`flex-1 py-6 text-center transition-all duration-500 relative group`}>
                            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] relative z-10 ${step >= i ? 'text-primary' : 'text-gray-400 opacity-60'}`}>
                                {t('step')} {i}
                            </span>
                            {step >= i && (
                                <motion.div
                                    layoutId="step-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-400 shadow-[0_-4px_12px_rgba(16,185,129,0.3)]"
                                />
                            )}
                            {step === i && (
                                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-8 sm:p-12">
                    <AnimatePresence mode="wait">
                        {errorMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-8 p-5 bg-red-500/5 text-red-500 border border-red-500/10 rounded-2xl text-sm font-bold text-center"
                            >
                                {errorMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                                <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-4 text-dark tracking-tight">
                                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20"><Scissors size={28} /></div>
                                    {t('selectService')}
                                </h2>
                            </div>

                            {shopInfo.services.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                                    <p className="text-gray-400 font-bold italic">{t('noServicesAvailable')}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {shopInfo.services.map((service, idx) => {
                                        let parsedService = service;
                                        if (typeof service === 'string' && service.startsWith('{')) {
                                            try { parsedService = JSON.parse(service); } catch (e) { parsedService = service; }
                                        }
                                        const sName = typeof parsedService === 'object' ? parsedService.name : parsedService;
                                        const sPrice = typeof parsedService === 'object' ? parsedService.price : 50000;

                                        return (
                                            <motion.button
                                                key={idx}
                                                whileHover={{ y: -5 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedService(sName)}
                                                className={`group relative p-[2px] rounded-[1.75rem] overflow-hidden transition-all duration-300 ${selectedService === sName ? 'shadow-xl shadow-primary/10' : 'shadow-lg shadow-black/[0.02]'}`}
                                            >
                                                {/* Animated border */}
                                                <div className={`absolute inset-0 bg-gradient-to-br from-primary to-emerald-400 transition-opacity duration-500 ${selectedService === sName ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`} />

                                                <div className={`relative h-full bg-white/95 p-6 rounded-[1.7rem] flex items-center justify-between transition-colors z-10 ${selectedService === sName ? 'bg-white' : 'hover:bg-white'}`}>
                                                    <div className="flex flex-col text-left">
                                                        <span className={`text-lg font-black tracking-tight mb-1 transition-colors ${selectedService === sName ? 'text-primary' : 'text-dark'}`}>{sName}</span>
                                                        <span className="text-xs font-black text-emerald-500/80 bg-emerald-500/5 px-2.5 py-1 rounded-full w-fit">
                                                            {sPrice.toLocaleString()} UZS
                                                        </span>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${selectedService === sName ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-300 group-hover:bg-gray-200'}`}>
                                                        <CheckCircle2 size={18} />
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-16 flex justify-end">
                                <button
                                    disabled={!selectedService}
                                    onClick={() => setStep(2)}
                                    className="relative overflow-hidden group bg-dark text-white px-12 py-5 rounded-2xl font-black text-lg disabled:opacity-20 hover:bg-black transition-all shadow-2xl active:scale-[0.98] flex items-center gap-3"
                                >
                                    <div className="absolute inset-0 bg-white/10 -skew-x-12 -translate-x-full group-hover:animate-shine" />
                                    {t('nextStep')}
                                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                        <CheckCircle2 size={22} className="opacity-50" />
                                    </motion.div>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                                <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-4 text-dark tracking-tight">
                                    <div className="w-14 h-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20"><Clock size={28} /></div>
                                    {t('selectTime')}
                                </h2>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[400px] overflow-y-auto p-2 pr-4 custom-scrollbar">
                                {timeSlots.map(time => {
                                    const isBooked = bookedSlots.includes(time);
                                    const isSelected = selectedTime === time;

                                    return (
                                        <button
                                            key={time}
                                            disabled={isBooked}
                                            onClick={() => setSelectedTime(time)}
                                            className={`relative h-20 rounded-[1.25rem] border-2 font-black transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
                                                ${isBooked ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-60' :
                                                    isSelected ? 'border-sky-500 bg-sky-500 text-white shadow-xl shadow-sky-500/20 scale-105 z-10' :
                                                        'border-gray-100 bg-white/50 hover:border-sky-300 text-dark hover:bg-white hover:scale-105'}`}
                                        >
                                            <span className="text-lg tracking-tight">{time}</span>
                                            {isBooked ? (
                                                <span className="text-[8px] uppercase tracking-tighter mt-1 opacity-60 font-black">Band</span>
                                            ) : (
                                                !isSelected && <div className="absolute bottom-1 w-1.5 h-1.5 bg-sky-500/20 rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-16 flex justify-between items-center group/nav">
                                <button onClick={() => setStep(1)} className="text-gray-400 font-black hover:text-dark px-6 py-2 transition-all flex items-center gap-2">
                                    <span className="group-hover/nav:-translate-x-2 transition-transform">←</span> {t('back')}
                                </button>
                                <button
                                    disabled={!selectedTime}
                                    onClick={() => setStep(3)}
                                    className="relative overflow-hidden group bg-dark text-white px-12 py-5 rounded-2xl font-black text-lg disabled:opacity-20 hover:bg-black transition-all shadow-2xl active:scale-[0.98]"
                                >
                                    <div className="absolute inset-0 bg-white/10 -skew-x-12 -translate-x-full group-hover:animate-shine" />
                                    {t('nextStep')}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                                <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-4 text-dark tracking-tight">
                                    <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20"><User size={28} /></div>
                                    {t('yourDetails')}
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 opacity-70">{t('name')}</label>
                                        <div className="relative group">
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Shuhrat Karimov"
                                                className="w-full pl-16 pr-6 py-5 bg-gray-50/50 rounded-[1.5rem] border border-gray-100 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all font-black text-lg"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 opacity-70">{t('phone')}</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+998 90 123 45 67"
                                                className="w-full pl-16 pr-6 py-5 bg-gray-50/50 rounded-[1.5rem] border border-gray-100 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all font-black text-lg"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="relative group mt-10">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-sky-400/10 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-700" />
                                    <div className="relative bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-xl">
                                        <h4 className="font-black text-dark text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                            <span className="w-8 h-px bg-primary/30" />
                                            {t('summary')}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('service')}</p>
                                                <p className="text-xl font-black text-dark tracking-tight">{selectedService}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Narxi</p>
                                                <p className="text-xl font-black text-primary tracking-tight">
                                                    {(typeof shopInfo.services.find(s => (typeof s === 'string' ? s : s.name) === selectedService) === 'string'
                                                        ? 50000
                                                        : shopInfo.services.find(s => (typeof s === 'string' ? s : s.name) === selectedService)?.price || 50000).toLocaleString()} UZS
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('time')}</p>
                                                <p className="text-xl font-black text-dark tracking-tight">{selectedTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-16 flex justify-between items-center group/nav pt-10 border-t border-gray-100/50">
                                    <button type="button" onClick={() => setStep(2)} className="text-gray-400 font-black hover:text-dark px-6 py-2 transition-all flex items-center gap-2">
                                        <span className="group-hover/nav:-translate-x-2 transition-transform">←</span> {t('back')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="relative overflow-hidden group bg-primary text-white px-14 py-5 rounded-2xl font-black text-xl hover:bg-emerald-600 transition-all shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-[0.98] flex items-center gap-3"
                                    >
                                        <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-shine" />
                                        {t('joinQueue')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Booking;
