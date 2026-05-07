import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './context/StoreContext';
import Layout from './components/Layout';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard';
import AdminDashboard from './views/AdminDashboard';
import Booking from './views/Booking';
import Gateway from './views/Gateway';
import QueueDisplay from './views/QueueDisplay';
import Login from './views/Login';
import Success from './views/Success';
import MyBookings from './views/MyBookings';
import SplashScreen from './components/SplashScreen';
import PwaInstallPopup from './components/PwaInstallPopup';
import PwaUpdatePopup from './components/PwaUpdatePopup';
import { AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { supabase } from './utils/supabase';

function App() {
  const { currentUser, loadingUser } = useStore();
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));
  const [showSplash, setShowSplash] = useState(true);

  const handleLogin = (role) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    setIsLoggedIn(true);
    setUserRole(role);
  };



  const [showApprovalGate, setShowApprovalGate] = useState(false);

  // Poll for the registration flag (brute force but 100% reliable)
  useEffect(() => {
    const timer = setInterval(() => {
      const isAwaiting = sessionStorage.getItem('awaitingApproval') === 'true';
      if (isAwaiting !== showApprovalGate) {
        setShowApprovalGate(isAwaiting);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [showApprovalGate]);

  // Synchronize local login state with current user from Supabase
  useEffect(() => {
    const checkAndSync = async () => {
      if (!loadingUser) {
        if (currentUser && !showApprovalGate) {
          const userMeta = currentUser.user_metadata || {};
          const userPhone = userMeta.phone || '';
          const isAdmin = userPhone.includes('505521107');
          const isOwner = userMeta.role === 'owner';

          // For non-admin salon owners, verify shop approval before granting access
          if (isOwner && !isAdmin) {
            const { data: shopData } = await supabase
              .from('shops')
              .select('status')
              .eq('owner_id', currentUser.id)
              .single();

            if (shopData && shopData.status === 'Pending') {
              // Block access — show approval gate and sign out
              sessionStorage.setItem('awaitingApproval', 'true');
              await supabase.auth.signOut();
              return;
            }
          }
          setIsLoggedIn(true);
        } else if (!currentUser) {
          setIsLoggedIn(false);
          localStorage.removeItem('isLoggedIn');
        }
      }
    };
    checkAndSync();
  }, [currentUser, loadingUser, showApprovalGate]);

  // Handle Splash Screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000); // 1 second minimum splash duration

    return () => clearTimeout(timer);
  }, []);

  if (showApprovalGate) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#7C3AED]/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#7C3AED]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="glass-card bg-white border-slate-100 p-12 md:p-20 rounded-[3rem] flex flex-col items-center gap-10 shadow-2xl border-2 max-w-xl w-full">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#7C3AED] rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-purple-500/30">
            <Clock size={48} className="md:size-16" />
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl md:text-6xl font-black text-slate-800 italic tracking-tighter uppercase leading-[0.9]">
              Sorovnomangiz <br /> yuborildi!
            </h2>
            <p className="text-[#7C3AED] font-black uppercase tracking-[0.4em] text-[10px] md:text-sm opacity-90 leading-relaxed">
              Admin tasdiqlashini kuting. <br /> Tez orada faol bo'ladi.
            </p>
          </div>
          <button
            onClick={async () => {
              sessionStorage.removeItem('awaitingApproval');
              await supabase.auth.signOut();
              localStorage.clear();
              window.location.href = '/'; // HARD RESET
            }}
            className="w-full py-8 md:py-10 bg-[#7C3AED] text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-purple-500/30 mt-6"
          >
            Tushunarli
          </button>
        </div>
      </div>
    );
  }

  if (showSplash || loadingUser) {
    return (
      <AnimatePresence>
        {(showSplash || loadingUser) && <SplashScreen key="splash" />}
      </AnimatePresence>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <Login key="login" onLogin={handleLogin} />
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={
                  (localStorage.getItem('userRole') === 'owner' || localStorage.getItem('currentUserPhone') === '+998505521107')
                    ? <Navigate to="/dashboard" replace />
                    : <Landing />
                } />
                <Route path="discovery" element={<Gateway />} />
                <Route path="booking" element={<Booking />} />
                <Route path="success" element={<Success />} />
                <Route path="my-bookings" element={<MyBookings />} />
              </Route>

              {/* Admin Dashboard has its own sidebar layout */}
              <Route path="dashboard" element={<AdminDashboard />} />

              {/* Display doesn't use the main Layout with Navbar */}
              <Route path="/display" element={<QueueDisplay />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        )}
      </AnimatePresence>
      <PwaInstallPopup />
      <PwaUpdatePopup />
    </>
  );
}

export default App;
