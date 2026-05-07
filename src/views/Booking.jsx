import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, User, Phone, CheckCircle2, ChevronLeft,
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

    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [errorMsg, setErrorMsg] = useState('');

    if (!shopInfo || !shopInfo.name) {
        return <Navigate to="/discovery" replace />;
    }

    const timeSlots = generateTimeSlots(shopInfo.workingHours?.start || '09:00', shopInfo.workingHours?.end || '18:00');
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

    const recentWork = [
        "https://images.unsplash.com/photo-1599351473299-d8395e693175?w=400&q=80",
        "https://images.unsplash.com/photo-1621605815841-db897cfd5118?w=400&q=80",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80",
        "https://images.unsplash.com/photo-1622286332618-f28939b4bb6d?w=400&q=80"
    ];

    return (
        <div className="flex flex-col gap-6 pb-40 -mt-6 -mx-6">
            {/* Top Detail View */}
            <div className="relative h-[45vh] w-full">
                <img
                    src={shopInfo.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1000&q=80"}
                    alt={shopInfo.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Header Controls */}
                <div className="absolute top-10 left-6 right-6 flex justify-between items-center z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform">
                        <Share2 size={20} />
                    </button>
                </div>

                <div className="absolute bottom-10 left-6 right-6 z-10">
                    <h1 className="text-3xl font-black text-white mb-2">{shopInfo.name}</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 bg-[#7C3AED] text-white px-3 py-1 rounded-full text-xs font-black">
                            <Star size={12} fill="white" /> 4.8 (292 Reviews)
                        </div>
                        <div className="flex items-center gap-1 text-white/80 text-xs font-bold">
                            <MapPin size={14} /> Tashkent, Uzbekistan
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 grid grid-cols-4 gap-3 mt-2">
                {[
                    { icon: Phone, label: 'Call', color: 'text-blue-500 bg-blue-50' },
                    { icon: MessageSquare, label: 'Message', color: 'text-purple-500 bg-purple-50' },
                    { icon: Navigation, label: 'Direction', color: 'text-emerald-500 bg-emerald-50' },
                    { icon: Globe, label: 'Website', color: 'text-orange-500 bg-orange-50' }
                ].map((btn, i) => (
                    <button key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${btn.color} active:scale-95 transition-transform`}>
                            <btn.icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{btn.label}</span>
                    </button>
                ))}
            </div>

            {/* Description / Info */}
            <div className="px-6 flex flex-col gap-3">
                <h2 className="text-lg font-black text-slate-800">About Salon</h2>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    Enjoy a premium grooming experience at {shopInfo.name}. Our expert barbers specialize in classic cuts, modern fades, and professional styling tailored just for you.
                </p>
            </div>

            {/* Recent Work */}
            <div className="px-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-slate-800">Our Recent Work</h2>
                    <button className="text-[#7C3AED] text-xs font-bold">See All »</button>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-10">
                    {recentWork.map((img, i) => (
                        <div key={i} className="aspect-square rounded-[1.5rem] overflow-hidden border border-slate-100">
                            <img src={img} alt="work" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Book Now Fixed Button */}
            <div className="fixed bottom-8 left-6 right-6 z-40">
                <button
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full h-16 bg-[#7C3AED] text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-purple-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                    Book Appointment
                </button>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {isBookingOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsBookingOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-lg rounded-t-[3rem] p-8 pb-12 relative z-10 shadow-2xl overflow-y-auto max-h-[85vh] scrollbar-hide"
                        >
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />

                            {/* Stepper */}
                            <div className="flex mb-8 gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-[#7C3AED]' : 'bg-slate-100'}`} />
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <h3 className="text-xl font-black text-slate-800 mb-6">Choose Service</h3>
                                        <div className="flex flex-col gap-3">
                                            {shopInfo.services.map((service, idx) => {
                                                const parsed = typeof service === 'string' && service.startsWith('{') ? JSON.parse(service) : service;
                                                const sName = typeof parsed === 'object' ? parsed.name : parsed;
                                                const sPrice = typeof parsed === 'object' ? parsed.price : 50000;
                                                const isSel = selectedService === sName;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedService(sName)}
                                                        className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${isSel ? 'border-[#7C3AED] bg-purple-50/50' : 'border-slate-50 bg-slate-50/50'}`}
                                                    >
                                                        <div className="text-left">
                                                            <div className="font-bold text-slate-800">{sName}</div>
                                                            <div className="text-xs font-black text-[#7C3AED]">{sPrice.toLocaleString()} UZS</div>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border-2 ${isSel ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-200'}`} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button disabled={!selectedService} onClick={() => setStep(2)} className="w-full h-14 bg-[#7C3AED] text-white rounded-2xl font-black mt-8 disabled:opacity-30">Next Step</button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-black text-slate-800">Select Time</h3>
                                            <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-400">Back</button>
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
                                                        className={`h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${isBooked ? 'opacity-20 bg-slate-100 border-transparent' : isSel ? 'border-[#7C3AED] bg-purple-50 text-[#7C3AED]' : 'border-slate-50 bg-slate-50'}`}
                                                    >
                                                        <span className="text-base font-black">{time}</span>
                                                        <span className="text-[7px] font-black uppercase opacity-50">{isBooked ? 'Full' : 'Free'}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button disabled={!selectedTime} onClick={() => setStep(3)} className="w-full h-14 bg-[#7C3AED] text-white rounded-2xl font-black mt-8 disabled:opacity-30">Confirm Details</button>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-black text-slate-800">Your Info</h3>
                                            <button onClick={() => setStep(2)} className="text-xs font-bold text-slate-400">Back</button>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Your Name"
                                                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#7C3AED] transition-all font-bold text-sm outline-none"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="Phone Number"
                                                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#7C3AED] transition-all font-bold text-sm outline-none"
                                                />
                                            </div>
                                            <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col gap-2 mt-2">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-slate-400 uppercase">Summary</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-bold text-slate-800">{selectedService}</span>
                                                    <span className="text-sm font-black text-[#7C3AED]">{selectedTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={handleSubmit} className="w-full h-16 bg-[#7C3AED] text-white rounded-2xl font-black mt-8 shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all">
                                            Finalize Appointment
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

