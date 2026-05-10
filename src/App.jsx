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
  const [isPendingApproval, setIsPendingApproval] = useState(false);

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
              .select('status')
              .eq('owner_id', currentUser.id)
              .maybeSingle();

            const { data: pendingData } = await supabase
              .from('pending_salons')
              .select('status')
              .eq('owner_id', currentUser.id)
              .maybeSingle();

            const isApproved = shopData && shopData.status === 'Active';
            const isPending = (shopData && shopData.status === 'Pending') || (pendingData && pendingData.status === 'pending');

            if (!isApproved || isPending) {
              alert("Xurmatli mijoz, sizning saloningiz hali tasdiqlanmagan. Iltimos admin tasdiqlashini kuting!");
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

  const handlePendingConfirm = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setIsPendingApproval(false);
  };

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
