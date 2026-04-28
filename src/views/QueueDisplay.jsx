import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Monitor, User, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const QueueDisplay = () => {
    const { t } = useTranslation();
    const { shopInfo, queue } = useStore();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const activeQueue = queue.filter(q => q.status !== 'Done');
    const servingNow = activeQueue.find(q => q.status === 'In progress');
    const waitingQueue = activeQueue.filter(q => q.status === 'Waiting');

    return (
        <div className="min-h-screen bg-bg text-text-main flex flex-col p-12 overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10" />

            {/* Header */}
            <header className="flex justify-between items-end mb-16 relative z-10">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-primary">
                            <Users size={28} />
                        </div>
                        <h1 className="text-5xl font-black tracking-tight">{shopInfo.name || 'OCHERD'}</h1>
                    </div>
                    <div className="flex items-center gap-3 text-text-muted font-bold text-xl ml-16">
                        <span className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                        Jonli Navbat Tizimi
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="text-7xl font-black text-text-main tracking-tight tabular-nums">
                        {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xl font-bold text-text-muted uppercase tracking-widest">
                        {currentTime.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
            </header>

            <main className="flex-1 grid grid-cols-12 gap-12 relative z-10">
                {/* Now Serving Section */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
                    <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.4em] ml-2">Hozir xizmatda</h2>
                    <div className="flex-1 glass-card p-12 flex flex-col justify-center items-center text-center relative overflow-hidden border-primary/20 bg-primary/5">
                        <div className="absolute inset-0 bg-primary/5 blur-[100px]" />

                        <AnimatePresence mode="wait">
                            {servingNow ? (
                                <motion.div
                                    key={servingNow.id}
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="relative z-10 flex flex-col items-center gap-8 w-full"
                                >
                                    <div className="glass rounded-3xl p-10 w-full mb-4 shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-white/5">
                                        <div className="text-xl font-black text-primary uppercase tracking-widest mb-6">Mijoz</div>
                                        <div className="text-8xl font-black text-white tracking-tighter mb-4 leading-tight">
                                            {servingNow.name}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 glass px-10 py-6 rounded-[2rem] border-white/5">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">Xizmat</span>
                                            <span className="text-2xl font-black text-text-main">{servingNow.service}</span>
                                        </div>
                                        <div className="w-px h-10 bg-white/10" />
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">Vaqt</span>
                                            <span className="text-2xl font-black text-text-main">{servingNow.time}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center gap-6 opacity-20"
                                >
                                    <Monitor size={120} strokeWidth={1} />
                                    <p className="text-3xl font-black uppercase tracking-widest">Navbat kutilmoqda</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Queue List Section */}
                <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
                    <div className="flex justify-between items-end ml-2">
                        <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.4em]">Keyingi navbatlar</h2>
                        <div className="glass px-4 py-2 rounded-xl text-primary font-black text-sm border-white/5">
                            {waitingQueue.length} kishi kutilmoqda
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                        <AnimatePresence>
                            {waitingQueue.slice(0, 5).map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`glass-card p-8 flex items-center justify-between border-white/5 transition-all ${index === 0 ? 'bg-white/10 border-white/10 scale-105 shadow-2xl relative z-20' : 'opacity-40'}`}
                                >
                                    <div className="flex items-center gap-8">
                                        <div className={`text-5xl font-black italic tracking-tighter ${index === 0 ? 'text-primary' : 'text-white/20'}`}>
                                            0{index + 1}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-3xl font-black text-white tracking-tight">{item.name}</h3>
                                            <p className="text-lg font-bold text-text-muted">
                                                {item.service}
                                                {index === 0 && <span className="ml-4 text-xs font-black bg-primary text-bg px-3 py-1 rounded-full uppercase tracking-widest">Keyingi</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-[1.5rem] border border-white/5">
                                        <Clock size={24} className="text-primary" />
                                        <span className="text-3xl font-black text-text-main tabular-nums">{item.time}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {waitingQueue.length > 5 && (
                            <div className="text-center py-6 glass-card border-none bg-white/2">
                                <span className="text-text-muted font-black text-lg uppercase tracking-[0.3em]">
                                    + yana {waitingQueue.length - 5} kishi navbatda
                                </span>
                            </div>
                        )}

                        {waitingQueue.length === 0 && (
                            <div className="flex-1 glass-card border-dashed border-white/10 flex flex-center items-center justify-center opacity-10">
                                <User size={80} />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-12 flex justify-center opacity-30">
                <p className="text-xs font-black uppercase tracking-[0.5em] text-white">
                    OCHERD Smart Queue Management • Premium Experience
                </p>
            </footer>
        </div>
    );
};

export default QueueDisplay;
