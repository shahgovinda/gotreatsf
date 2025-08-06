import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';

const SpecialDayBanner = ({ specialDayMessage, storageKey = 'specialDayBanner' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasClosed = localStorage.getItem(storageKey);
    if (hasClosed !== 'true') {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-64 bg-white rounded-lg shadow-xl p-4 border border-gray-200 animate-slide-in-right">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        aria-label="Close banner"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-pink-100 rounded-full">
          <Gift className="w-6 h-6 text-pink-600 animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Important Message!</h3>
      </div>
      <p className="text-sm text-gray-600">
        {specialDayMessage}
      </p>
    </div>
  );
};

export default SpecialDayBanner;
