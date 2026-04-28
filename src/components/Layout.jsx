import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-bg text-text-main selection:bg-primary selection:text-bg">
            <Navbar />
            <main className="w-full max-w-7xl mx-auto min-h-screen relative overflow-hidden pt-10">
                {/* Background decorative glow - moved further up/down */}
                <div className="absolute -top-48 -right-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute -bottom-48 -left-24 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

                <div className="relative px-6 pt-16 pb-40">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};


export default Layout;
