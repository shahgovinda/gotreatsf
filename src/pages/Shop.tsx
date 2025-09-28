import { motion, AnimatePresence, Variants } from "framer-motion";
import { BadgePercent, Beer, Candy, ChevronRight, Cookie, Dessert, Drumstick, Mic, Salad, Search, Soup, Utensils } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import ItemCards from '../components/ItemCards';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import { useProductStore } from '../store/productStore';
import Button from '../components/Button';
import { useCartStore } from '../store/cartStore';

declare global {
    interface Window {
        webkitSpeechRecognition: any;
    }
}

const animatedWords = ['meals', 'combos', 'dishes', 'snacks', 'pasta', 'desserts'];

const Shop = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tag = searchParams.get('tag');
    const [foodType, setFoodType] = useState('all'); // 'all', 'veg', 'non-veg'
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [showMicTooltip, setShowMicTooltip] = useState(false);
    const recognitionRef = useRef<any>(null);
    const [thaliOverlay, setThaliOverlay] = useState(false);
    const [mealOverlay, setMealOverlay] = useState(false);
    const swiperRef = useRef(null);
    const [animatedIndex, setAnimatedIndex] = useState(0);
    const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

    // --- States and Refs for Features ---
    const [announcement, setAnnouncement] = useState(''); // For voice announcements
    const speechEngineWarmedUp = useRef(false); // For voice announcements
    const products = useProductStore((state) => state.products);
    const items = useCartStore((state) => state.items); // For cart button
    const itemQuantity = useCartStore((state) => state.itemCount); // For cart button

    // --- Logic for Zomato-style Cart Button ---
    const recentItems = items.slice(-3);

    // --- useEffect Hooks ---
    useEffect(() => {
        if (!tag) {
            navigate('/shop/?tag=top-picks');
        }
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.error("Web Speech API is not supported in this browser.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
            setIsListening(true);
            setLiveTranscript('');
        };

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            for (let i = 0; i < event.results.length; ++i) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }
            setLiveTranscript(interim);
            if (final) {
                const finalQuery = final.trim();
                setSearchQuery(finalQuery);
                setLiveTranscript('');
                setAnnouncement(finalQuery); // Trigger voice announcement
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setLiveTranscript('');
        };

        recognition.onend = () => {
            setIsListening(false);
            setLiveTranscript('');
        };

        recognitionRef.current = recognition;

        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    // useEffect for Voice Announcements
    useEffect(() => {
        if (!announcement) return;

        const speak = (text) => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-IN';
                window.speechSynthesis.speak(utterance);
            } else {
                console.error("Text-to-speech is not supported in this browser.");
            }
        };
        
        const timer = setTimeout(() => {
            const currentFilteredProducts = getFilteredProducts();
            if (currentFilteredProducts.length > 0) {
                speak(`Here are your results for ${announcement}.`);
            } else {
                speak(`Sorry, I could not find anything for ${announcement}.`);
            }
        }, 300);

        setAnnouncement('');
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [announcement]);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatedIndex((prev) => (prev + 1) % animatedWords.length);
        }, 1700);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const itemId = searchParams.get('itemId');
        if (itemId) {
            setTimeout(() => {
                const el = document.getElementById(`shop-item-${itemId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setHighlightedItemId(itemId);
                    setTimeout(() => setHighlightedItemId(null), 2000);
                }
            }, 500);
        }
    }, [searchParams, products]);

    // --- Helper Functions ---
    const handleMicClick = () => {
        // Unlocks audio on many browsers by playing a silent utterance
        if (!speechEngineWarmedUp.current && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(' ');
            utterance.volume = 0;
            window.speechSynthesis.speak(utterance);
            speechEngineWarmedUp.current = true;
        }

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    const toggleFoodType = (type) => {
        if (foodType === type) {
            setFoodType('all');
        } else {
            setFoodType(type);
        }
    };

    const getFilteredProducts = () => {
        let filteredProducts = products;

        if (foodType === 'veg') {
            filteredProducts = products?.filter(item => !item.isNonVeg);
        } else if (foodType === 'non-veg') {
            filteredProducts = products?.filter(item => item.isNonVeg);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filteredProducts = filteredProducts?.filter(item =>
                item.productName.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.productDescription.toLowerCase().includes(query)
            );
        } else if (tag === 'top-picks') {
            return filteredProducts;
        } else if (tag === 'meals') {
            return filteredProducts?.filter(item => item.category === 'Meals');
        } else if (tag === 'pasta') {
            return filteredProducts?.filter(item => item.category === 'Pasta');
        } else if (tag === 'maggi') {
            return filteredProducts?.filter(item => item.category === 'Maggi');
        } else if (tag === 'paav-bhaaji') {
            return filteredProducts?.filter(item => item.category === 'Paav Bhaaji');
        } else if (tag === 'desserts') {
            return filteredProducts?.filter(item => item.category === 'Desserts');
        } else if (tag === 'snacks') {
            return filteredProducts?.filter(item => item.category === 'Snacks');
        } else if (tag === 'drinks') {
            return filteredProducts?.filter(item => item.category === 'Drinks');
        } else if (tag === 'pickles') {
            return filteredProducts?.filter(item => item.category === 'Pickles');
        }
        return filteredProducts;

    };

    return (
        <div className='bg-[#fff9f2] flex'>
            <div className='container mx-auto'>
                <div className='py-10'>
                    {/* Search Bar and other UI elements... */}
                    <div className="flex justify-center mb-4 px-4">
                        <div className="relative w-full max-w-md">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => setIsInputFocused(false)}
                                className="w-full px-4 py-3 pl-12 pr-20 text-gray-700 bg-white border-2 border-orange-100 rounded-full focus:outline-none focus:border-orange-500 transition-colors duration-300 placeholder-transparent"
                            />
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400" size={20} />
                            {!(isInputFocused || searchQuery || isListening) && (
                                <div className="absolute left-12 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none select-none">
                                    <span className="text-gray-400 text-lg font-[500] tracking-wide">Search for&nbsp;</span>
                                    <motion.span
                                        key={animatedIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-gray-400 text-lg font-[500] tracking-wide"
                                        style={{ minWidth: 70, display: 'inline-block' }}
                                    >
                                        {animatedWords[animatedIndex]}...
                                    </motion.span>
                                </div>
                            )}
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-gray-400 hover:text-gray-600 text-xl font-medium"
                                    >
                                        ×
                                    </button>
                                )}
                                <div className="relative flex items-center">
                                    <Mic
                                        onClick={handleMicClick}
                                        onMouseEnter={() => setShowMicTooltip(true)}
                                        onMouseLeave={() => setShowMicTooltip(false)}
                                        onFocus={() => setShowMicTooltip(true)}
                                        onBlur={() => setShowMicTooltip(false)}
                                        className={`cursor-pointer transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-orange-500'}`}
                                        size={20}
                                    />
                                    {showMicTooltip && !isListening && (
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-gray-700 text-xs font-medium px-3 py-1 rounded-lg shadow-lg border border-orange-100 animate-fadeIn z-20 whitespace-nowrap">
                                            Tap to speak
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ... other ui elements ... */}

                    {/* Product Display */}
                    {getFilteredProducts()?.length === 0 && searchQuery ? (
                        <div className="text-center mt-10">
                            <p className="text-gray-600 text-lg">No items found matching "{searchQuery}"</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 text-orange-500 hover:text-orange-600 underline"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-6 px-4 mt-8">
                            <AnimatePresence>
                                {getFilteredProducts()?.map(item => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ItemCards key={item.id} item={item} highlighted={highlightedItemId === item.id} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Zomato-style "View Cart" Button */}
            {itemQuantity > 0 && (
                <AnimatePresence>
                    <motion.div
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        onClick={() => {
                            navigate('/checkout');
                            window.scrollTo(0, 0);
                        }}
                        className="fixed w-[90%] md:w-auto bottom-4 left-1/2 -translate-x-1/2 bg-rose-500 cursor-pointer text-white px-4 py-3 rounded-xl shadow-2xl hover:bg-rose-600 transition-all duration-300 z-50"
                    >
                        <div className="flex justify-between items-center gap-4 w-full">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center">
                                    {recentItems.map((item, index) => (
                                        <img
                                            key={`${item.id}-${index}`}
                                            src={item.productImage}
                                            alt={item.productName}
                                            className={`w-7 h-7 rounded-full object-cover border-2 border-white ${index > 0 ? '-ml-2' : ''}`}
                                        />
                                    ))}
                                </div>
                                <p className="font-medium">
                                    {itemQuantity === 1 ? '1 Item Added' : `${itemQuantity} Items Added`}
                                </p>
                            </div>
                            <div className="flex items-center font-semibold">
                                <span>View Cart</span>
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default Shop;
