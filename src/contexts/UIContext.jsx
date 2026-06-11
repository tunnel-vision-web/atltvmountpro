
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

  const openQuoteModal = () => setQuoteModalOpen(true);
  const closeQuoteModal = () => setQuoteModalOpen(false);
  const openBookingModal = () => setBookingModalOpen(true);
  const closeBookingModal = () => setBookingModalOpen(false);

  const value = {
    quoteModalOpen,
    setQuoteModalOpen,
    openQuoteModal,
    closeQuoteModal,
    bookingModalOpen,
    setBookingModalOpen,
    openBookingModal,
    closeBookingModal,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
