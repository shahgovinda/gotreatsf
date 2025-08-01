import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDocs, collection, query, where, addDoc } from 'firebase/firestore';

// Assuming these are all valid local imports. If not, they will need to be provided.
import Button, { IconButton } from './components/Button';
import { StatusBadge } from './components/StatusBadge';
import { ArrowLeft, ArrowRight, CheckCircle, HandCoins, Home, RefreshCcw, Store, XIcon, Info } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/drawer";
import { useDisclosure } from './hooks/useDisclosure';
import { useCartStore } from './store/cartStore';
import { useAuthStore } from './store/authStore';
import { fetchUserOrders } from './services/orderService';
import { getProductById, addItemRating } from './services/productService';
import PriceChangeModal from './components/PriceChangeModal';
import ItemRatingModal from './components/ItemRatingModal';
import { CartItem } from './types/CartTypes';

// Assuming the Firestore instance is correctly configured and exported
import { db } from './config/firebaseConfig';

const Orders = () => {
    // State to manage the open/close state of the order details drawer
    const { isOpen, onOpen, onClose } = useDisclosure();
    // State to hold the currently selected order for the drawer
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Get user details from the auth store
    const userDetails = useAuthStore((state) => state.userDetails);
    // Hook to handle programmatic navigation
    const navigate = useNavigate();
    // Function from the cart store to handle reordering
    const reorderItems = useCartStore((state) => state.reorderItems);

    // State for the price change modal
    const [isPriceModalOpen, setPriceModalOpen] = useState(false);
    const [priceChanges, setPriceChanges] = useState([]);
    const [itemsToReorder, setItemsToReorder] = useState([]);

    // State for the item rating modal
    const [ratingModal, setRatingModal] = useState({
        open: false,
        item: null,
        orderId: null
    });
    // Local state to track rated/skipped items for the current session to avoid redundant checks
    const [ratedItems, setRatedItems] = useState({});
    // State to prevent multiple concurrent rating checks
    const [checkingRatings, setCheckingRatings] = useState(false);

    // Scroll to the top of the page on component mount
    useEffect(() => window.scrollTo(0, 0), []);

    // Fetch user orders using React Query
    const { data: orders = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['userOrders', userDetails?.uid],
        queryFn: () => fetchUserOrders(userDetails?.uid),
        enabled: !!userDetails?.uid,
        refetchInterval: 5000,
    });

    // Update the selected order in the drawer if the data refetches
    useEffect(() => {
        if (selectedOrder && orders.length > 0) {
            const updatedOrderInList = orders.find(order => order.id === selectedOrder.id);
            if (updatedOrderInList && JSON.stringify(updatedOrderInList) !== JSON.stringify(selectedOrder)) {
                setSelectedOrder(updatedOrderInList);
            }
        }
    }, [orders, selectedOrder]);

    // Check for unrated delivered items after orders load
    useEffect(() => {
        const checkForRatings = async () => {
            if (!orders || orders.length === 0 || checkingRatings) return;
            setCheckingRatings(true);

            for (const order of orders) {
                if (order.orderStatus === 'delivered' && order.items) {
                    for (const item of order.items) {
                        const key = `${order.id}_${item.id}`;
                        if (ratedItems[key]) continue; // Already rated/skipped in this session

                        try {
                            const ratingsQuery = query(
                                collection(db, 'ratings'),
                                where('itemId', '==', item.id),
                                where('orderId', '==', order.id),
                                where('userId', '==', userDetails?.uid || '')
                            );
                            const ratingsSnap = await getDocs(ratingsQuery);

                            const skippedRatingsQuery = query(
                                collection(db, 'skippedRatings'),
                                where('itemId', '==', item.id),
                                where('orderId', '==', order.id),
                                where('userId', '==', userDetails?.uid || '')
                            );
                            const skippedRatingsSnap = await getDocs(skippedRatingsQuery);

                            // Show modal only if no rating and no skip record exists
                            if (ratingsSnap.empty && skippedRatingsSnap.empty) {
                                setRatingModal({ open: true, item, orderId: order.id });
                                setCheckingRatings(false);
                                return; // Stop checking after finding the first unrated item
                            }
                        } catch (error) {
                            console.error("Error checking ratings:", error);
                        }
                    }
                }
            }
            setCheckingRatings(false);
        };
        checkForRatings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orders, userDetails, ratedItems]);

    // Handler for submitting a rating
    const handleSubmitRating = async (rating, review) => {
        if (!ratingModal.item || !ratingModal.orderId) return;
        await addItemRating({
            itemId: ratingModal.item.id,
            userId: userDetails?.uid,
            orderId: ratingModal.orderId,
            rating,
            review,
            userName: userDetails?.displayName || 'User',
        });
        // Mark as rated in this session to prevent re-prompting
        setRatedItems(prev => ({ ...prev, [`${ratingModal.orderId}_${ratingModal.item.id}`]: true }));
        setRatingModal({ open: false, item: null, orderId: null });
        toast.success("Thank you for your feedback!");
    };

    // Handler for skipping a rating (persists the decision)
    const handleSkipRating = async () => {
        if (!ratingModal.item || !ratingModal.orderId) return;
        try {
            // Save the skip decision to Firestore
            await addDoc(collection(db, 'skippedRatings'), {
                itemId: ratingModal.item.id,
                orderId: ratingModal.orderId,
                userId: userDetails?.uid,
                skippedAt: new Date().toISOString(),
            });
            // Mark as skipped in this session
            setRatedItems(prev => ({ ...prev, [`${ratingModal.orderId}_${ratingModal.item.id}`]: true }));
            toast.success("Feedback request will not be shown again.");
        } catch (error) {
            console.error("Failed to save skip rating:", error);
            toast.error("Failed to skip. Please try again.");
        }
        setRatingModal({ open: false, item: null, orderId: null });
    };

    if (isLoading) {
        return <div className='text-center py-10 text-gray-500'>Loading orders...</div>;
    }

    if (isError) {
        return <div className='text-center py-10 text-red-500'>Failed to load orders. Please try again later.</div>;
    }

    // Sort orders by creation date (most recent first)
    const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Helper function to format the address
    const formatAddress = (addr) => {
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

    // Handle reorder logic
    const handleReorder = async (orderItems) => {
        const updatedItems = [];
        const changes = [];
        let isAvailable = true;

        try {
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
        } catch (error) {
            console.error("Error during reorder check:", error);
            toast.error("An error occurred while checking product availability. Please try again.");
            return;
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

    // Confirm and complete the reorder
    const confirmReorder = (items) => {
        reorderItems(items);
        onClose(); // Close the drawer only after successful reorder confirmation
        toast.success("Items added to cart!");
        navigate('/checkout');
        setPriceModalOpen(false);
    };

    // Get dynamic border color based on order status
    const getBorderColor = (status) => {
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

    // Get dynamic background color based on order status
    const getBackgroundColor = (status) => {
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
                        <Info size={22} className='text-white' /> Need help?
                    </button>
                </div>
                <button
                    className='flex sm:hidden w-full items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-all duration-200 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
                    onClick={() => navigate('/contact')}
                >
                    <Info size={22} className='text-white' /> Need help?
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
                                            {order.items.map((item, idx) => (
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
            {/* ----- order details drawer ----- */}
            <Drawer isOpen={isOpen} onOpenChange={onClose} className='shadow-xl' backdrop='blur'>
                <DrawerContent className='bg-white z-50'>
                    <div className='flex flex-col h-full justify-between'>
                        <div className='overflow-y-auto pb-20'>
                            <DrawerHeader className="flex items-center gap-1 bg-white border-b sticky top-0 w-full z-10 p-4 shadow-sm">
                                <IconButton onClick={onClose}><ArrowLeft size={20} /></IconButton>
                                <p className='text-lg font-semibold'>Order #{selectedOrder?.id?.slice(-6)}</p>
                            </DrawerHeader>
                            <DrawerBody className="p-4 flex flex-col gap-4">
                                {selectedOrder && (
                                    <>
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

                                            <StatusBadge status={selectedOrder?.orderStatus} />
                                            {selectedOrder?.orderStatus === 'cancelled' && (
                                                <p className='text-sm text-red-500'>Order Cancelled | Refund will be initiated soon</p>
                                            )}
                                            {selectedOrder?.orderStatus === 'failed' && (
                                                <p className='text-sm text-red-500'>Order Failed | Refund will be initiated soon</p>
                                            )}
                                        </div>

                                        <div className="border-b pb-4">
                                            <h3 className="font-medium text-sm text-gray-800">Order Items</h3>
                                            <div className="mt-2 flex flex-col gap-2">
                                                {selectedOrder?.items?.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center pl-2">
                                                        <span>
                                                            {item.productName} x {item.quantity}
                                                        </span>
                                                        <span>₹{item.offerPrice * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bill Details Section */}
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

                                            <div className="flex justify-between py-1">
                                                <span>Delivery Charges</span>
                                                <span>₹{selectedOrder?.deliveryCharge || '0.00'}</span>
                                            </div>
                                        </div>

                                        {/* Total Paid Section */}
                                        <div className="flex justify-between text-gray-800 font-semibold text-lg mt-4">
                                            <span>{selectedOrder?.paymentStatus === 'pending' && selectedOrder?.orderStatus !== 'delivered' ? "Amount To Pay : " : "Total Paid : "}</span>
                                            <span>₹{selectedOrder?.totalAmount || '0.00'}</span>
                                        </div>

                                        {selectedOrder?.note && (
                                            <p className='text-sm text-gray-600 mt-2'>📝 "{selectedOrder?.note}"</p>
                                        )}

                                        <div>
                                            {selectedOrder.paymentStatus === 'success' ? (
                                                <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                                                    <CheckCircle size={16} />
                                                    <p>{`Paid on ${new Date(selectedOrder.createdAt).toLocaleString()}`}</p>
                                                </div>
                                            ) : selectedOrder.paymentStatus === 'pending' ? (
                                                <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                                                    <HandCoins size={16} />
                                                    <p>Cash On Delivery</p>
                                                </div>
                                            ) : (
                                                <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                                                    <CheckCircle size={16} />
                                                    <p>No payment information available</p>
                                                </div>
                                            )}
                                            <div className='flex items-center gap-2 justify-between text-sm text-gray-700 mt-2'>
                                                <p>{selectedOrder?.razorpay_payment_id && 'Transaction ID: '}</p>
                                                <p className='truncate'>{selectedOrder?.razorpay_payment_id}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </DrawerBody>
                        </div>
                        <DrawerFooter className='flex border-t-2 gap-2 p-4'>
                            <Button variant="secondary" className='w-full' onClick={onClose}>
                                <XIcon size={16} /> Close
                            </Button>
                            <Button
                                variant='primary'
                                className='w-full'
                                onClick={() => handleReorder(selectedOrder.items)}
                            >
                                <RefreshCcw size={16} /> Reorder
                            </Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
            <PriceChangeModal
                isOpen={isPriceModalOpen}
                onClose={() => setPriceModalOpen(false)}
                onConfirm={() => confirmReorder(itemsToReorder)}
                priceChanges={priceChanges}
            />
            <ItemRatingModal
                isOpen={ratingModal.open}
                itemName={ratingModal.item?.productName || ''}
                onClose={handleSkipRating} // Now calls the persistent skip function
                onSubmit={handleSubmitRating}
            />
        </div >
    );
};

export default Orders;
