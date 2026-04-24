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
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black text-dark mb-3 tracking-tight">{t('bookAppointment')}</h1>
                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">{shopInfo.name}</p>
            </div>

            <div className="glass rounded-[3rem] shadow-2xl border border-white/60 overflow-hidden relative z-10">
                {/* Progress bar */}
                <div className="flex border-b border-white/40 bg-white/30 backdrop-blur-md">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`flex-1 py-5 text-center text-xs font-black uppercase tracking-widest transition-all ${step >= i ? 'bg-primary/5 text-primary border-b-4 border-primary' : 'text-gray-400 opacity-50'}`}>
                            {t('step')} {i}
                        </div>
                    ))}
                </div>

                <div className="p-6 sm:p-8">
                    {errorMsg && (
                        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center">
                            {errorMsg}
                        </div>
                    )}

                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-dark">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Scissors size={24} /></div>
                                {t('selectService')}
                            </h2>
                            {shopInfo.services.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 font-bold">{t('noServicesAvailable')}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {shopInfo.services.map((service, idx) => {
                                        let parsedService = service;
                                        if (typeof service === 'string' && service.startsWith('{')) {
                                            try {
                                                parsedService = JSON.parse(service);
                                            } catch (e) {
                                                parsedService = service;
                                            }
                                        }

                                        const sName = typeof parsedService === 'object' ? parsedService.name : parsedService;
                                        const sPrice = typeof parsedService === 'object' ? parsedService.price : 50000;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedService(sName)}
                                                className={`p-6 rounded-[1.5rem] border-2 text-left transition-all relative overflow-hidden group ${selectedService === sName ? 'border-primary bg-primary/5 shadow-inner' : 'border-gray-100 bg-white/50 hover:border-primary/30'}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={`text-lg font-black ${selectedService === sName ? 'text-primary' : 'text-dark'}`}>{sName}</span>
                                                    <span className="text-xs font-black text-emerald-500 mt-1">{sPrice.toLocaleString()} UZS</span>
                                                </div>
                                                {selectedService === sName && <div className="absolute top-0 right-0 p-2 bg-primary text-white rounded-bl-xl"><CheckCircle2 size={16} /></div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="mt-12 flex justify-end">
                                <button
                                    disabled={!selectedService}
                                    onClick={() => setStep(2)}
                                    className="bg-dark text-white px-10 py-5 rounded-2xl font-black text-lg disabled:opacity-20 hover:bg-gray-800 transition-all shadow-xl shadow-dark/10 active:scale-95 group"
                                >
                                    {t('nextStep')}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-dark">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Clock size={24} /></div>
                                {t('selectTime')}
                            </h2>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-72 overflow-y-auto p-2 scrollbar-none">
                                {timeSlots.map(time => {
                                    const isBooked = bookedSlots.includes(time);
                                    return (
                                        <button
                                            key={time}
                                            disabled={isBooked}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-4 rounded-2xl border-2 font-black text-center transition-all relative overflow-hidden
                                                ${isBooked ? 'bg-red-50 border-red-100 text-red-300 cursor-not-allowed' :
                                                    selectedTime === time ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-105 z-10' :
                                                        'border-gray-100 bg-white/50 hover:border-primary/50 text-dark hover:scale-105'}`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <span>{time}</span>
                                                {isBooked && <span className="text-[8px] uppercase tracking-tighter mt-0.5 opacity-60">Band</span>}
                                            </div>
                                            {isBooked && <div className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-bl-full"></div>}
                                        </button>
                                    );
                                })}

                            </div>
                            <div className="mt-12 flex justify-between items-center">
                                <button onClick={() => setStep(1)} className="text-gray-400 font-bold hover:text-dark px-6 py-2 transition-colors">← {t('back')}</button>
                                <button
                                    disabled={!selectedTime}
                                    onClick={() => setStep(3)}
                                    className="bg-dark text-white px-10 py-5 rounded-2xl font-black text-lg disabled:opacity-20 hover:bg-gray-800 transition-all shadow-xl shadow-dark/10 active:scale-95"
                                >
                                    {t('nextStep')}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-dark">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary"><User size={24} /></div>
                                {t('yourDetails')}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('name')}</label>
                                    <div className="relative">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Shuhrat Karimov"
                                            className="w-full pl-14 pr-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('phone')}</label>
                                    <div className="relative">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+998 90 123 45 67"
                                            className="w-full pl-14 pr-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="bg-primary/5 p-6 rounded-[2rem] mt-8 border border-primary/10">
                                    <h4 className="font-black text-primary text-xs uppercase tracking-widest mb-4">{t('summary')}</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-gray-600 flex justify-between"><span>{t('service')}:</span> <span className="text-dark font-black">{selectedService}</span></p>
                                        {selectedService && (
                                            <p className="text-sm font-bold text-gray-600 flex justify-between">
                                                <span>Narxi:</span>
                                                <span className="text-primary font-black">
                                                    {(typeof shopInfo.services.find(s => (typeof s === 'string' ? s : s.name) === selectedService) === 'string'
                                                        ? 50000
                                                        : shopInfo.services.find(s => (typeof s === 'string' ? s : s.name) === selectedService)?.price || 50000).toLocaleString()} UZS
                                                </span>
                                            </p>
                                        )}
                                        <p className="text-sm font-bold text-gray-600 flex justify-between"><span>{t('time')}:</span> <span className="text-dark font-black">{selectedTime}</span></p>
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-50">
                                    <button type="button" onClick={() => setStep(2)} className="text-gray-400 font-bold hover:text-dark px-6 py-2">← {t('back')}</button>
                                    <button
                                        type="submit"
                                        className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all shadow-2xl shadow-primary/20 active:scale-95"
                                    >
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
