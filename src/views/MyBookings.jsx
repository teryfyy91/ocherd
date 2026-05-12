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
        <div className="flex flex-col gap-10 pb-32 pt-8">
            <header className="flex flex-col gap-2 mt-4 px-4">
                <h1 className="text-3xl font-extrabold text-slate-800 uppercase leading-none">Navbatlarim</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[8px]">Uchrashuvlaringiz tarixi</p>
            </header>

            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3 px-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <h2 className="text-[9px] font-bold text-slate-800 uppercase tracking-widest">Hozirda faol</h2>
                </div>

                {activeBookings.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-16 rounded-[3rem] text-center flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center text-slate-200">
                            <Calendar size={32} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-black text-slate-800 uppercase italic leading-none">Hali navbat yo'q</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] max-w-[200px] mx-auto leading-loose">Yangi band qilish uchun asosiy sahifaga o'ting</p>
                        </div>
                        <Link to="/" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Discovery</Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5 px-4">
                        {activeBookings.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl opacity-50" />
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col gap-1 w-full flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight leading-none truncate">{item.shopName}</h3>
                                        <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 overflow-x-auto scrollbar-hide">
                                            <span className="flex items-center gap-1.5 flex-shrink-0"><Scissors size={12} className="text-primary" /> {item.service}</span>
                                            <span className="flex items-center gap-1.5 flex-shrink-0"><Clock size={12} className="text-primary" /> {item.time}</span>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex-shrink-0 ml-4 ${item.status === 'In progress' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-500'}`}>
                                        {item.status === 'In progress' ? 'Xizmatda' : 'Kutilmoqda'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Taxminiy vaqt</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-extrabold text-slate-800 tracking-tight leading-none">~15 daqiqa</span>
                                            {item.status === 'In progress' && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteBooking(item.id)}
                                        className="w-12 h-12 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {pastBookings.length > 0 && (
                <div className="flex flex-col gap-6 px-2">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">O'tmishdagi navbatlar</h2>
                    <div className="flex flex-col gap-4">
                        {pastBookings.map((item) => (
                            <div key={item.id} className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 shadow-sm rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                                        <Check size={24} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-bold text-slate-800 uppercase leading-none text-sm truncate">{item.shopName}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{item.service} • {item.time}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleOpenReview(item)}
                                    className="px-6 py-3 bg-white border border-slate-200 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-primary hover:text-white transition-all"
                                >
                                    Fikr bildirish
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {reviewModal && (
                    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReviewModal(false)} className="absolute inset-0 bg-white/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white border border-slate-100 p-10 rounded-[3rem] w-full max-w-md relative z-10 shadow-2xl">
                            <button onClick={() => setReviewModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-800 transition-colors"><X size={20} /></button>

                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <MessageSquare size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 tracking-tight uppercase text-center leading-none">Fikringiz</h3>
                                <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-center text-[10px]">{selectedBooking?.shopName}</p>
                            </div>

                            <div className="flex flex-col gap-10">
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} onClick={() => setRating(star)} className="transition-transform active:scale-90">
                                            <Star size={36} className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-100"} />
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Izoh qoldiring</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full h-32 bg-slate-50 border border-slate-100 px-10 pt-8 pb-6 rounded-[2.5rem] outline-none text-slate-800 font-bold placeholder:text-slate-300 transition-all resize-none text-sm"
                                        placeholder="Xizmat qanday bo'ldi?..."
                                    />
                                </div>

                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submitting || !comment.trim()}
                                    className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
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
