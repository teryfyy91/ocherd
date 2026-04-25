import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-bg text-text selection:bg-primary selection:text-bg">
            <Navbar />
            <main className="w-full max-w-md mx-auto min-h-[calc(100vh-64px)] relative overflow-hidden">
                {/* Background decorative glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative px-5 py-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};


export default Layout;
