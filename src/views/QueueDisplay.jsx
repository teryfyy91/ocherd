import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Monitor, User, Users, Scissors } from 'lucide-react';
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
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col p-8 md:p-16 overflow-hidden relative font-['Inter']">
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[200px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[200px] -z-10" />

            <header className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-8 relative z-10">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/30">
                            <Scissors size={40} />
                        </div>
                        <div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">{shopInfo.name || 'BarberOS'}</h1>
                            <div className="flex items-center gap-3 text-slate-400 font-black text-xl uppercase tracking-widest mt-2">
                                <span className="w-3 h-3 bg-primary rounded-full animate-ping" />
                                Jonli Navbat
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center md:items-end gap-2 bg-white/50 backdrop-blur-md px-10 py-6 rounded-[2.5rem] border border-white shadow-xl shadow-slate-100">
                    <div className="text-7xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                        {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-lg font-black text-slate-400 uppercase tracking-[0.4em]">
                        {currentTime.toLocaleDateString('uz-UZ', { weekday: 'long' })}
                    </div>
                </div>
            </header>

            <main className="flex-1 grid grid-cols-12 gap-10 md:gap-16 relative z-10">
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-10">
                    <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Hozir xizmatda</h2>
                    <div className="flex-1 bg-white border border-slate-100 p-16 rounded-[4rem] flex flex-col justify-center items-center text-center relative overflow-hidden shadow-2xl shadow-slate-200/50 group">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <AnimatePresence mode="wait">
                            {servingNow ? (
                                <motion.div
                                    key={servingNow.id}
                                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="relative z-10 flex flex-col items-center gap-10 w-full"
                                >
                                    <div className="bg-slate-50 rounded-[3.5rem] p-12 w-full mb-6 border border-slate-100 shadow-sm relative">
                                        <div className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-8">Mijoz</div>
                                        <div className="text-8xl md:text-9xl font-black text-slate-900 tracking-tighter mb-4 leading-none uppercase italic">
                                            {servingNow.name}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10 bg-slate-900 text-white px-12 py-8 rounded-[2.5rem] shadow-2xl shadow-slate-300">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Xizmat</span>
                                            <span className="text-3xl font-black italic uppercase tracking-tight">{servingNow.service}</span>
                                        </div>
                                        <div className="w-px h-12 bg-white/10" />
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Boshlandi</span>
                                            <span className="text-3xl font-black tabular-nums">{servingNow.time}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} className="flex flex-col items-center gap-8">
                                    <Monitor size={140} strokeWidth={1} />
                                    <p className="text-4xl font-black uppercase tracking-[0.4em] italic">Navbat Bo'sh</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-7 flex flex-col gap-10">
                    <div className="flex justify-between items-end ml-4">
                        <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em]">Navbatdagilar</h2>
                        <div className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
                            {waitingQueue.length} Kishi kutilmoqda
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-6 px-1">
                        <AnimatePresence>
                            {waitingQueue.slice(0, 5).map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`bg-white p-10 rounded-[3rem] flex items-center justify-between border border-slate-100 shadow-xl shadow-slate-100 transition-all ${index === 0 ? 'ring-4 ring-primary ring-offset-8 scale-105 relative z-20 shadow-2xl shadow-primary/20 bg-purple-50/10' : 'opacity-60 grayscale-[0.5]'}`}
                                >
                                    <div className="flex items-center gap-12">
                                        <div className={`text-6xl font-black italic tracking-tighter tabular-nums ${index === 0 ? 'text-primary' : 'text-slate-200'}`}>
                                            0{index + 1}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">{item.name}</h3>
                                            <div className="flex items-center gap-4">
                                                <p className="text-xl font-black text-slate-400 uppercase tracking-widest leading-none">
                                                    {item.service}
                                                </p>
                                                {index === 0 && <span className="text-[10px] font-black bg-primary text-white px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">Navbatdagi</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-4 px-10 py-6 rounded-[2rem] border ${index === 0 ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                        <span className="text-4xl font-black tabular-nums tracking-tighter">{item.time}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {waitingQueue.length > 5 && (
                            <div className="text-center py-10 bg-slate-100/50 rounded-[3rem] border border-dashed border-slate-200">
                                <span className="text-slate-400 font-black text-2xl uppercase tracking-[0.4em] italic opacity-50">
                                    + yana {waitingQueue.length - 5} kishi navbatda
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="mt-16 flex justify-between items-center px-4 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 italic">
                    BarberOS • Premium Queue Management System
                </p>
                <div className="flex gap-4">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                    <div className="w-12 h-1.5 bg-primary rounded-full" />
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>
            </footer>
        </div>
    );
};

export default QueueDisplay;
