import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    const location = useLocation();
    const isBookingPage = location.pathname === '/booking';

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-[#7C3AED] selection:text-white">
            {!isBookingPage && <Navbar />}
            <main className="w-full max-w-lg mx-auto min-h-screen relative overflow-hidden">
                {/* Background decorative glow */}
                <div className="absolute -top-48 -right-24 w-[400px] h-[400px] bg-[#7C3AED]/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-48 -left-24 w-[400px] h-[400px] bg-[#7C3AED]/5 rounded-full blur-[100px] pointer-events-none" />

                <div className={`relative px-6 ${isBookingPage ? 'pt-0 pb-10' : 'pt-10 pb-32'}`}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;

