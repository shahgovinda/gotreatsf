import { Menu, X, ShoppingCart, UserRound, MapPin, LogOut, AlertTriangle, Box, CircleHelp, Heart } from 'lucide-react'
import Button, { IconButton } from './Button'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from '../store/authStore';
import { handleLogout } from '../services/authService';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { useCartStore } from '../store/cartStore';
import toast, { Toaster } from 'react-hot-toast';
import Modal from './Modal';
import { useProductStore } from '../store/productStore';

export const BrandLogo = () => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate('/')} className="cursor-pointer">
            <p className='comfortaa font-extrabold tracking-tighter text-2xl lg:text-3xl text-orange-600'>
                <span className='text-green-500'>go</span>treats
            </p>
        </div>
    )
}
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showLikedModal, setShowLikedModal] = useState(false);
    const location = useLocation();
    const user = useAuthStore((state) => state.user)
    const userDetails = useAuthStore((state) => state.userDetails)
    const items = useCartStore((state) => state.items);
    const navigate = useNavigate();
    const products = useProductStore((state) => state.products);
    const [likedItems, setLikedItems] = useState<string[]>([]);
    const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
    const addItem = useCartStore((state) => state.addItem);
    const cartItems = useCartStore((state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    // Prevent background scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    useEffect(() => {
        const liked = JSON.parse(localStorage.getItem('likedItems') || '[]');
        setLikedItems(liked);
    }, [showLikedModal]);

    const likedProducts = products.filter(p => likedItems.includes(p.id));

    const removeLiked = (id: string) => {
        const updated = likedItems.filter(itemId => itemId !== id);
        setLikedItems(updated);
        localStorage.setItem('likedItems', JSON.stringify(updated));
    };

    // Function to handle navigation and close the mobile menu
    const handleNavigation = (path: string) => {
        setIsOpen(false)
        navigate(path)
    };

    const handleLogoutClick = async () => {
        try {
            useCartStore.getState().clearCart();
            await handleLogout();
            toast.success('Logged out successfully');
            navigate('/');
            setShowLogoutModal(false);
        } catch (error) {
            toast.error('Failed to logout. Please try again.');
        }
    };


    return (
        <>
            <header className=" py-1  z-50 shadow-xl border-b ">
                <div className="container  mx-auto">
                    <div className=" bg-white  ">
                        <div className=" grid grid-cols-2 lg:grid-cols-3 px-4 md:pr-2 py-2  items-center">
                            <div className='flex items-center gap-2'>
                                <span onClick={() => setIsOpen(!isOpen)}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="feather feather-menu md:hidden"
                                    >
                                        <line x1="3" y1="6" x2="21" y2="6" className={`origin-left transition ${isOpen ? "rotate-45 -translate-y-1" : ""}`}></line>
                                        <line x1="3" y1="12" x2="21" y2="12" className={isOpen ? "opacity-0 transition" : "transition"}></line>
                                        <line x1="3" y1="18" x2="21" y2="18" className={`origin-left transition ${isOpen ? "-rotate-45 translate-y-1" : ""}`}></line>
                                    </svg>
                                </span>
                                <BrandLogo />
                            </div>
                           <div className="hidden lg:block">
  <nav className="flex gap-10 items-center justify-center">
    <Link to="/shop" className="nav-underline">Menu</Link>
    <Link to="/concept" className="nav-underline">Concept</Link>
    <Link to="/about" className="nav-underline">About</Link>
    <Link to="/customers" className="nav-underline">Customers</Link>
    <Link to="/contact" className="nav-underline">Contact</Link>
  </nav>
</div>

                            <div className="flex justify-end gap-4">



                        
                             {!user && (
  <button
    className="custom-signup-btn px-4 py-2 h-auto md:h-12 md:px-8 md:text-lg rounded-2xl font-medium text-base bg-gradient-to-r from-orange-400 to-yellow-300 text-white shadow-md border border-orange-200 hover:from-orange-500 hover:to-yellow-400 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
    style={{ minHeight: '40px', minWidth: '88px', lineHeight: 1.1 }}
    onClick={() => navigate('/register')}
  >
    <span className="drop-shadow-sm tracking-wide">Sign Up</span>
  </button>
)}






                                {user &&
                                    <div onClick={() => navigate('/checkout')} className="cursor-pointer">
                                        <IconButton>
                                            <ShoppingCart strokeWidth={1.5} size={20} />
                                            <p className='text-green-600 text-lg'>
                                                {items.reduce((total, item) => total + item.quantity, 0)}
                                            </p>
                                        </IconButton>
                                    </div>
                                }
                                {user && (
    <button onClick={() => setShowLikedModal(true)} className="relative flex items-center justify-center p-2 rounded-full hover:bg-pink-100 transition">
        <Heart size={22} className="text-pink-500" />
        {likedItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold border-2 border-white">{likedItems.length}</span>
        )}
    </button>
)}
                                {user &&
                                    <Dropdown placement="bottom-end">
                                        <DropdownTrigger>
                                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-500 cursor-pointer flex items-center justify-center">
                                                <img 
                                                    src={userDetails?.profileImage || 'https://via.placeholder.com/40'} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover"
                                                />
                                                </div>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            aria-label="User Menu"
                                            className="min-w-[190px] p-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 mt-2 space-y-1 z-50"
                                        >
                                            <DropdownItem
                                                className="hover:bg-gray-900 hover:text-white rounded-xl px-3 py-2 flex items-center gap-2 text-base cursor-pointer"
                                                key="profile"
                                                onPress={() => navigate('/profile')}
                                            >
                                                <UserRound size={18} />
                                                <span>Profile</span>
                                            </DropdownItem>
                                            <DropdownItem
                                                className="hover:bg-gray-900 hover:text-white rounded-xl px-3 py-2 flex items-center gap-2 text-base cursor-pointer"
                                                key="orders"
                                                onPress={() => navigate('/orders')}
                                            >
                                                <Box size={18} />
                                                <span>Orders</span>
                                            </DropdownItem>
                                            <DropdownItem
                                                className="hover:bg-gray-900 hover:text-white rounded-xl px-3 py-2 flex items-center gap-2 text-base cursor-pointer"
                                                key="help"
                                                onPress={() => navigate('/contact')}
                                            >
                                                <CircleHelp size={18} />
                                                <span>Help</span>
                                            </DropdownItem>
                                            <DropdownItem
                                                className="hover:bg-red-600 hover:text-white rounded-xl px-3 py-2 flex items-center gap-2 text-base text-red-500 cursor-pointer"
                                                key="logout"
                                                onPress={() => setShowLogoutModal(true)}
                                            >
                                                <LogOut size={18} />
                                                <span>Log Out</span>
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                }

                            </div>
                        </div>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "100dvh" }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden">
                                    <div className="flex flex-col gap-10 items-center justify-center px-10 py-10 ">
                                        <nav className="flex flex-col gap-14 items-center justify-center">
                                            <Link to="/" onClick={() => setIsOpen(false)} className={`text-lg `}>Home</Link>
                                            <Link to="/shop" onClick={() => setIsOpen(false)} className={`text-lg `}>Shop</Link>
                                            <Link to={user ? "/profile" : "/register"} onClick={() => setIsOpen(false)} className={`text-lg `}>Profile</Link>
                                            <Link to="/about" onClick={() => setIsOpen(false)} className={`text-lg `}>About</Link>
                                            <Link to="/customers" onClick={() => setIsOpen(false)} className={`text-lg `}>Customers</Link>
                                            <Link to="/contact" onClick={() => setIsOpen(false)} className={`text-lg `}>Contact Us</Link>
                                            <Link to="/concept" onClick={() => setIsOpen(false)} className={`text-lg `}>Concept</Link>
                                            <Link to="/terms-and-conditions" onClick={() => setIsOpen(false)} className={`text-lg `}>Terms and Conditions</Link>
                                            <Link to="#" onClick={() => { setIsOpen(false); setShowLikedModal(true); }} className="text-lg flex items-center gap-2">
    <Heart size={20} className="text-pink-500" /> Liked Food
</Link>
                                        </nav>
                                        <div className="space-y-4 w-full">

                                            {user ?
                                                <Button variant='danger' className='w-full' onClick={() => setShowLogoutModal(true)}>Log Out</Button> :
                                                <Button variant='primary' className='w-full' onClick={() => navigate('/register')}>Sign Up</Button>
                                            }
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>
            <Modal
                isOpen={showLogoutModal}
                title="Confirm Logout"
                message='Are you sure you want to log out?'
                onConfirm={handleLogoutClick}
                onCancel={() => setShowLogoutModal(false)}
                confirmLabel="Yes, Log Out"
                cancelLabel="Cancel"
            />

            <Modal
                isOpen={showLikedModal}
                title="Liked Foods"
                onCancel={() => setShowLikedModal(false)}
                cancelLabel="Close"
            >
                {likedProducts.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">Your liked foods will appear here.</div>
                ) : (
                    <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
                        {likedProducts.map(item => {
                            const cartItem = cartItems.find(ci => ci.id === item.id);
                            const inCart = !!cartItem;
                            return (
                                <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3 shadow">
                                    <img src={item.imageUrl} alt={item.productName} className="w-14 h-14 object-cover rounded-lg" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800">{item.productName}</div>
                                        <div className="text-green-700 font-bold">₹{item.offerPrice}</div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <button onClick={() => setConfirmRemoveId(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full">
                                            Remove
                                        </button>
                                        {inCart ? (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQuantity(item.id, cartItem.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded-full text-red-500 bg-red-100 hover:bg-red-200 font-bold text-lg">-</button>
                                                <span className="min-w-[24px] text-center font-bold">{cartItem.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, cartItem.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-full text-green-600 bg-green-100 hover:bg-green-200 font-bold text-lg">+</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => { addItem(item); toast.success('Added to cart!'); }} className="text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-lg text-sm font-semibold shadow">
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Modal>
            <Modal
                isOpen={!!confirmRemoveId}
                title="Remove Liked Food?"
                message="Are you sure you want to remove this item from your liked foods?"
                confirmLabel="Remove"
                cancelLabel="Cancel"
                onConfirm={() => {
                    if (confirmRemoveId) {
                        const updated = likedItems.filter(itemId => itemId !== confirmRemoveId);
                        setLikedItems(updated);
                        localStorage.setItem('likedItems', JSON.stringify(updated));
                        // Dispatch a custom event so ItemCards can update
                        window.dispatchEvent(new CustomEvent('likedItemsChanged'));
                    }
                    setConfirmRemoveId(null);
                }}
                onCancel={() => setConfirmRemoveId(null)}
            />

            <Toaster />
        </>
    )
}

export default Navbar
