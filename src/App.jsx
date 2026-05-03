import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './context/StoreContext';
import Layout from './components/Layout';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard';
import Booking from './views/Booking';
import Gateway from './views/Gateway';
import QueueDisplay from './views/QueueDisplay';
import Login from './views/Login';
import LanguageSelect from './views/LanguageSelect';
import Success from './views/Success';
import MyBookings from './views/MyBookings';
import SplashScreen from './components/SplashScreen';
import PwaInstallPopup from './components/PwaInstallPopup';
import { AnimatePresence } from 'framer-motion';

function App() {
  const { currentUser, loadingUser } = useStore();
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));
  const [hasSelectedLang, setHasSelectedLang] = useState(() => !!localStorage.getItem('hasSelectedLang'));
  const [showSplash, setShowSplash] = useState(true);

  const handleLogin = (role) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLanguageSelect = () => {
    localStorage.setItem('hasSelectedLang', 'true');
    setHasSelectedLang(true);
  };

  // Synchronize local login state with current user from Supabase
  useEffect(() => {
    if (!loadingUser) {
      if (currentUser) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
      }
    }
  }, [currentUser, loadingUser]);

  // Handle Splash Screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // 2 seconds minimum splash duration

    return () => clearTimeout(timer);
  }, []);

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
        ) : !hasSelectedLang ? (
          <LanguageSelect key="lang" onSelect={handleLanguageSelect} />
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Landing />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="discovery" element={<Gateway />} />
                <Route path="booking" element={<Booking />} />
                <Route path="success" element={<Success />} />
                <Route path="my-bookings" element={<MyBookings />} />
              </Route>

              {/* Display doesn't use the main Layout with Navbar */}
              <Route path="/display" element={<QueueDisplay />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        )}
      </AnimatePresence>
      <PwaInstallPopup />
    </>
  );
}

export default App;
