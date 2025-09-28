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

    // NEW: State to trigger voice announcements for search results
    const [announcement, setAnnouncement] = useState('');

    const products = useProductStore((state) => state.products);
    const items = useCartStore((state) => state.items);
    const itemQuantity = useCartStore((state) => state.itemCount);

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
                // NEW: Set the announcement text to trigger the speech synthesis effect
                setAnnouncement(finalQuery);
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
        }

        else if (tag === 'top-picks') {
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
    
    // This is called on every render to get the latest list of products
    const filteredProducts = getFilteredProducts();

    // NEW: useEffect for Text-to-Speech announcements
    useEffect(() => {
        // Guard clause: Do nothing if there's no announcement text
        if (!announcement) {
            return;
        }

        // Define the speech function
        const speak = (text) => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel(); // Stop any current speech
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-IN';
                window.speechSynthesis.speak(utterance);
            } else {
                console.error("Text-to-speech is not supported in this browser.");
            }
        };
        
        // A short delay helps sync the audio with the visual update of the items
        const timer = setTimeout(() => {
            if (filteredProducts.length > 0) {
                speak(`Here are your results for ${announcement}.`);
            } else {
                speak(`Sorry, I could not find anything for ${announcement}.`);
            }
        }, 300);

        // Reset the announcement. This prevents the effect from running again until a new voice search.
        setAnnouncement('');

        // Cleanup function to clear the timeout if the component unmounts
        return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [announcement]); // Dependency: Only run when a new announcement is set

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

    const handleMicClick = () => {
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

    const headingVariants: Variants = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const wordVariants: Variants = {
        initial: { backgroundPosition: "0% 50%" },
        animate: {
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            transition: { duration: 3, repeat: Infinity, ease: "linear" }
        }
    };

    const pauseSwiper = () => {
        if (swiperRef.current && swiperRef.current.autoplay) {
            swiperRef.current.autoplay.stop();
        }
    };
    const resumeSwiper = () => {
        if (swiperRef.current && swiperRef.current.autoplay) {
            swiperRef.current.autoplay.start();
        }
    };

    const handleMobileOverlay = (which) => {
        if (which === 'thali') {
            setThaliOverlay(true);
            pauseSwiper();
            setTimeout(() => {
                setThaliOverlay(false);
                resumeSwiper();
            }, 3500);
        } else if (which === 'meal') {
            setMealOverlay(true);
            pauseSwiper();
            setTimeout(() => {
                setMealOverlay(false);
                resumeSwiper();
            }, 3500);
        }
    };

    return (
        <div className='bg-[#fff9f2] flex'>
            <div className='container mx-auto'>
                {/* --- Image Slider Section --- */}
                {/* <section className="w-full py-4 flex items-center justify-center"> ... </section> */}
                <div className='py-10'>
                    {/* Search Bar */}
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

                    {isListening && (
                        <div className="mt-2 text-center">
                            <span className="block text-orange-600 text-base animate-pulse font-medium bg-orange-50 rounded-lg px-3 py-1 inline-block max-w-full overflow-x-auto whitespace-nowrap">
                                {liveTranscript || 'Listening...'}
                            </span>
                        </div>
                    )}

                    <div className='text justify-center flex items-center flex-wrap gap-2 lg:gap-10 mt-5 select-none'>
                        <div className='flex gap-2'>
                            <span
                                className={`whitespace-nowrap cursor-pointer px-4 py-2 rounded-full ${foodType === 'veg' ? 'bg-green-600 text-white hover:text-white' : 'bg-white'}  hover:text-green-600 text-green-700 inline-flex items-center shadow-xs gap-2 transition-colors duration-100 ease-in`}
                                onClick={() => toggleFoodType('veg')}>
                                <Salad strokeWidth={1.5} />Veg
                            </span>
                            <span
                                className={`whitespace-nowrap cursor-pointer px-4 py-2 rounded-full ${foodType === 'non-veg' ? 'bg-orange-800 text-white hover:text-white' : 'bg-white'}  hover:text-orange-700 text-orange-900 inline-flex items-center shadow-xs gap-2 transition-colors duration-100 ease-in`}
                                onClick={() => toggleFoodType('non-veg')}>
                                <Drumstick strokeWidth={1.5} />Non-Veg
                            </span>
                        </div>
                    </div>
                    <div className={`relativ flex justify-center mx-4 mt-5 ${searchQuery ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className='flex items-center overflow-x-auto hide-scrollbar py-2 mx-auto gap-2 lg:gap-5 select-none'>
                            <span
                                className={`whitespace-nowrap cursor-pointer px-4 py-2 rounded-lg ${tag == 'top-picks' ? 'bg-orange-600 text-white hover:text-white' : 'bg-white'}  hover:text-orange-600 inline-flex items-center shadow-xs transition-colors duration-100 ease-in gap-2`}
                                onClick={() => navigate('/shop/?tag=top-picks')}>
                                <BadgePercent strokeWidth={1.5} />Top Picks
                            </span>

                            {(foodType === 'all' || foodType === 'veg') && (
                                <>
                                    <span
                                        className={`whitespace-nowrap cursor-pointer px-4 py-2 rounded-xl ${tag == 'meals' ? 'bg-orange-600 text-white hover:text-white' : 'bg-white'}  hover:text-orange-600 inline-flex items-center shadow-xs gap-2 transition-colors duration-100 ease-in`}
                                        onClick={() => navigate('/shop/?tag=meals')}>
                                        <Utensils strokeWidth={1.5} /> Meals
                                    </span>
                                    {/* Other categories */}
                                </>
                            )}

                            {(foodType === 'non-veg') && (
                                <>
                                    <span
                                        className={`whitespace-nowrap cursor-pointer px-4 py-2 rounded-lg ${tag == 'meals' ? 'bg-orange-600 text-white hover:text-white' : 'bg-white'}  hover:text-orange-600 inline-flex items-center shadow-xs gap-2 transition-colors duration-100 ease-in`}
                                        onClick={() => navigate('/shop/?tag=meals')}>
                                        <Utensils strokeWidth={1.5} /> Meals
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {filteredProducts?.length === 0 && (
                        <div className="text-center mt-10">
                            <p className="text-gray-600 text-lg">No items found matching "{searchQuery}"</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 text-orange-500 hover:text-orange-600 underline"
                            >
                                Clear search
                            </button>
                        </div>
                    )}

                    {filteredProducts?.length > 0 && (
                        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-6 px-4 mt-8">
                            <AnimatePresence>
                                {filteredProducts?.map(item => (
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
            {itemQuantity > 0 &&
                <AnimatePresence >
                    <motion.span
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        onClick={() => {
                            navigate('/checkout');
                            window.scrollTo(0, 0);
                        }}
                        className="fixed w-full md:w-1/6 md:bottom-4 bottom-0 left-1/2  -translate-x-1/2 bg-green-700 cursor-pointer  text-white px-4 py-3  md:rounded-2xl  shadow-2xl hover:bg-gray-900 transition-all duration-300 z-50"
                    >
                        <button type='button' className="flex md:py-2 py-3 justify-between items-center gap-2 w-full">
                            <p className="font-medium">{itemQuantity} Items Added</p>
                            <span className="   flex items-center">View Cart <ChevronRight size={18} /></span>
                        </button>
                    </motion.span>
                </AnimatePresence>
            }
        </div>
    );
};

export default Shop;
