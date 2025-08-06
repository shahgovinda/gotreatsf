import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SpecialDayBanner = ({ specialDayMessage, storageKey = 'specialDayBanner' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already closed the banner for this session/day
    const hasClosed = localStorage.getItem(storageKey);
    if (hasClosed !== 'true') {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleClose = () => {
    setIsVisible(false);
    // Persist the user's choice to close the banner
    localStorage.setItem(storageKey, 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative flex items-center justify-center h-14 bg-gradient-to-r from-pink-500 to-purple-600 overflow-hidden group shadow-md text-white px-4">
      {/* Background animation for a festive feel */}
      <div className="absolute inset-0 bg-white/10 blur-sm animate-pulse-slow pointer-events-none"></div>

      {/* Main content with message */}
      <div className="relative z-10 flex items-center gap-3 font-medium tracking-wide text-sm sm:text-base">
        <span className="text-white text-center animate-fadeIn">
          {specialDayMessage}
        </span>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/20 hover:bg-white/40 transition-all duration-300"
        aria-label="Close banner"
      >
        <X className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};

export default SpecialDayBanner;
