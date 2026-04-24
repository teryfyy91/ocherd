import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Monitor, User } from 'lucide-react';
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
        <div className="min-h-screen bg-dark text-white flex flex-col p-6 font-sans">
            {/* Header */}
            <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">{shopInfo.name || 'QueueFlow'}</h1>
                    <p className="text-gray-400 text-lg">{t('liveQueueDisplay')}</p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-bold text-primary font-mono tabular-nums">
                        {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-gray-400 mt-2">{currentTime.toLocaleDateString()}</div>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Currently Serving */}
                <div className="lg:col-span-5 flex flex-col">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-300">{t('nowServing')}</h2>
                    <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-700 p-8 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
                        {/* Ambient glow */}
                        <div className="absolute top-0 left-0 w-full h-full bg-primary/5 blur-3xl rounded-full"></div>

                        {servingNow ? (
                            <motion.div
                                key={servingNow.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative z-10"
                            >
                                <div className="text-primary font-bold tracking-widest uppercase mb-4 text-xl">{t('currentCustomer')}</div>
                                <div className="text-6xl sm:text-7xl font-black mb-6 text-white truncate w-full max-w-sm px-4">
                                    {servingNow.name}
                                </div>
                                <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full text-xl text-gray-200">
                                    <span className="font-semibold text-secondary">{servingNow.service}</span>
                                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                    <span>{servingNow.time}</span>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center relative z-10">
                                <Monitor size={64} className="mb-4 opacity-50" />
                                <p className="text-2xl font-medium">{t('readyForNext')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Up Next List */}
                <div className="lg:col-span-7 flex flex-col">
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-2xl font-semibold text-gray-300">{t('upNext')}</h2>
                        <span className="bg-gray-800 px-4 py-1 rounded-full text-primary font-bold">
                            {waitingQueue.length} {t('waiting')}
                        </span>
                    </div>

                    <div className="flex-1 bg-gray-900 rounded-3xl border border-gray-800 p-2 overflow-hidden">
                        {waitingQueue.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <User size={48} className="mb-4 opacity-30" />
                                <p className="text-xl">{t('noOneWaiting')}</p>
                            </div>
                        ) : (
                            <div className="h-full overflow-hidden flex flex-col gap-2 p-4">
                                <AnimatePresence>
                                    {waitingQueue.slice(0, 6).map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className={`flex items-center justify-between p-6 rounded-2xl ${index === 0 ? 'bg-primary/20 border border-primary/30' : 'bg-gray-800/50'}`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${index === 0 ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h3 className={`text-2xl font-bold ${index === 0 ? 'text-white' : 'text-gray-200'}`}>
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-gray-400 mt-1 flex items-center gap-2">
                                                        {item.service}
                                                        {index === 0 && <span className="bg-primary/30 text-primary text-xs px-2 py-0.5 rounded uppercase font-bold">{t('next')}</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-2xl font-semibold text-gray-300 bg-gray-900 px-4 py-2 rounded-xl">
                                                <Clock size={24} className={index === 0 ? 'text-primary' : 'text-gray-500'} />
                                                {item.time}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {waitingQueue.length > 6 && (
                                    <div className="text-center py-4 text-gray-500 font-medium">
                                        + {waitingQueue.length - 6} {t('moreWaiting')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueueDisplay;
