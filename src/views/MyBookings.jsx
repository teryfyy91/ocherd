import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Phone, Scissors, Calendar, MapPin, Trash2, Star, Check, MessageSquare, X } from 'lucide-react';
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
        }
    };

    return (
        <div className="flex flex-col gap-10 pb-32">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mt-4"
            >
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Mening navbatlarim
                    </h1>
                    <p className="text-text-muted font-medium">Barcha uchrashuvlaringiz bir joyda</p>
                </div>
            </motion.div>

            {/* Active Bookings */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Faol navbatlar</h2>
                </div>

                {activeBookings.length === 0 ? (
                    <div className="glass-card p-12 text-center flex flex-col items-center gap-4 border-dashed border-white/10">
                        <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-text-muted opacity-20">
                            <Calendar size={32} />
                        </div>
                        <p className="text-text-muted font-bold">Hozircha faol uchrashuvlar yo'q</p>
                        <Link to="/discovery" className="btn-primary py-3 px-8 text-sm">
                            Yangi band qilish
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {activeBookings.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card p-6 flex flex-col gap-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: item.status === 'In progress' ? '100%' : '30%' }}
                                        className="w-full bg-primary shadow-[0_0_15px_rgba(0,200,151,0.5)]"
                                    />
                                </div>

                                <div className="flex justify-between items-start ml-2">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-xl font-bold text-white tracking-tight">{item.shopName}</h3>
                                        <div className="flex items-center gap-4 text-xs font-bold text-text-muted">
                                            <span className="flex items-center gap-1.5"><Scissors size={14} className="text-primary" /> {item.service}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> {item.time}</span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/5 ${item.status === 'In progress' ? 'text-primary border-primary/20 bg-primary/5' : 'text-amber-400'}`}>
                                        {item.status === 'In progress' ? 'Xizmatda' : 'Kutilmoqda'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between ml-2 pt-4 border-t border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Taxminiy vaqt</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-black text-white">~15 daqiqa</span>
                                            {item.status === 'In progress' && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteBooking(item.id)}
                                        className="w-12 h-12 glass rounded-xl flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
                <div className="flex flex-col gap-6 opacity-60">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-black text-white/50 uppercase tracking-widest">Tugallanganlar</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        {pastBookings.map((item) => (
                            <div key={item.id} className="glass-card p-5 flex items-center justify-between bg-white/2 border-white/2">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-text-muted/30">
                                        <Check size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="font-bold text-white/70">{item.shopName}</h4>
                                        <p className="text-xs font-bold text-text-muted">{item.service} • {item.time}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleOpenReview(item)}
                                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-bg transition-all"
                                >
                                    Izoh qoldirish
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Review Modal */}
            <AnimatePresence>
                {reviewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setReviewModal(false)}
                            className="absolute inset-0 bg-bg/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card w-full max-w-md p-10 relative z-10 border-white/10 shadow-2xl"
                        >
                            <button onClick={() => setReviewModal(false)} className="absolute top-8 right-8 text-text-muted hover:text-white transition-colors"><X size={20} /></button>

                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Fikringiz</h3>
                                <p className="text-text-muted font-bold mt-2 text-sm">{selectedBooking?.shopName}</p>
                            </div>

                            <div className="flex flex-col gap-8">
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star size={32} className={star <= rating ? "fill-amber-400 text-amber-400" : "text-white/10"} />
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Izoh</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full h-32 glass-card bg-white/5 border-white/5 p-6 rounded-2xl outline-none text-white font-bold placeholder:text-text-muted transition-all resize-none"
                                        placeholder="Xizmat haqida nima deysiz?..."
                                    />
                                </div>

                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submitting || !comment.trim()}
                                    className="btn-primary py-5 disabled:opacity-30 disabled:grayscale"
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
