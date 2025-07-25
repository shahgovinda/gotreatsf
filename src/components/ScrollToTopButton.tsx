import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollHeight, setScrollHeight] = useState(0);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const calculateScrollHeight = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        setScrollHeight(scrollPercent);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        window.addEventListener('scroll', calculateScrollHeight);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
            window.removeEventListener('scroll', calculateScrollHeight);
        };
    }, []);

    return (
        <div className="fixed right-8 z-50 bottom-24 md:bottom-8">
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="relative flex items-center justify-center size-12 bg-gray-800 text-white rounded-full shadow-lg transition-transform duration-300 ease-in-out hover:scale-110 focus:outline-none overflow-hidden"
                    aria-label="Scroll to top"
                >
                    <div
                        className="absolute bottom-0 left-0 w-full bg-orange-500 transition-all duration-300"
                        style={{ height: `${scrollHeight}%` }}
                    ></div>
                    <ArrowUp className="relative z-10" size={24} />
                </button>
            )}
        </div>
    );
};

export default ScrollToTopButton; 