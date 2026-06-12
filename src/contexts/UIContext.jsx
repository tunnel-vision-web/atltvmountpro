
import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const openQuoteModal = () => setQuoteModalOpen(true);
  const closeQuoteModal = () => setQuoteModalOpen(false);
  const openBookingModal = () => setBookingModalOpen(true);
  const closeBookingModal = () => setBookingModalOpen(false);
  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };
  const closeAuthModal = () => setAuthModalOpen(false);

  const value = {
    quoteModalOpen,
    setQuoteModalOpen,
    openQuoteModal,
    closeQuoteModal,
    bookingModalOpen,
    setBookingModalOpen,
    openBookingModal,
    closeBookingModal,
    authModalOpen,
    authModalMode,
    setAuthModalMode,
    openAuthModal,
    closeAuthModal,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
