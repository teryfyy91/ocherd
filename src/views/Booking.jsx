import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Phone, CheckCircle2 } from 'lucide-react';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!selectedService || !selectedTime || !formData.name || !formData.phone) {
            setErrorMsg('Iltimos, barcha maydonlarni to\'ldiring');
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
        <div className="flex flex-col gap-8 pb-32">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 mt-4"
            >
                <h1 className="text-3xl font-black text-text-main tracking-tight">
                    Band qilish
                </h1>
                <p className="text-text-muted font-medium">{shopInfo.name}</p>
            </motion.div>

            {/* Stepper */}
            <div className="flex bg-white/5 rounded-2xl p-1 gap-1">
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={`flex-1 py-3 text-center rounded-xl transition-all duration-300 relative ${step === i ? 'bg-white/10 shadow-lg' : 'opacity-40'}`}
                    >
                        <span className={`text-[10px] font-black uppercase tracking-widest ${step >= i ? 'text-primary' : 'text-white'}`}>
                            Qadam {i}
                        </span>
                        {step > i && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
                                <CheckCircle2 size={14} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-8 p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl text-xs font-bold text-center"
                        >
                            {errorMsg}
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-6"
                        >
                            <h2 className="text-xl font-bold text-text-main mb-2">Xizmatni tanlang</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {shopInfo.services.map((service, idx) => {
                                    const parsedService = typeof service === 'string' && service.startsWith('{') ? JSON.parse(service) : service;
                                    const sName = typeof parsedService === 'object' ? parsedService.name : parsedService;
                                    const sPrice = typeof parsedService === 'object' ? parsedService.price : 50000;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedService(sName)}
                                            className={`glass-card p-6 flex items-center justify-between border-2 transition-all ${selectedService === sName ? 'border-primary/40 bg-white/10' : 'border-transparent'}`}
                                        >
                                            <div className="flex flex-col text-left gap-1">
                                                <span className="font-bold text-text-main">{sName}</span>
                                                <span className="text-sm font-black text-primary">{sPrice.toLocaleString()} UZS</span>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedService === sName ? 'bg-primary border-primary text-bg' : 'border-white/20'}`}>
                                                {selectedService === sName && <CheckCircle2 size={16} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                disabled={!selectedService}
                                onClick={() => setStep(2)}
                                className="btn-primary mt-4 disabled:opacity-30"
                            >
                                Davom etish
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-bold text-text-main">Vaqtni tanlang</h2>
                                <button onClick={() => setStep(1)} className="text-sm font-bold text-text-muted">Orqaga</button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {timeSlots.map(time => {
                                    const isBooked = bookedSlots.includes(time);
                                    const isSelected = selectedTime === time;

                                    return (
                                        <button
                                            key={time}
                                            disabled={isBooked}
                                            onClick={() => setSelectedTime(time)}
                                            className={`h-16 glass-card flex flex-col items-center justify-center transition-all ${isBooked ? 'opacity-20 grayscale border-transparent' : isSelected ? 'border-primary bg-primary/20 bg-white/10' : 'border-transparent'}`}
                                        >
                                            <span className={`text-lg font-black ${isSelected ? 'text-primary' : 'text-white'}`}>{time}</span>
                                            <span className="text-[8px] uppercase font-black tracking-tighter opacity-40">{isBooked ? 'Band' : 'Bo\'sh'}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                disabled={!selectedTime}
                                onClick={() => setStep(3)}
                                className="btn-primary mt-4 disabled:opacity-30"
                            >
                                Tasdiqlashga o'tish
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-8"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-bold text-text-main">Ma'lumotlaringiz</h2>
                                <button onClick={() => setStep(2)} className="text-sm font-bold text-text-muted">Orqaga</button>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">To'liq ism</label>
                                    <div className="relative">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Shuhrat Karimov"
                                            className="w-full glass-card bg-white/5 border-white/5 pl-14 pr-6 py-5 rounded-2xl outline-none text-white font-bold placeholder:text-text-muted transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Telefon raqam</label>
                                    <div className="relative">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+998 90 123 45 67"
                                            className="w-full glass-card bg-white/5 border-white/5 pl-14 pr-6 py-5 rounded-2xl outline-none text-white font-bold placeholder:text-text-muted transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Summary Card */}
                            <div className="glass-card px-6 py-8 sm:px-8 border-primary/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
                                <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-4">Xulosa</h4>
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-muted text-sm">Xizmat:</span>
                                        <span className="text-text-main font-bold">{selectedService}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-muted text-sm">Vaqt:</span>
                                        <span className="text-text-main font-bold">{selectedTime}</span>
                                    </div>
                                    <div className="h-px bg-white/5 my-1" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-text-muted text-sm">Umumiy narx:</span>
                                        <span className="text-primary text-xl font-black">
                                            {(shopInfo.services.find(s => (typeof s === 'string' ? s : s.name) === selectedService)?.price || 50000).toLocaleString()} UZS
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="btn-primary py-6 text-xl shadow-[0_20px_40px_rgba(0,200,151,0.2)]"
                            >
                                Navbatga yozilish
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Booking;
