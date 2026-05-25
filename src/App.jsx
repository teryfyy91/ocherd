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
  const [awaitingApproval, setAwaitingApproval] = useState(false);

  const handleLogin = (role) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    setIsLoggedIn(true);
    setUserRole(role);
  };

  useEffect(() => {
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    if (hasShownSplash) {
      setShowSplash(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('hasShownSplash', 'true');
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const [isChecking, setIsChecking] = useState(true);

  // Synchronize local login state with current user from Supabase
  useEffect(() => {
    let mounted = true;

    const checkAndSync = async () => {
      if (loadingUser) return;

      if (currentUser) {
        const userMeta = currentUser.user_metadata || {};
        const userPhone = userMeta.phone || '';
        const isAdmin = userPhone.includes('505521107');
        const isOwner = userMeta.role === 'owner';

        if (mounted) {
          if (!localStorage.getItem('userRole')) {
            localStorage.setItem('userRole', isOwner ? 'owner' : 'user');
            setUserRole(isOwner ? 'owner' : 'user');
          }

          if (isOwner && !isAdmin) {
            try {
              const { data: shopData } = await supabase.from('shops').select('id, status').eq('owner_id', currentUser.id).limit(1);
              const { data: pendingData } = await supabase.from('pending_salons').select('id, status').eq('owner_id', currentUser.id).limit(1);

              if (mounted) {
                const hasActiveShop = shopData?.length > 0 && shopData[0].status === 'Active';
                const hasPending = (shopData?.length > 0 && shopData[0].status === 'Pending') || (pendingData?.length > 0);

                if (!hasActiveShop && hasPending) {
                  setAwaitingApproval(true);
                  setIsLoggedIn(false);
                } else {
                  setIsLoggedIn(true);
                  localStorage.setItem('isLoggedIn', 'true');
                }
              }
            } catch (err) {
              console.error('Verify error:', err);
            }
          } else {
            setIsLoggedIn(true);
            localStorage.setItem('isLoggedIn', 'true');
          }
          setIsChecking(false);
        }
      } else {
        if (mounted) {
          const isBypass = localStorage.getItem('authBypass') === 'true';
          const wasLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
          if (wasLoggedIn && !isBypass && !loadingUser) {
            setIsLoggedIn(false);
            localStorage.removeItem('isLoggedIn');
          }
          setIsChecking(false);
        }
      }
    };

    checkAndSync();
    return () => { mounted = false; };
  }, [currentUser, loadingUser]);



  // Only show splash if it's the first time in this session AND we are not already logged in
  const shouldShowSplash = showSplash && !sessionStorage.getItem('hasShownSplash') && !localStorage.getItem('isLoggedIn');

  if ((shouldShowSplash || loadingUser || isChecking) && !isLoggedIn) {
    return (
      <AnimatePresence>
        <SplashScreen key="splash" />
      </AnimatePresence>
    );
  }

  // If awaiting approval, show ONLY the pending screen — block all routing
  if (awaitingApproval) {
    return (
      <PendingApproval
        onConfirm={async () => {
          await supabase.auth.signOut();
          setAwaitingApproval(false);
          setIsLoggedIn(false);
          window.location.href = '/';
        }}
      />
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

              <Route path="dashboard" element={
                (localStorage.getItem('currentUserPhone')?.replace(/\D/g, '').includes('505521107'))
                  ? <AdminDashboard />
                  : (localStorage.getItem('userRole') === 'owner' ? <Dashboard /> : <Navigate to="/" replace />)
              } />

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
