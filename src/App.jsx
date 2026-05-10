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
import PendingApproval from './components/PendingApproval';
import PwaInstallPopup from './components/PwaInstallPopup';
import PwaUpdatePopup from './components/PwaUpdatePopup';
import { AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { supabase } from './utils/supabase';

function App() {
  const { currentUser, loadingUser, sendNotification } = useStore();
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));
  const [showSplash, setShowSplash] = useState(true);

  const handleLogin = (role) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    setIsLoggedIn(true);
    setUserRole(role);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [isChecking, setIsChecking] = useState(true);
  const [pendingLoginError, setPendingLoginError] = useState(false);

  // Synchronize local login state with current user from Supabase
  useEffect(() => {
    const checkAndSync = async () => {
      if (!loadingUser) {
        setIsChecking(true);
        if (currentUser) {
          const userMeta = currentUser.user_metadata || {};
          const userPhone = userMeta.phone || '';
          const isAdmin = userPhone.includes('505521107');
          const isOwner = userMeta.role === 'owner';

          // For non-admin salon owners, verify shop approval before granting access
          if (isOwner && !isAdmin) {
            const { data: shopData } = await supabase
              .from('shops')
              .select('id')
              .eq('owner_id', currentUser.id)
              .limit(1);

            const isApproved = shopData && shopData.length > 0;

            if (!isApproved) {
              setPendingLoginError(true);
              await supabase.auth.signOut();
              localStorage.removeItem('isLoggedIn');
              setIsLoggedIn(false);
              setIsChecking(false);
              return;
            }
          }
          setIsLoggedIn(true);
        } else if (!currentUser) {
          setIsLoggedIn(false);
          localStorage.removeItem('isLoggedIn');
        }
        setIsChecking(false);
      }
    };
    checkAndSync();
  }, [currentUser, loadingUser]);



  if (showSplash || loadingUser || isChecking) {
    return (
      <AnimatePresence>
        {(showSplash || loadingUser || isChecking) && <SplashScreen key="splash" />}
      </AnimatePresence>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {pendingLoginError && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white p-10 rounded-[3rem] text-center max-w-sm flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
              <div className="w-20 h-20 bg-primary/10 text-primary border border-primary/20 rounded-[2rem] flex items-center justify-center rotate-6">
                <Clock size={40} />
              </div>
              <div className="relative z-10 w-full">
                <h3 className="text-2xl font-black text-slate-800 uppercase italic">Kutilmoqda</h3>
                <p className="text-[11px] text-slate-500 font-bold mt-3 uppercase tracking-widest leading-loose">
                  Xurmatli mijoz, saloningiz hali admin tomonidan tasdiqlanmagan. Iltimos kuting.
                </p>
              </div>
              <button onClick={() => setPendingLoginError(false)} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest mt-2 active:scale-95 transition-all outline-none">
                Tushunarli
              </button>
            </motion.div>
          </div>
        )}
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

              <Route path="dashboard" element={
                localStorage.getItem('currentUserPhone')?.replace(/\D/g, '').includes('505521107')
                  ? <AdminDashboard />
                  : <Dashboard />
              } />

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
