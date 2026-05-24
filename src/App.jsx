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
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [isChecking, setIsChecking] = useState(true);

  // Synchronize local login state with current user from Supabase
  useEffect(() => {
    const checkAndSync = async () => {
      // Don't do anything while auth is still initializing
      if (loadingUser) return;

      setIsChecking(true);

      if (currentUser) {
        const userMeta = currentUser.user_metadata || {};
        const userPhone = userMeta.phone || '';
        const isAdmin = userPhone.includes('505521107');
        const isOwner = userMeta.role === 'owner';

        // Restore missing info in localStorage from Supabase metadata if needed
        if (!localStorage.getItem('userRole')) {
          localStorage.setItem('userRole', isOwner ? 'owner' : 'user');
          setUserRole(isOwner ? 'owner' : 'user');
        }
        if (!localStorage.getItem('currentUserPhone')) {
          localStorage.setItem('currentUserPhone', userPhone);
        }

        // For non-admin salon owners, verify shop approval before granting access
        if (isOwner && !isAdmin) {
          try {
            // Check established shops
            const { data: shopData } = await supabase
              .from('shops')
              .select('id, status')
              .eq('owner_id', currentUser.id)
              .limit(1);

            const hasActiveShop = shopData && shopData.length > 0 && shopData[0].status === 'Active';
            const hasPendingShop = shopData && shopData.length > 0 && shopData[0].status === 'Pending';

            // Also check pending registrations
            const { data: pendingData } = await supabase
              .from('pending_salons')
              .select('id, status')
              .eq('owner_id', currentUser.id)
              .limit(1);

            const hasPendingRegistration = pendingData && pendingData.length > 0 && pendingData[0].status === 'pending';

            if (!hasActiveShop && (hasPendingShop || hasPendingRegistration)) {
              // Pending approval — block all dashboard access
              setAwaitingApproval(true);
              setIsLoggedIn(false); // Critical: keeps BrowserRouter from rendering
              setIsChecking(false);
              return;
            } else if (!hasActiveShop && !hasPendingShop && !hasPendingRegistration) {
              setIsLoggedIn(true);
            } else {
              setAwaitingApproval(false);
              setIsLoggedIn(true);
            }
          } catch (err) {
            console.error('Shop verification error:', err);
          }
        }

        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        // Only clear if we were previously "logged in" according to component state
        // and NOT in bypass mode
        const isBypass = localStorage.getItem('authBypass') === 'true';
        if (isLoggedIn && !isBypass) {
          setIsLoggedIn(false);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userRole');
        }
      }

      setIsChecking(false);
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
