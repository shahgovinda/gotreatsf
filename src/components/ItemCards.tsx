import { Star, Triangle, X, Heart, Share2 } from 'lucide-react'
import { Item } from '../types/ItemsTypes'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import React, { useState, useEffect } from 'react'
import { Skeleton, Image } from '@heroui/react'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    Button,
    useDisclosure,
} from "@heroui/react";
import { getItemRatings, addItemRating } from '../services/productService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { toast } from 'react-hot-toast';

// Add keyframes for the glowing animation
const glowingStyles = `
    @keyframes glowingText {
        0% {
            background-position: -200% center;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }
        50% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
        }
        100% {
            background-position: 200% center;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }
    }

    .glowing-text {
        background: linear-gradient(
            90deg,
            #ffffff 0%,
            #ffd700 25%,
            #ffffff 50%,
            #ffd700 75%,
            #ffffff 100%
        );
        background-size: 200% auto;
        color: transparent;
        -webkit-background-clip: text;
        background-clip: text;
        animation: glowingText 2s linear infinite;
        font-weight: 600;
        letter-spacing: 0.5px;
        filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.3));
    }

    .tag-container {
        position: relative;
    }

    .tag-container::before {
        content: '';
        position: absolute;
        inset: -1px;
        background: linear-gradient(90deg, #ff8c00, #ffd700);
        border-radius: inherit;
        padding: 1px;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0.7;
        animation: borderGlow 2s linear infinite;
    }

    @keyframes borderGlow {
        0%, 100% {
            opacity: 0.5;
        }
        50% {
            opacity: 1;
        }
    }
`;

type Review = {
    id: string;
    userName: string;
    rating: number;
    review: string;
    createdAt: string;
};

const ItemCards = ({ item, highlighted }: { item: Item, highlighted?: boolean }) => {
    // Add styles to the document head
    React.useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = glowingStyles;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgLoadedMobile, setImgLoadedMobile] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [avgRating, setAvgRating] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [reviewFilter, setReviewFilter] = useState<number | null>(null);

    // Like (favorite) logic
    const [liked, setLiked] = useState(() => {
        const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
        return likedItems.includes(item.id);
    });
    useEffect(() => {
        const handler = () => {
            const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
            setLiked(likedItems.includes(item.id));
        };
        window.addEventListener('likedItemsChanged', handler);
        return () => window.removeEventListener('likedItemsChanged', handler);
    }, [item.id]);
    const toggleLike = () => {
        let likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
        if (liked) {
            likedItems = likedItems.filter((id: string) => id !== item.id);
        } else {
            likedItems.push(item.id);
        }
        localStorage.setItem('likedItems', JSON.stringify(likedItems));
        setLiked(!liked);
    };
    // Share logic
    const handleShare = () => {
        const url = `${window.location.origin}/shop?itemId=${item.id}`;
        if (navigator.share) {
            navigator.share({ title: item.productName, url });
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Link copied!');
        }
    };

    const veg = (
        <div className='border-2 rounded-md border-green-700 flex items-center justify-center size-5 mb-1'>
            <div className='p-1 bg-green-700 rounded-full size-2'></div>
        </div>
    )
    const nonVeg = (
        <div className='border-2 rounded-md border-red-900 flex items-center justify-center size-5 mb-1'>
            <Triangle size={10} color='brown' fill='brown' />
        </div>
    )

    const { items, addItem, updateQuantity } = useCartStore()
    const { user, userDetails } = useAuthStore();
    const navigate = useNavigate();

    // Get quantity of this item from cart
    const cartItem = items.find(i => i.id === item.id)
    const quantity = cartItem?.quantity || 0

    const handleIncrement = () => {
        if (quantity === 0) {
            addItem(item)
        } else {
            updateQuantity(item.id, quantity + 1)
        }
    }

    const handleDecrement = () => {
        if (quantity > 0) {
            updateQuantity(item?.id, quantity - 1)
        }
    }

    React.useEffect(() => {
        let isMounted = true;
        (async () => {
            setLoadingReviews(true);
            const ratings = await getItemRatings(item.id);
            if (!isMounted) return;
            if (ratings.length === 0) {
                setAvgRating(null);
                setReviewCount(0);
                setReviews([] as Review[]);
            } else {
                const sum = ratings.reduce((acc: number, r: any) => acc + (typeof r.rating === 'number' ? r.rating : 0), 0);
                setAvgRating(Number((sum / ratings.length).toFixed(1)));
                setReviewCount(ratings.length);
                // Fetch user names for each review
                const reviewsWithUser: Review[] = await Promise.all(ratings.map(async (r: any) => {
                    let userName = 'User';
                    if (r.userName) {
                        userName = r.userName;
                    } else if (r.userId) {
                        try {
                            const userDoc = await getDoc(doc(db, 'users', r.userId));
                            if (userDoc.exists()) {
                                userName = userDoc.data().displayName || 'User';
                            }
                        } catch {}
                    }
                    return {
                        id: r.id || Math.random().toString(36).substr(2, 9),
                        userName: userName,
                        rating: typeof r.rating === 'number' ? r.rating : 0,
                        review: typeof r.review === 'string' ? r.review : '',
                        createdAt: typeof r.createdAt === 'string' ? r.createdAt : '',
                    };
                }));
                // Sort by date desc
                reviewsWithUser.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setReviews(reviewsWithUser as Review[]);
            }
            setLoadingReviews(false);
        })();
        return () => { isMounted = false; };
    }, [item.id]);

    // Add this function for review submission
    const handleReviewSubmit = async (rating: number, review: string) => {
        if (!user || !userDetails) return;
        await addItemRating({
            itemId: item.id,
            userId: user.uid,
            orderId: '', // If you have orderId, pass it here
            rating,
            review,
            userName: userDetails.displayName || 'User',
        });
        // Optionally, refresh reviews after submission
    };

    return (
        <>
            <div
                id={`shop-item-${item.id}`}
                className={`md:flex flex-col justify-between hidden group w-64 lg:w-76 bg-white p-6 rounded-3xl shadow-xs cursor-pointer hover:bg-green-50 transition-color duration-500 border-orange-50 relative ${highlighted ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
            >
                {/* Like and Share Icons */}
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                    <button onClick={toggleLike} className="p-1 rounded-full hover:bg-red-100 transition" title={liked ? 'Unlike' : 'Like'}>
                        <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                    </button>
                    <button onClick={handleShare} className="p-1 rounded-full hover:bg-blue-100 transition" title="Share">
                        <Share2 size={20} className="text-blue-500" />
                    </button>
                </div>
                {/* Most Ordered Tag for Desktop */}
                {(item.productName.toLowerCase().includes('combo') ||
                    item.productName.toLowerCase().includes('poori bhaji')) && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -top-2 -right-2 z-10"
                        >
                            <div className="tag-container bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs font-medium px-2 py-1 rounded-lg shadow-lg transform rotate-3 whitespace-nowrap">
                                <span className="glowing-text">Most Ordered</span> ⭐
                            </div>
                        </motion.div>
                    )}
                <div className="relative mb-5 size-64">
                    {/* {!imgLoaded && (
                        <Skeleton className='absolute inset-0  flex items-center justify-center rounded-3xl'>
                            <p className='comfortaa text-4xl tracking-tighter z-10 font-bold text-zinc-400'>gotreats</p>
                        </Skeleton>
                    )} */}
                    {!imgLoaded && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center rounded-3xl" >
                            <p className='comfortaa text-4xl tracking-tighter font-bold text-zinc-400'>gotreats</p>
                        </div>
                    )}
                    {/* <img
                        src={item.imageUrl}
                        alt=""
                        loading="lazy"
                        onLoad={() => setImgLoaded(true)}
                        className={`size-64 object-cover rounded-3xl group-hover:scale-102 transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    /> */}
                    <Image src={item.imageUrl} alt=""  loading='lazy' disableSkeleton onLoad={() => setImgLoaded(true)} className={`size-64 object-cover rounded-3xl group-hover:scale-102 group-hover:shadow-lg transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                {item.isNonVeg ? nonVeg : veg}
                <h4 className='lancelot text-2xl lg:text-3xl font-medium'>{item.productName}</h4>
                <button
                    className='comfortaa text-sm text-green-700 font-bold flex items-center gap-1 mb-2 hover:underline focus:outline-none'
                    onClick={() => setShowAllReviews(true)}
                    disabled={reviewCount === 0}
                    style={{ cursor: reviewCount > 0 ? 'pointer' : 'default', background: 'none', border: 'none', padding: 0 }}
                >
                    <Star fill='green' size={13} />
                    {avgRating !== null ? `${avgRating} (${reviewCount} review${reviewCount !== 1 ? 's' : ''})` : 'No ratings yet'}
                </button>

                <p className='text-gray-500 text-sm lg:text:base leading-5 line-clamp-2'>{item.productDescription}</p>
                <div className='flex justify-between items-center mt-5'>
                    {
                        user ?
                            <div className='  h-9 flex justify-between items-center bg-green-100 rounded-lg text-lg' onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={handleDecrement}
                                    className='h-full flex items-center px-3 text-4xl text-green-600 cursor-pointer'
                                >
                                    -
                                </button>
                                <p className='px-2 text-green-600 font-semibold'>{quantity}</p>
                                <button
                                    onClick={handleIncrement}
                                    className='h-full flex items-center px-3 text-3xl text-green-600 cursor-pointer hover:text-green-800'
                                >
                                    +
                                </button>
                            </div>
                            :
                            <button onClick={() => navigate('/register')} className=' h-9 flex justify-between items-center bg-green-100 rounded-lg text-lg'>
                                <p className='px-2 text-green-600 text-sm font-semibold'>Login to add</p>
                            </button>
                    }
                    <div className='inline-flex items-center gap-2'>
                        <p className='comfortaa text-lg line-through '> ₹{item.originalPrice} </p>
                        <span className='px-[3px] py-[1px] flex items-center text-lg shadow-3xl bg-yellow-500 '>₹{item.offerPrice}</span>
                    </div>
                </div>
            </div>

            <div className='flex md:hidden justify-between mx-2 p-4 gap-1 rounded-xl shadow-xs cursor-pointer bg-white transition-color duration-500 w-full relative' >
                {/* Most Ordered Tag for Mobile */}
                {(item.productName.toLowerCase().includes('combo') ||
                    item.productName.toLowerCase().includes('poori bhaji')) && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -top-2 right-2 z-10"
                        >
                            <div className="tag-container bg-gradient-to-r from-orange-600 to-orange-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md shadow-md transform rotate-2 whitespace-nowrap">
                                <span className="glowing-text">Most Ordered</span> ⭐
                            </div>
                        </motion.div>
                    )}
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                    <button onClick={toggleLike} className="p-1 rounded-full hover:bg-red-100 transition" title={liked ? 'Unlike' : 'Like'}>
                        <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                    </button>
                    <button onClick={handleShare} className="p-1 rounded-full hover:bg-blue-100 transition" title="Share">
                        <Share2 size={20} className="text-blue-500" />
                    </button>
                </div>
                <div className=' w-3/5'>
                    {item.isNonVeg ? nonVeg : veg}
                    <h4 className='lancelot text-2xl font-bold mb-2'>{item.productName}</h4>
                    <div className='inline-flex items-center gap-2 mb-2'>
                        <p className='comfortaa text-lg line-through '> ₹{item.originalPrice} </p>
                        <span className='px-[3px] py-[1px] flex items-center text-lg shadow-3xl bg-yellow-500 '>₹{item.offerPrice}</span>
                    </div>
                    <button
                        className='comfortaa text-sm text-green-700 font-bold flex items-center gap-1 mb-3 hover:underline focus:outline-none'
                        onClick={() => setShowAllReviews(true)}
                        disabled={reviewCount === 0}
                        style={{ cursor: reviewCount > 0 ? 'pointer' : 'default', background: 'none', border: 'none', padding: 0 }}
                    >
                        <Star fill='green' size={13} />
                        {avgRating !== null ? `${avgRating} (${reviewCount} review${reviewCount !== 1 ? 's' : ''})` : 'No ratings yet'}
                    </button>
                    <p className=' text-gray-500 text-sm line-clamp-2 tracking-tight'>{item.productDescription}</p>
                </div>
                <div className='flex flex-col justify-between items-end  w-2/5'>
                    <div className="relative size-30 mb-3" onClick={onOpen}>
                        {!imgLoadedMobile && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center rounded-3xl" >
                                <p className='comfortaa text-2xl tracking-tighter font-bold text-zinc-400'>gotreats</p>
                            </div>
                        )}
                        <img
                            src={item.imageUrl}
                            alt=""
                            loading="lazy"
                            onLoad={() => setImgLoadedMobile(true)}
                            className={`size-30 rounded-2xl object-cover transition-all duration-500 ${imgLoadedMobile ? 'opacity-100' : 'opacity-0'}`}
                        />
                    </div>
                    {
                        user ?
                            <div className=' h-9 flex justify-between mr-2 items-center bg-green-100 rounded-lg text-lg'>
                                <button
                                    onClick={handleDecrement}
                                    className='h-full flex items-center px-3 text-4xl text-green-600 cursor-pointer'
                                >
                                    -
                                </button>
                                <p className='px-2 text-green-600 font-semibold'>{quantity}</p>
                                <button
                                    onClick={handleIncrement}
                                    className='h-full flex items-center px-3 text-3xl text-green-600 cursor-pointer hover:text-green-800'
                                >
                                    +
                                </button>
                            </div>
                            :
                            <button onClick={() => navigate('/register')} className=' h-9 flex justify-between items-center bg-green-100 rounded-lg text-lg'>
                                <p className='px-2 text-green-600 text-sm font-semibold'>Login to add</p>
                            </button>
                    }
                </div>
            </div>

            <Drawer isOpen={isOpen} placement='bottom' size='lg' hideCloseButton onOpenChange={onOpenChange}>
                <DrawerContent className='rounded-t-3xl bg-white'>
                    {(onClose) => {
                        return (
                            <>
                                <div className="w-full flex justify-center py-3 sticky top-0 bg-white z-10 shadow-sm">
                                    <div
                                        onClick={onClose}
                                        className='bg-black rounded-full p-2 transition-colors duration-300 hover:bg-red-500 cursor-pointer'
                                    >
                                        <X className='size-5 text-white' />
                                    </div>
                                </div>
                                <DrawerBody className='pt-2'>
                                    {/* IMAGE SECTION */}
                                    <div className='flex justify-center items-center w-full h-56 md:h-72 bg-gray-50 rounded-2xl shadow-md overflow-hidden mb-4'>
                                        <img className='max-h-full max-w-full object-contain rounded-2xl shadow-lg bg-white' src={item.imageUrl} alt={item.productName} />
                                    </div>
                                    {/* DESCRIPTION & PRICE SECTION */}
                                    <div className='px-2 md:px-6'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            {item.isNonVeg ? nonVeg : veg}
                                            <h4 className='lancelot text-2xl md:text-3xl font-bold text-gray-900'>{item.productName}</h4>
                                        </div>
                                        <p className='text-gray-600 text-base leading-6 mb-3'>{item.productDescription}</p>
                                        <div className='flex items-center gap-3 mb-4'>
                                            <p className='comfortaa text-lg line-through text-gray-400'>₹{item.originalPrice}</p>
                                            <span className='px-2 py-1 flex items-center text-xl font-bold bg-yellow-400 rounded shadow'>₹{item.offerPrice}</span>
                                            <div className='flex-1 flex justify-end'>
                                                {user ? (
                                                    <div className='flex items-center bg-green-100 rounded-lg shadow px-2 py-1 gap-2'>
                                                        <button
                                                            onClick={handleDecrement}
                                                            className='h-10 w-10 flex items-center justify-center text-3xl text-green-600 bg-white rounded-full border border-green-200 hover:bg-green-50 transition'
                                                        >
                                                            -
                                                        </button>
                                                        <span className='px-3 text-green-700 font-bold text-lg'>{quantity}</span>
                                                        <button
                                                            onClick={handleIncrement}
                                                            className='h-10 w-10 flex items-center justify-center text-3xl text-green-600 bg-white rounded-full border border-green-200 hover:bg-green-50 transition'
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => navigate('/register')} className='h-10 px-6 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow'>
                                                        Login to add
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </DrawerBody>
                            </>
                        );
                    }}
                </DrawerContent>
            </Drawer>
            {/* All Reviews Modal */}
            {showAllReviews && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
                        <button className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200" onClick={() => setShowAllReviews(false)}>
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold mb-4">All Reviews</h3>
                        {/* Star filter buttons */}
                        <div className="flex gap-2 mb-4 justify-center">
                            <button onClick={() => setReviewFilter(null)} className={`px-3 py-1 rounded-full border ${reviewFilter === null ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'} font-semibold text-sm`}>All</button>
                            {[1,2,3,4,5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setReviewFilter(star)}
                                    className={`px-3 py-1 rounded-full border flex items-center gap-1 ${reviewFilter === star ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-700'} font-semibold text-sm`}
                                >
                                    {star} <Star size={14} fill="currentColor" className="text-yellow-400" />
                                </button>
                            ))}
                        </div>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {reviews.filter(r => reviewFilter === null ? true : r.rating === reviewFilter).length === 0 ? (
                                <div className="text-center text-gray-500 py-8 font-medium text-lg">No reviews found for this rating.</div>
                            ) : (
                                reviews.filter(r => reviewFilter === null ? true : r.rating === reviewFilter).map((r, idx) => {
                                    if (!('rating' in r)) return null;
                                    const review = r as Review;
                                    return (
                                        <div key={review.id || idx} className='bg-gray-50 rounded-lg p-3 shadow-sm'>
                                            <div className='flex items-center gap-2 mb-1'>
                                                <span className='font-semibold text-green-700'>{review.userName}</span>
                                                <span className='flex items-center gap-0.5 text-yellow-500'>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < (review.rating ?? 0) ? 'currentColor' : 'none'} className={i < (review.rating ?? 0) ? 'text-yellow-400' : 'text-gray-300'} />
                                                    ))}
                                                </span>
                                                <span className='text-xs text-gray-400 ml-2'>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
                                            </div>
                                            <div className='text-gray-700 text-sm'>{review.review}</div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ItemCards
