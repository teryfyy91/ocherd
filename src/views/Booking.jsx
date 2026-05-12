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
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const [showServicesList, setShowServicesList] = useState(false);
    const [showPhoneDisplay, setShowPhoneDisplay] = useState(false);
    const [fetchedPhone, setFetchedPhone] = useState('');

    if (!shopInfo || !shopInfo.name) {
        return <Navigate to="/" replace />;
    }

    const timeSlots = generateTimeSlots(shopInfo.workingHours?.start || '09:00', shopInfo.workingHours?.end || '18:00');
    const bookedSlots = queue.filter(q => q.status !== 'Done').map(q => q.time);

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

    const galleryImages = (shopInfo.gallery && shopInfo.gallery.length > 0)
        ? shopInfo.gallery
        : [
            "https://images.unsplash.com/photo-1599351473299-d8395e693175?w=400&q=80",
            "https://images.unsplash.com/photo-1621605815841-db897cfd5118?w=400&q=80",
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80",
            "https://images.unsplash.com/photo-1622286332618-f28939b4bb6d?w=400&q=80"
        ];

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

            <div className="px-8 grid grid-cols-2 gap-4 mt-6">
                <button
                    onClick={() => {
                        if (salonPhone) {
                            setShowPhoneDisplay(!showPhoneDisplay);
                        } else {
                            alert("Telefon raqami kiritilmagan");
                        }
                    }}
                    className="flex flex-col items-center gap-3 group"
                >
                    <div className={`w-full h-16 rounded-[2rem] flex items-center justify-center transition-all border ${showPhoneDisplay ? 'bg-blue-500 text-white border-blue-500 shadow-xl' : 'text-blue-500 bg-blue-50 border-blue-100/50 shadow-sm'}`}>
                        <Phone size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qo'ng'iroq</span>
                </button>

                <button
                    onClick={() => setShowServicesList(!showServicesList)}
                    className="flex flex-col items-center gap-3 group"
                >
                    <div className={`w-full h-16 rounded-[2rem] flex items-center justify-center transition-all border ${showServicesList ? 'bg-primary text-white border-primary shadow-xl' : 'text-primary bg-purple-50 border-purple-100/50 shadow-sm'}`}>
                        <Scissors size={24} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Xizmatlar</span>
                </button>
            </div>

            <AnimatePresence>
                {showPhoneDisplay && salonPhone && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="px-8"
                    >
                        <a
                            href={`tel:${salonPhone}`}
                            className="flex items-center justify-between p-6 rounded-[2.5rem] bg-blue-50 border border-blue-100 shadow-xl shadow-blue-100/50 group"
                        >
                            <div className="flex flex-col">
                                <span className="text-[7px] font-bold text-blue-400 uppercase tracking-widest mb-1">Raqamga bosib qo'ng'iroq qiling</span>
                                <span className="text-lg font-bold text-blue-600 tracking-[0.1em]">{salonPhone}</span>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Phone size={20} fill="currentColor" />
                            </div>
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showServicesList && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="px-8"
                    >
                        <div className="flex flex-col gap-6 p-10 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                            <div className="flex justify-between items-center relative z-10">
                                <h3 className="text-base font-bold uppercase tracking-tight">Xizmatlar ro'yxat</h3>
                                <button onClick={() => setShowServicesList(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-4 relative z-10">
                                {(shopInfo.services || []).length > 0 ? shopInfo.services.map((service, idx) => {
                                    const sName = typeof service === 'object' ? service.name : service;
                                    const sPrice = typeof service === 'object' ? service.price : 50000;
                                    return (
                                        <div key={idx} className="flex justify-between items-center p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold uppercase italic text-sm tracking-tight">{sName}</span>
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{sPrice.toLocaleString()} SO'M</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedService(sName);
                                                    setIsBookingOpen(true);
                                                    setStep(2);
                                                    setShowServicesList(false);
                                                }}
                                                className="px-5 py-2.5 bg-primary rounded-xl font-bold text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                            >
                                                Tanlash
                                            </button>
                                        </div>
                                    );
                                }) : (
                                    <div className="py-10 text-center opacity-40 text-[10px] font-bold uppercase tracking-widest">Hozircha xizmatlar yo'q</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-8 flex flex-col gap-4 mt-4">
                <h2 className="text-base font-bold text-slate-800 uppercase leading-none tracking-tight">Salon haqida</h2>
                <p className="text-slate-400 text-xs leading-relaxed font-bold uppercase tracking-wide opacity-80">
                    {shopInfo.name} da premium xizmatdan bahra oling. Professional ustalarimiz sizga eng zamonaviy stildagi ko'rinishni taqdim etadilar.
                </p>
            </div>

            <div className="px-8 flex flex-col gap-6 mt-4 pb-12">
                <div className="flex justify-between items-center">
                    <h2 className="text-base font-bold text-slate-800 uppercase leading-none tracking-tight">Ishlardan namunalar</h2>
                    <button className="text-primary text-[8px] font-bold uppercase tracking-widest border-b-2 border-primary/10">Barchasi</button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                    {galleryImages.map((work, i) => (
                        <div key={i} className="aspect-square rounded-[2rem] overflow-hidden shadow-lg border border-slate-50">
                            <img src={work} alt={`Work ${i}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-10 left-8 right-8 z-40">
                <button
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full h-16 bg-slate-900 text-white rounded-[2rem] font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-300 active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                    <Clock size={18} className="text-primary" /> Navbat olish
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
                            className="bg-white w-full max-w-lg rounded-t-[4rem] p-10 pb-16 relative z-10 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] overflow-y-auto max-h-[90vh] scrollbar-hide border-t border-slate-50"
                        >
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />

                            <div className="flex mb-10 gap-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-slate-100'}`} />
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
                                        <h3 className="text-2xl font-bold text-slate-800 uppercase italic tracking-tighter leading-none">Xizmatni tanlang</h3>
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
                                                        className={`p-6 rounded-[2.5rem] border transition-all flex items-center justify-between ${isSel ? 'border-primary bg-purple-50/50 shadow-xl shadow-purple-100' : 'border-slate-100 bg-slate-50/50'}`}
                                                    >
                                                        <div className="text-left">
                                                            <div className="font-bold text-slate-800 uppercase italic tracking-tight">{sName}</div>
                                                            <div className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{sPrice.toLocaleString()} So'm</div>
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-full border-2 transition-all ${isSel ? 'bg-primary border-primary scale-110' : 'border-slate-200 bg-white'}`} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button disabled={!selectedService} onClick={() => setStep(2)} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-30 mt-4 transition-all">Davom etish</button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-2xl font-bold text-slate-800 uppercase italic tracking-tighter leading-none">Vaqtni tanlang</h3>
                                            <button onClick={() => setStep(1)} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">Orqaga</button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            {timeSlots.map(time => {
                                                const isBooked = bookedSlots.includes(time);
                                                const isSel = selectedTime === time;
                                                return (
                                                    <button
                                                        key={time}
                                                        disabled={isBooked}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`h-16 rounded-[1.5rem] border flex flex-col items-center justify-center transition-all ${isBooked ? 'opacity-20 bg-slate-50 border-transparent grayscale' : isSel ? 'border-primary bg-purple-50 text-primary shadow-lg shadow-purple-100' : 'border-slate-100 bg-white shadow-sm'}`}
                                                    >
                                                        <span className="text-lg font-bold tracking-tighter leading-none">{time}</span>
                                                        <span className="text-[7px] font-bold uppercase tracking-widest mt-1">{isBooked ? 'Band' : 'Ochiq'}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button disabled={!selectedTime} onClick={() => setStep(3)} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-30 mt-4 transition-all">Tasdiqlash</button>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-2xl font-bold text-slate-800 uppercase italic tracking-tighter leading-none">Ma'lumotlar</h3>
                                            <button onClick={() => setStep(2)} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">Orqaga</button>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Ismingiz"
                                                    className="w-full h-16 pl-16 pr-6 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-primary transition-all font-bold text-sm outline-none"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="Telefon raqamingiz"
                                                    className="w-full h-16 pl-16 pr-6 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-primary transition-all font-bold text-sm outline-none"
                                                />
                                            </div>
                                            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col gap-3 mt-4">
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ma'lumotlar</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <span className="text-lg font-bold text-slate-800 uppercase italic leading-none">{selectedService}</span>
                                                    <span className="text-2xl font-bold text-primary tracking-tighter leading-none">{selectedTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={handleSubmit} className="w-full h-16 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 mt-4 transition-all">Yakunlash</button>
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
