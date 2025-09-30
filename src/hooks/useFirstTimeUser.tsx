import { useState, useEffect } from "react";

export const useFirstTimeUser = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const triggerWelcomeModal = () => {
    const hasSeenWelcome = localStorage.getItem('inscrix_seen_welcome');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
      localStorage.setItem('inscrix_seen_welcome', 'true');
    }
  };

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  return {
    showWelcomeModal,
    triggerWelcomeModal,
    closeWelcomeModal
  };
};