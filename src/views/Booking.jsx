import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, User, Phone, CheckCircle2, CheckCircle, ChevronLeft,
    Share2, Star, MessageSquare, Navigation, Globe,
    X, MapPin, Scissors
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabase';

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

        currentMin += 30;
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

    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [showServicesList, setShowServicesList] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchedPhone, setFetchedPhone] = useState('');

    if (!shopInfo || !shopInfo.name) {
        return <Navigate to="/" replace />;
    }

    const timeSlots = React.useMemo(() => generateTimeSlots(shopInfo.workingHours?.start || '09:00', shopInfo.workingHours?.end || '18:00'), [shopInfo.workingHours]);
    const bookedSlots = React.useMemo(() => queue.filter(q => q.status !== 'Done').map(q => q.time), [queue]);

    const salonPhone = shopInfo.phone || fetchedPhone || (shopInfo.ownerId?.startsWith('+998') ? shopInfo.ownerId : '');

    React.useEffect(() => {
        if (!shopInfo.phone && shopInfo.ownerId) {
            const fetchOwnerPhone = async () => {
                const { data } = await supabase
                    .from('pending_salons')
                    .select('owner_phone')
                    .eq('owner_id', shopInfo.ownerId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (data?.owner_phone) {
                    setFetchedPhone(data.owner_phone);
                } else {
                    // Final fallback: try to find by salon name
                    const { data: nameData } = await supabase
                        .from('pending_salons')
                        .select('owner_phone')
                        .eq('name', shopInfo.name)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (nameData?.owner_phone) {
                        setFetchedPhone(nameData.owner_phone);
                    }
                }
            };
            fetchOwnerPhone();
        }
    }, [shopInfo.phone, shopInfo.ownerId, shopInfo.name]);

    const [formData, setFormData] = useState({ name: '', phone: '' });

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const serviceObj = (shopInfo.services || []).find(s => (typeof s === 'string' ? s : s.name) === selectedService);
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
        } catch (err) {
            setErrorMsg(t('common.error'));
            console.error('Booking error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="flex flex-col gap-6 pb-40 -mt-8 -mx-6 bg-white min-h-screen">
            <div className="relative h-[50vh] w-full overflow-hidden rounded-b-[4rem] shadow-2xl">
                <img
                    src={shopInfo.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1000&q=80"}
                    alt={shopInfo.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-12 left-8 right-8 flex justify-between items-center z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all">
                        <Share2 size={20} />
                    </button>
                </div>

                <div className="absolute bottom-12 left-8 right-8 z-10">
                    <div className="flex flex-col gap-2">
                        <span className="bg-primary/20 backdrop-blur-md text-primary px-4 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] w-fit border border-primary/20">SALON</span>
                        <h1 className="text-2xl font-bold text-white tracking-tight uppercase leading-none">{shopInfo.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[9px] font-bold border border-white/10">
                                <Star size={12} fill="#fbbf24" className="text-[#fbbf24]" /> 4.9 (500+ Izoh)
                            </div>
                            <div className="flex items-center gap-1.5 text-white/70 text-[9px] font-bold uppercase tracking-widest">
                                <CheckCircle size={14} className="text-secondary" /> Tasdiqlangan
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 mt-6">
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => setShowServicesList(!showServicesList)}
                        className={`w-full h-16 rounded-[2rem] flex items-center justify-center gap-3 transition-all border ${showServicesList ? 'bg-primary text-white border-primary shadow-xl' : 'text-primary bg-purple-50 border-purple-100/50 shadow-sm'}`}
                    >
                        <Scissors size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Xizmatlar Ro'yxati</span>
                    </button>

                    {salonPhone && (
                        <div className="flex items-center justify-between p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100/50 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm">
                                    <Phone size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Bog'lanish uchun</span>
                                    <span className="text-sm font-bold text-slate-700 tracking-wider">{salonPhone}</span>
                                </div>
                            </div>
                            <a
                                href={`tel:${salonPhone}`}
                                className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                            >
                                <Phone size={16} fill="currentColor" />
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showServicesList && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="px-8"
                    >
                        <div className="flex flex-col gap-5 p-5 md:p-8 rounded-[2rem] bg-slate-900 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/5">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[100px] rounded-full" />

                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm md:text-base font-black uppercase italic tracking-tighter">Xizmatlar Ro'yxati</h3>
                                    <div className="h-1 w-8 bg-primary rounded-full" />
                                </div>
                                <button
                                    onClick={() => setShowServicesList(false)}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/5"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-3 relative z-10 max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
                                {(shopInfo.services || []).length > 0 ? shopInfo.services.map((service, idx) => {
                                    const sName = typeof service === 'object' ? service.name : service;
                                    const sPrice = typeof service === 'object' ? service.price : 50000;
                                    return (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] hover:border-white/10 transition-all group"
                                        >
                                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                <span className="font-black uppercase italic text-xs md:text-sm tracking-tight truncate leading-tight block text-slate-100">{sName}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em]">{sPrice.toLocaleString()} SO'M</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedService(sName);
                                                    setIsBookingOpen(true);
                                                    setStep(2);
                                                    setShowServicesList(false);
                                                }}
                                                className="px-5 h-10 bg-primary text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 shrink-0 flex items-center justify-center gap-2"
                                            >
                                                <span>Tanlash</span>
                                                <div className="w-1 h-1 bg-white/40 rounded-full" />
                                            </button>
                                        </div>
                                    );
                                }) : (
                                    <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                                        <Scissors size={40} strokeWidth={1} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Hozircha xizmatlar yo'q</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-8 flex flex-col gap-4 mt-4">
                <h2 className="text-base font-bold text-slate-800 uppercase leading-none tracking-tight">Salon haqida</h2>
                <p className="text-slate-400 text-xs leading-relaxed font-bold uppercase tracking-wide opacity-80">
                    {shopInfo.description || `${shopInfo.name} da premium xizmatdan bahra oling. Professional ustalarimiz sizga eng zamonaviy stildagi ko'rinishni taqdim etadilar.`}
                </p>
            </div>

            <div className="px-8 flex flex-col gap-6 mt-4 pb-12">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-base font-black text-slate-800 uppercase italic tracking-tighter leading-none">Ishlardan namunalar</h2>
                    {shopInfo.gallery?.length > 0 && (
                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] bg-purple-50 px-3 py-1.5 rounded-full">{shopInfo.gallery.length} Rasm</span>
                    )}
                </div>
                
                <div className="grid grid-cols-2 gap-5 mt-4">
                    {shopInfo.gallery && shopInfo.gallery.length > 0 ? (
                        shopInfo.gallery.map((work, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-100 border border-slate-50 group relative"
                            >
                                <img src={work} alt={`Work ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))
                    ) : (
                        // Premium Styled Fallback if no gallery images are set in settings
                        [1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-3 text-slate-200">
                                <Navigation size={24} className="opacity-20" />
                                <span className="text-[7px] font-black uppercase tracking-[0.3em] opacity-40">Namuna {i + 1}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="fixed bottom-10 left-4 right-4 z-40">
                <button
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full h-[4.5rem] bg-slate-900 text-white rounded-[2rem] font-bold text-[12px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95 transition-all flex items-center justify-center gap-4 border border-white/5"
                >
                    <Clock size={20} className="text-primary" /> Navbat olish
                </button>
            </div>

            <AnimatePresence>
                {isBookingOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-end justify-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBookingOpen(false)} className="absolute inset-0 bg-white/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="bg-white w-full max-w-lg rounded-t-[4rem] px-12 pt-24 pb-12 relative z-10 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] overflow-y-auto h-[95vh] scrollbar-hide border-t border-slate-50"
                        >
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-100 rounded-full" />

                            <div className="flex mb-10 gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-slate-100'}`} />
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8 w-full">
                                        <div className="w-full text-center">
                                            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Xizmatni tanlang</h3>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            {shopInfo.services.map((service, idx) => {
                                                const parsed = typeof service === 'string' && service.startsWith('{') ? JSON.parse(service) : service;
                                                const sName = typeof parsed === 'object' ? parsed.name : parsed;
                                                const sPrice = typeof parsed === 'object' ? parsed.price : 50000;
                                                const isSel = selectedService === sName;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedService(sName)}
                                                        className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border transition-all flex items-center justify-between gap-4 ${isSel ? 'border-primary bg-purple-50 shadow-xl shadow-purple-100/20' : 'border-slate-100 bg-slate-50/30'}`}
                                                    >
                                                        <div className="text-left flex-1 min-w-0">
                                                            <div className="font-bold text-slate-800 uppercase text-base md:text-lg tracking-tight truncate leading-tight mb-0.5">{sName}</div>
                                                            <div className="text-[10px] md:text-sm font-bold text-primary uppercase tracking-widest">{sPrice.toLocaleString()} So'm</div>
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${isSel ? 'bg-primary border-primary scale-110 shadow-lg shadow-primary/30' : 'border-slate-200 bg-white'}`} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button disabled={!selectedService} onClick={() => setStep(2)} className="w-full h-15 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-30 mt-4 transition-all">Davom etish</button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8 w-full">
                                        <div className="flex flex-col items-center text-center w-full gap-3">
                                            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Vaqtni tanlang</h3>
                                            <button onClick={() => setStep(1)} className="px-6 py-2 bg-slate-50 text-slate-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-slate-100 active:scale-95 transition-all">Orqaga qaytish</button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {timeSlots.map(time => {
                                                const isBooked = bookedSlots.includes(time);
                                                const isSel = selectedTime === time;
                                                return (
                                                    <button
                                                        key={time}
                                                        disabled={isBooked}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`h-14 rounded-2xl border flex flex-col items-center justify-center transition-all ${isBooked ? 'opacity-20 bg-slate-50 border-transparent' : isSel ? 'border-primary bg-purple-50 text-primary shadow-lg shadow-purple-100' : 'border-slate-100 bg-white shadow-sm'}`}
                                                    >
                                                        <span className="text-base font-bold tracking-tight">{time}</span>
                                                        <span className="text-[7px] font-bold uppercase tracking-widest mt-0.5">{isBooked ? 'Band' : 'Bo\'sh'}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button disabled={!selectedTime} onClick={() => setStep(3)} className="w-full h-15 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-30 mt-4 transition-all">Tasdiqlash</button>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8 w-full">
                                        <div className="flex flex-col items-center text-center w-full gap-3">
                                            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Ma'lumotlar</h3>
                                            <button onClick={() => setStep(2)} className="px-6 py-2 bg-slate-50 text-slate-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-slate-100 active:scale-95 transition-all">Orqaga qaytish</button>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Ismingiz"
                                                    className="w-full h-15 px-8 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-primary transition-all font-bold text-xs outline-none"
                                                />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="Telefon raqamingiz"
                                                    className="w-full h-15 px-8 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-primary transition-all font-bold text-xs outline-none"
                                                />
                                            </div>
                                            <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col gap-3 mt-4">
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Xizmat va Vaqt</span>
                                                </div>
                                                <div className="flex justify-between items-center gap-4">
                                                    <span className="text-sm font-bold text-slate-800 uppercase truncate flex-1">{selectedService}</span>
                                                    <span className="text-xl font-bold text-primary tracking-tighter leading-none">{selectedTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button disabled={isSubmitting} onClick={handleSubmit} className="w-full h-18 bg-primary text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 mt-4 transition-all disabled:opacity-50">
                                            {isSubmitting ? 'Saqlanmoqda...' : 'Yakunlash'}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Booking;
