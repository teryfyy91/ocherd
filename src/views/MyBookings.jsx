import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Phone, Scissors, Calendar, MapPin, Trash2, ChevronLeft, Star, Check, MessageSquare, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MyBookings = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { myBookings, deleteBooking, addReview } = useStore();

    const [reviewModal, setReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Filter active bookings for the user
    const activeBookings = myBookings.filter(q => q.status !== 'Done');
    const pastBookings = myBookings.filter(q => q.status === 'Done');

    const handleOpenReview = (booking) => {
        setSelectedBooking(booking);
        setReviewModal(true);
    };

    const handleSubmitReview = async () => {
        if (!comment.trim()) return;
        setSubmitting(true);
        const res = await addReview({
            shopId: selectedBooking.shopId,
            userName: selectedBooking.name,
            rating,
            comment
        });
        setSubmitting(false);
        if (res.success) {
            setReviewModal(false);
            setComment('');
            setRating(5);
        } else {
            alert("Xatolik: " + res.error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 text-dark">
            <div className="flex items-center gap-6 mb-12">
                <button
                    onClick={() => navigate('/')}
                    className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-dark hover:bg-gray-50 transition-all group"
                >
                    <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-dark tracking-tight">{t('myBookings')}</h1>
                    <p className="text-gray-500 font-bold mt-1 uppercase tracking-widest text-xs">{t('allControlled')}</p>
                </div>
            </div>

            <div className="space-y-12">
                {/* Active Bookings */}
                <section>
                    <h2 className="text-xl font-black text-dark mb-6 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        Faol navbatlar
                    </h2>

                    {activeBookings.length === 0 ? (
                        <div className="bg-white/60 backdrop-blur-xl border-2 border-dashed border-gray-100 rounded-[2.5rem] p-16 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar size={32} className="text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-black text-xl">Hozircha faol navbatlaringiz yo'q</p>
                            <Link to="/discovery" className="inline-block mt-6 text-primary font-black hover:underline">
                                Yangi navbat band qilish →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {activeBookings.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all relative overflow-hidden"
                                >
                                    {/* Progress Indicator */}
                                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/20">
                                        <div className="w-full bg-primary transition-all duration-1000" style={{ height: item.status === 'In progress' ? '100%' : (item.status === 'Pending' ? '10%' : '50%') }}></div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 ml-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-2xl font-black text-dark tracking-tight">{item.shopName || 'Salon'}</h3>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'In progress' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' :
                                                    item.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-emerald-100 text-emerald-600'}`}>
                                                    {item.status === 'In progress' ? t('inService') :
                                                        item.status === 'Pending' ? 'Tasdiqlash kutilmoqda' :
                                                            'Navbatchisiz'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-gray-500 font-bold">
                                                <div className="flex items-center gap-2.5"><Scissors size={18} className="text-primary" /> {item.service}</div>
                                                <div className="flex items-center gap-2.5"><Clock size={18} className="text-primary" /> {item.time}</div>
                                                <div className="flex items-center gap-2.5"><Phone size={18} /> {item.phone}</div>
                                                <div className="flex items-center gap-2.5 text-xs opacity-60"><MapPin size={18} /> {t('locationDefault')}</div>
                                            </div>
                                        </div>

                                        {/* Live Preview Stats */}
                                        <div className="bg-gray-50 rounded-3xl p-6 flex flex-col items-center justify-center min-w-[200px] border border-gray-100 relative overflow-hidden group">
                                            <div className="relative z-10 text-center">
                                                {item.status === 'In progress' ? (
                                                    <>
                                                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Hozir xizmatda</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-secondary animate-ping"></div>
                                                            <span className="text-2xl font-black text-dark">Sizning navbatingiz</span>
                                                        </div>
                                                    </>
                                                ) : item.status === 'Waiting' ? (
                                                    <>
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Tahminiy kutish</p>
                                                        <div className="text-3xl font-black text-dark">~15 <span className="text-sm">daq</span></div>
                                                        <p className="text-[10px] font-black text-gray-400 mt-2">Oldinda 2 kishi bor</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Kutilmoqda</p>
                                                        <Clock className="mx-auto text-amber-500 animate-pulse mb-1" />
                                                        <p className="text-[10px] font-black text-gray-400">Tasdiqlanishini kuting</p>
                                                    </>
                                                )}
                                            </div>
                                            {/* Decorative background for the live preview card */}
                                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => deleteBooking(item.id)}
                                                className="p-5 bg-white text-gray-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 border border-gray-50 rounded-[2rem] transition-all shadow-sm"
                                                title="Navbatni bekor qilish"
                                            >
                                                <Trash2 size={26} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Past Bookings */}
                {pastBookings.length > 0 && (
                    <section>
                        <h2 className="text-xl font-black text-gray-400 mb-6 flex items-center gap-3 uppercase tracking-widest text-xs">
                            <Clock size={16} />
                            Tugallangan xizmatlar
                        </h2>
                        <div className="grid gap-4">
                            {pastBookings.map((item) => (
                                <div key={item.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-primary/20 transition-all shadow-sm">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-400 decoration-gray-300 line-through text-lg">{item.shopName || 'Salon'}</h4>
                                            <p className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                                {item.service} • {item.time}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleOpenReview(item)}
                                            className="flex-1 sm:flex-none px-6 py-3 bg-primary/10 text-primary rounded-xl font-black text-xs hover:bg-primary hover:text-white transition-all"
                                        >
                                            Izoh qoldirish
                                        </button>
                                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                                            <Check size={20} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {reviewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setReviewModal(false)}
                            className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-lg p-10 relative z-10 shadow-2xl overflow-hidden"
                        >
                            <button onClick={() => setReviewModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-dark transition-colors"><X size={24} /></button>

                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare size={40} />
                                </div>
                                <h3 className="text-3xl font-black text-dark tracking-tight">Fikringizni bildiring</h3>
                                <p className="text-gray-400 font-bold mt-2">"{selectedBooking?.shopName}" xizmati sizga yoqdimi?</p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="p-1 transition-transform active:scale-90"
                                        >
                                            <Star size={48} className={star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-100"} />
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Izohingiz</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full h-32 px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                                        placeholder="Xizmat haqida nima deysiz?..."
                                    />
                                </div>

                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submitting || !comment.trim()}
                                    className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                                >
                                    {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyBookings;
