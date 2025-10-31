import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button, { IconButton } from '../components/Button';
import OrderSummary from '../components/OrderSummary';
import { fetchUserOrders } from '../services/orderService';
import { useAuthStore } from '../store/authStore';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, ArrowRight, CheckCircle, HandCoins, Home, RefreshCcw, Store, XIcon, Info, Car, Calendar, Star } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/drawer";
import { useDisclosure } from '@/hooks/useDisclosure';
import { useCartStore } from '../store/cartStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProductById } from '@/services/productService';
import PriceChangeModal from '@/components/PriceChangeModal';
import { CartItem } from '@/types/CartTypes';
import ItemRatingModal from '../components/ItemRatingModal';
import { addItemRating } from '../services/productService';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const DISMISSED_ITEMS_KEY = 'dismissed_review_items'; // Key for localStorage persistence

const Orders = () => {
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const userDetails = useAuthStore((state) => state.userDetails);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate()
    const reorderItems = useCartStore((state) => state.reorderItems);

    const [isPriceModalOpen, setPriceModalOpen] = useState(false);
    const [priceChanges, setPriceChanges] = useState([]);
    const [itemsToReorder, setItemsToReorder] = useState<CartItem[]>([]);

    const [ratingModal, setRatingModal] = useState<{
        open: boolean,
        item: any | null,
        orderId: string | null
    }>({ open: false, item: null, orderId: null });
    
    // Tracks items rated/submitted in the current session (transient)
    const [ratedItems, setRatedItems] = useState<{ [key: string]: boolean }>({}); 
    
    // Initializing state with persistent data from localStorage
    const [dismissedItems, setDismissedItems] = useState<string[]>(() => {
        const savedDismissed = localStorage.getItem(DISMISSED_ITEMS_KEY);
        return savedDismissed ? JSON.parse(savedDismissed) : [];
    }); 
    
    const [checkingRatings, setCheckingRatings] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ['userOrders', userDetails?.uid],
        queryFn: () => fetchUserOrders(userDetails?.uid),
        enabled: !!userDetails?.uid,
        refetchInterval: 5000,
    });

    useEffect(() => {
        if (selectedOrder && orders.length > 0) {
            const updatedOrderInList = orders.find(order => order.id === selectedOrder.id);
            if (updatedOrderInList && JSON.stringify(updatedOrderInList) !== JSON.stringify(selectedOrder)) {
                setSelectedOrder(updatedOrderInList);
            }
        }
    }, [orders, selectedOrder]);

    useEffect(() => {
        if (!orders || orders.length === 0 || checkingRatings) return;
        
        setCheckingRatings(true);
        (async () => {
            for (const order of orders) {
                if (order.orderStatus === 'delivered' && order.items) {
                    for (const item of order.items) {
                        const uniqueItemKey = `${order.id}_${item.id}`; 

                        // 1. Skip if item was already handled (rated/dismissed) in state
                        if (ratedItems[uniqueItemKey]) continue; 
                        
                        // 2. Skip if the user has explicitly dismissed this item previously (persistent check)
                        if (dismissedItems.includes(uniqueItemKey)) continue;

                        // 3. Check the database for a submitted rating
                        const q = query(
                            collection(db, 'ratings'),
                            where('itemId', '==', item.id),
                            where('orderId', '==', order.id),
                            where('userId', '==', userDetails?.uid || '')
                        );
                        const snap = await getDocs(q);
                        
                        if (!snap.empty) {
                            // If review found in DB, mark as rated in state so prompt doesn't show
                            setRatedItems(prev => ({ ...prev, [uniqueItemKey]: true }));
                            continue; // Move to next item
                        }
                        
                        if (snap.empty) {
                            // Item delivered, not rated, and not dismissed -> Show modal
                            setRatingModal({ open: true, item, orderId: order.id });
                            setCheckingRatings(false);
                            return; // Stop checking and show the modal
                        }
                    }
                }
            }
            setCheckingRatings(false);
        })();
    }, [orders, userDetails, ratedItems, dismissedItems, checkingRatings]); 
    
    // HANDLER: Manages saving the persistent "skip" status (used by both skip and submit)
    const handleDismissRating = (itemId: string, orderId: string) => {
        const uniqueItemKey = `${orderId}_${itemId}`;

        // 1. Mark as handled in state (stops re-prompting in current session)
        setRatedItems(prev => ({ ...prev, [uniqueItemKey]: true })); 
        
        // 2. Mark as dismissed in persistent storage (stops re-propmpting after refresh/navigation)
        const newDismissed = [...dismissedItems, uniqueItemKey];
        setDismissedItems(newDismissed);
        localStorage.setItem(DISMISSED_ITEMS_KEY, JSON.stringify(newDismissed));

        // 3. Close the modal
        setRatingModal({ open: false, item: null, orderId: null });
    };


    const handleSubmitRating = async (rating: number, review: string) => {
        if (!ratingModal.item || !ratingModal.orderId) return;
        
        await addItemRating({
            itemId: ratingModal.item.id,
            userId: userDetails?.uid,
            orderId: ratingModal.orderId,
            rating,
            review,
            userName: userDetails?.displayName || 'User',
        });
        
        // Use the persistence handler after successful submission
        handleDismissRating(ratingModal.item.id, ratingModal.orderId); 
        toast.success("Review submitted successfully! (This status is now permanent)");
    };

    const handleSkipRating = () => {
        if (!ratingModal.item || !ratingModal.orderId) return;
        handleDismissRating(ratingModal.item.id, ratingModal.orderId);
    };
    
    // NEW HANDLER: Forces the modal open for a specific item (for manual review button)
    const handleReviewNow = (item: any, orderId: string) => {
        setRatingModal({ open: true, item, orderId });
        // Close the details drawer for cleaner UX
        onClose(); 
    };


    if (isLoading) {
        return <div className='text-center py-10'>Loading orders...</div>;
    }

    if (isError) {
        return <div className='text-center py-10 text-red-500'>Failed to load orders. Please try again later.</div>;
    }

    const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const formatAddress = (addr: any): string => {
        if (!addr) return "No address provided";
        if (typeof addr === 'string') return addr;
        if (typeof addr === 'object' && addr !== null) {
            return [
                addr.flatNumber,
                addr.buildingName,
                addr.streetAddress,
                addr.landmark,
                addr.area,
                addr.pincode
            ].filter(Boolean).join(', ');
        }
        return "Invalid address format";
    };

    const handleReorder = async (orderItems: CartItem[]) => {
        onClose();
        const updatedItems: CartItem[] = [];
        const changes: any = [];
        let isAvailable = true;

        for (const item of orderItems) {
            const currentProduct = await getProductById(item.id);
            if (!currentProduct || !currentProduct.isAvailable) {
                toast.error(`${item.productName} is no longer available.`);
                isAvailable = false;
                break;
            }

            const newItem = { ...item, offerPrice: Number(currentProduct.offerPrice) };
            updatedItems.push(newItem);

            if (Number(item.offerPrice) !== Number(currentProduct.offerPrice)) {
                changes.push({
                    productName: item.productName,
                    oldPrice: Number(item.offerPrice),
                    newPrice: Number(currentProduct.offerPrice),
                });
            }
        }

        if (!isAvailable) return;

        setItemsToReorder(updatedItems);
        if (changes.length > 0) {
            setPriceChanges(changes);
            setPriceModalOpen(true);
        } else {
            confirmReorder(updatedItems);
        }
    };

    const confirmReorder = (items: CartItem[]) => {
        reorderItems(items);
        toast.success("Items added to cart!");
        navigate('/checkout');
        setPriceModalOpen(false);
    };

    const getBorderColor = (status: string) => {
        switch (status) {
            case 'received':
                return 'border-orange-500';
            case 'preparing':
                return 'border-yellow-500';
            case 'out for delivery':
                return 'border-blue-500';
            case 'delivered':
                return 'border-green-700';
            case 'cancelled':
                return 'border-red-500';
            case 'pending':
                return 'border-gray-400';
            case 'failed':
                return 'border-red-400';
            default:
                return 'border-gray-300';
        }
    };

    const getBackgroundColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100';
            case 'cancelled':
                return 'bg-red-50';
            case 'failed':
                return 'bg-red-100';
            default:
                return 'bg-white';
        }
    };

    return (
        <div className='bg-white min-h-screen'>
            <div className='w-full sm:max-w-3xl sm:px-5 sm:mx-auto px-2'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center items-start'>
                    <h1 className='text-2xl sm:text-4xl font-semibold lancelot py-5 sm:py-10 text-gray-700'>Past Orders</h1>
                    <button
                        className='hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
                        onClick={() => navigate('/contact')}
                    >
                        <Info size={22} className='text-white' /> Need help, {userDetails?.displayName?.split(' ')[0] || 'User'}?
                    </button>
                </div>
                <button
                    className='flex sm:hidden w-full items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-all duration-200 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
                    onClick={() => navigate('/contact')}
                >
                    <Info size={22} className='text-white' /> Need help, {userDetails?.displayName?.split(' ')[0] || 'User'}?
                </button>
                {sortedOrders.length === 0 ? (
                    <div className='flex flex-col items-center gap-5 py-10 text-gray-500'>
                        <p>You have not placed any order yet.</p>
                        <Button variant='primary' onClick={() => navigate('/shop')}>Lets Order Now</Button>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className='flex flex-col gap-5'>
                            {sortedOrders.map((order, i) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: i * 0.1 }}
                                    className={`sm:p-8 p-3 w-full border rounded-xl border-l-5 ${getBorderColor(order.orderStatus)} ${getBackgroundColor(order.orderStatus)}`}
                                >
                                    <div className='flex flex-col gap-4 justify-between'>
                                        <div className='flex justify-between items-center'>
                                            <div>
                                                <h4 className='mb-1 text-base sm:text-lg font-semibold sm:text-xl'>Order #{order.id.slice(-6)}</h4>
                                                <div className='flex text-xs sm:text-sm gap-2 text-neutral-500 items-center '>
                                                    <p>{new Date(order.createdAt).toLocaleDateString()}</p> |
                                                    <p>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <StatusBadge status={order.orderStatus} />
                                        </div>
                                        <div className='text-neutral-700 sm:px-20'>
                                            {order.items.map((item: any, idx: number) => (
                                                <h2 key={idx} className='text-xs sm:text-sm flex justify-between'>
                                                    {item.productName} <span className='font-semibold'>X {item.quantity}</span>
                                                </h2>
                                            ))}
                                        </div>
                                        <div className='flex justify-between items-center mt-4'>
                                            <button
                                                onClick={() => handleReorder(order.items)}
                                                className='text-green-600 font-semibold inline-flex items-center gap-2 hover:underline cursor-pointer'
                                            >
                                                <RefreshCcw size={16} /> Reorder
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    onOpen();
                                                }}
                                                className='text-orange-600 font-semibold inline-flex items-center gap-2 hover:underline cursor-pointer'
                                            >
                                                View Details <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
            <Drawer isOpen={isOpen} onOpenChange={onClose} className='shadow-xl' backdrop='blur'>
                <DrawerContent className='bg-white z-100 '>
                    {(onClose) => (
                        <div className='flex flex-col h-full justify-between '>
                            <div>
                                <DrawerHeader className="flex items-center gap-1 bg-white border-b fixed top-0 w-full shadow-sm">
                                    <IconButton><ArrowLeft size={20} onClick={onClose} /></IconButton>
                                    <p> Order #{selectedOrder?.id}</p>

                                </DrawerHeader>
                                <DrawerBody className="h-full overflow-auto mt-20">
                                    <div className="flex flex-col gap-4 items-start border-b pb-4">
                                        <div className="flex flex-col text-sm text-gray-600">
                                            <span className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                                                <Store size={19} /> <p className="text-green-500 font-bold comfortaa"><span className="text-orange-600">go</span>treats</p>
                                            </span>
                                            <p>Mahavir Nagar</p>
                                        </div>

                                        <div className="flex flex-col text-sm text-gray-600">
                                            <span className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                                                <Home size={19} /> Home
                                            </span>
                                            <span className="text-gray-800 font-medium">
                                                {selectedOrder?.customer?.name || 'N/A'}
                                            </span>
                                            <p>{formatAddress(selectedOrder?.address)}</p>
                                        </div>

                                        {/* ADDED DELIVERY DATE HERE */}
                                        {selectedOrder?.deliveryDate && (
                                            <div className="flex flex-col text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                                                    <Calendar size={19} /> Delivery Date
                                                </span>
                                                <p>{selectedOrder.deliveryDate}</p>
                                            </div>
                                        )}

                                        {selectedOrder?.deliveryTime && (
                                            <div className="flex flex-col text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                                                    <Car size={19} /> Delivery Time
                                                </span>
                                                <p>{selectedOrder.deliveryTime}</p>
                                            </div>
                                        )}

                                        <StatusBadge status={selectedOrder?.orderStatus} />
                                        {
                                            selectedOrder?.orderStatus === 'cancelled' && (
                                                <p className='text-sm text-red-500'>Order Cancelled | Refund will be initiated soon</p>
                                            )
                                        }
                                        {
                                            selectedOrder?.orderStatus === 'failed' && (
                                                <p className='text-sm text-red-500'>Order Failed | Refund will be initiated soon</p>
                                            )
                                        }
                                    </div>

                                    <div className="mt-4 border-b pb-4">
                                        <h3 className="font-medium text-sm text-gray-800">Order Items</h3>
                                        <div className="mt-2 flex flex-col gap-2">
                                            {selectedOrder?.items?.map((item: any, idx: number) => {
                                                const uniqueItemKey = `${selectedOrder.id}_${item.id}`;
                                                const isDelivered = selectedOrder.orderStatus === 'delivered';
                                                
                                                // Check if the item has been rated/submitted (by checking the persistent state/DB logic)
                                                const isReviewSubmitted = ratedItems[uniqueItemKey]; 
                                                
                                                return (
                                                    <div key={idx} className="flex flex-col gap-1 border-b border-gray-100 pb-2">
                                                        <div className="flex justify-between items-center pl-2">
                                                            <span className="font-medium text-gray-800">
                                                                {item.productName} x {item.quantity}
                                                            </span>
                                                            <span>₹{item.offerPrice * item.quantity}</span>
                                                        </div>

                                                        {isDelivered && (
                                                            <>
                                                                {/* Display Status or Button */}
                                                                {isReviewSubmitted ? (
                                                                    // CASE 1: Review is submitted (permanent status)
                                                                    <span className='text-xs text-green-600 self-end pr-2 flex items-center gap-1'>
                                                                        <CheckCircle size={14} /> Review Submitted
                                                                    </span>
                                                                ) : (
                                                                    // CASE 2: Review not submitted -> Show button (user can rate now, even if dismissed)
                                                                    <button
                                                                        className='text-xs font-semibold text-orange-500 hover:text-orange-600 self-end pr-2 transition-colors flex items-center gap-1'
                                                                        onClick={() => handleReviewNow(item, selectedOrder.id)} 
                                                                    >
                                                                        <Star size={14} className="inline-block" fill="#f97316"/> Rate Item Now
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ✅ FIX: PRICE BREAKDOWN SECTION (Removed GST reference) */}
                                    <div className="pb-2 border-b text-gray-700 text-sm">
                                        <div className="flex justify-between py-1">
                                            <span>Item Total</span>
                                            <span>₹{selectedOrder?.grossTotalPrice || '0.00'}</span>
                                        </div>

                                        {selectedOrder?.voucherDiscount && (
                                            <div className="flex justify-between py-1">
                                                <span>Voucher Discount</span>
                                                <span>-₹{selectedOrder?.voucherDiscount}</span>
                                            </div>
                                        )}
                                        
                                        {/* Added Packaging Charge/Delivery Charge safe access */}
                                        {selectedOrder?.packagingCharge && (
                                            <div className="flex justify-between py-1">
                                                <span>Packaging Charge</span>
                                                <span>₹{selectedOrder?.packagingCharge || '0.00'}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between py-1">
                                            <span>Delivery Charges</span>
                                            <span>₹{selectedOrder?.deliveryCharge || '0.00'}</span>
                                        </div>
                                    </div>
                                    {/* ❌ OLD GST LINES REMOVED HERE */}

                                    <div className="flex justify-between text-gray-800 font-semibold text-lg mt-4">
                                        <span>{selectedOrder.paymentStatus === 'pending' && selectedOrder?.orderStatus !== 'delivered' ? "Amount To Pay : " : "Total Paid : "}</span>
                                        <span>₹{selectedOrder?.totalAmount || '0.00'}</span>
                                    </div>

                                    <Button
                                        variant='primary'
                                        className='w-full mt-4'
                                        onClick={() => handleReorder(selectedOrder.items)}
                                    >
                                        Reorder
                                    </Button>

                                    {
                                        selectedOrder?.note && (
                                            <p>📝 "{selectedOrder?.note}"</p>
                                        )
                                    }


                                    <div>
                                        {
                                            selectedOrder.paymentStatus === 'success' ? (
                                                <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                                                    <CheckCircle size={16} />
                                                    <p>
                                                        {`Paid on ${new Date(selectedOrder.createdAt).toLocaleString()}`}
                                                    </p>
                                                </div>
                                            ) : selectedOrder.paymentStatus === 'pending' ? (
                                                <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                                                    <HandCoins size={16} />
                                                    <p>
                                                        Cash On Delivery
                                                    </p>
                                                </div>
                                            ) :
                                                (
                                                    <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                                                        <CheckCircle size={16} />
                                                        <p>
                                                            No payment information available
                                                        </p>
                                                    </div>
                                                )
                                        }
                                        <div className='flex items-center gap-2 justify-between text-sm text-gray-700 mt-2'>
                                            <p>{selectedOrder?.razorpay_payment_id && 'Transaction ID: '}</p>
                                            <p>{selectedOrder?.razorpay_payment_id}</p>
                                        </div>
                                    </div>

                                </DrawerBody>
                            </div>
                            <DrawerFooter className='flex border-t-2 gap-2'>

                                <Button variant="secondary" className='w-full' onClick={onClose}>
                                    <XIcon size={16} /> Close
                                </Button>
                            </DrawerFooter>
                        </div>
                    )}
                </DrawerContent >
            </Drawer >
            <PriceChangeModal
                isOpen={isPriceModalOpen}
                onClose={() => setPriceModalOpen(false)}
                onConfirm={() => confirmReorder(itemsToReorder)}
                priceChanges={priceChanges}
            />
            
            {/* FINAL MODAL CALL WITH PERSISTENCE LOGIC */}
            <ItemRatingModal
                isOpen={ratingModal.open}
                itemId={ratingModal.item?.id || ''} 
                orderId={ratingModal.orderId || ''} 
                itemName={ratingModal.item?.productName || ''}
                onClose={handleSkipRating} 
                onDismiss={handleDismissRating} // Called when user clicks X/backdrop (saves to localStorage)
                onSubmit={handleSubmitRating} // Calls handleDismissRating internally after success
            />
        </div >
    );
};

export default Orders;
