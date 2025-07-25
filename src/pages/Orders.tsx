import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button, { IconButton } from '../components/Button';
import OrderSummary from '../components/OrderSummary';
import { fetchUserOrders } from '../services/orderService';
import { useAuthStore } from '../store/authStore';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, ArrowRight, CheckCircle, CircleHelp, HandCoins, Home, RefreshCcw, Store, XIcon, Info } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/drawer";
import { useDisclosure } from '@/hooks/useDisclosure';
import { useCartStore } from '../store/cartStore'; // Import the cart store
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
    const [ratedItems, setRatedItems] = useState<{ [key: string]: boolean }>({}); // key: orderId_itemId
    const [checkingRatings, setCheckingRatings] = useState(false);

    useEffect(() => window.scrollTo(0, 0), []);

    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ['userOrders', userDetails?.uid],
        queryFn: () => fetchUserOrders(userDetails?.uid),
        enabled: !!userDetails?.uid,
        refetchInterval: 5000,
    });

    useEffect(() => {
        // If a selected order is open in the drawer, check for its updates from the refetched orders list
        if (selectedOrder && orders.length > 0) {
            const updatedOrderInList = orders.find(order => order.id === selectedOrder.id);
            // If the order is found and its data is different from what's in the state, update it
            if (updatedOrderInList && JSON.stringify(updatedOrderInList) !== JSON.stringify(selectedOrder)) {
                setSelectedOrder(updatedOrderInList);
            }
        }
    }, [orders, selectedOrder]); // Rerun when orders data or selectedOrder changes

    // Check for unrated delivered items after orders load
    useEffect(() => {
        if (!orders || orders.length === 0 || checkingRatings) return;
        setCheckingRatings(true);
        (async () => {
            for (const order of orders) {
                if (order.orderStatus === 'delivered' && order.items) {
                    for (const item of order.items) {
                        const key = `${order.id}_${item.id}`;
                        if (ratedItems[key]) continue; // already rated/skipped in this session
                        // Check Firestore if this user has rated this item for this order
                        const q = query(
                            collection(db, 'ratings'),
                            where('itemId', '==', item.id),
                            where('orderId', '==', order.id),
                            where('userId', '==', userDetails?.uid || '')
                        );
                        const snap = await getDocs(q);
                        if (snap.empty) {
                            // Show modal for this item
                            setRatingModal({ open: true, item, orderId: order.id });
                            setCheckingRatings(false);
                            return;
                        }
                    }
                }
            }
            setCheckingRatings(false);
        })();
        // eslint-disable-next-line
    }, [orders, userDetails, ratedItems]);

    // Handler for submitting rating
    const handleSubmitRating = async (rating: number, review: string) => {
        if (!ratingModal.item || !ratingModal.orderId) return;
        await addItemRating({
            itemId: ratingModal.item.id,
            userId: userDetails?.uid,
            orderId: ratingModal.orderId,
            rating,
            review,
            userName: userDetails?.displayName || 'User', // <-- Added userName
        });
        // Mark as rated in this session
        setRatedItems(prev => ({ ...prev, [`${ratingModal.orderId}_${ratingModal.item.id}`]: true }));
        setRatingModal({ open: false, item: null, orderId: null });
    };

    // Handler for skipping rating (remind later)
    const handleSkipRating = () => {
        if (!ratingModal.item || !ratingModal.orderId) return;
        // Mark as skipped in this session (not in DB, so will remind next time)
        setRatedItems(prev => ({ ...prev, [`${ratingModal.orderId}_${ratingModal.item.id}`]: true }));
        setRatingModal({ open: false, item: null, orderId: null });
    };

    if (isLoading) {
        return <div className='text-center py-10'>Loading orders...</div>;
    }

    if (isError) {
        return <div className='text-center py-10 text-red-500'>Failed to load orders. Please try again later.</div>;
    }

    // Sort orders: prioritize non-delivered orders, then by creation date (most recent first)
    // const sortedOrders = [...orders].sort((a, b) => {
    //     if (a.orderStatus !== 'delivered' && b.orderStatus === 'delivered') return -1;
    //     if (a.orderStatus === 'delivered' && b.orderStatus !== 'delivered') return 1;
    //     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    // });
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
        onClose(); // Close the details drawer immediately
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

    // Get dynamic border color based on order status
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

    // Get dynamic background color based on order status
    const getBackgroundColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100';
            case 'cancelled':
                return 'bg-red-50'; // Distinct background for cancelled and failed orders
            case 'failed':
                return 'bg-red-100'; // Distinct background for cancelled and failed orders
            default:
                return 'bg-white'; // Gradient for other non-delivered orders
        }
    };

    return (
        <div className='bg-white min-h-screen'>
            <div className='w-full sm:max-w-3xl sm:px-5 sm:mx-auto px-2'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center items-start'>
                    <h1 className='text-2xl sm:text-4xl font-semibold lancelot py-5 sm:py-10 text-gray-700'>Past Orders</h1>
                    {/* Desktop: Prominent Need Help Button */}
                    <button
                        className='hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
                        onClick={() => navigate('/contact')}
                    >
                        <Info size={22} className='text-white' /> Need help?
                    </button>
                </div>
                {/* Mobile: Full-width Need Help Button */}
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
                                    initial={{ opacity: 0, x: -50 }} // Mount animation: from top
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
            {/* ----- order details for mobile ----- */}
            <Drawer isOpen={isOpen} onOpenChange={onClose} className='shadow-xl' backdrop='blur'>
                <DrawerContent className='bg-white z-100 '>
                    {(onClose) => (
                        <div className='flex flex-col h-full justify-between '>
                            <div>
                                <DrawerHeader className="flex items-center gap-1 bg-white   border-b fixed top-0 w-full  shadow-sm">
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
                                            {selectedOrder?.items?.map((item: any, idx: number) => (
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

                                        {/* <div className="flex justify-between py-1">
                                            <span>Taxes (18%)</span>
                                            <span>
                                                ₹
                                                {selectedOrder?.gst}
                                            </span>
                                        </div> */}

                                    </div>

                                    {/* Total Paid Section */}
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
                                        {/* <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                                            <CheckCircle size={16} />
                                            <p>
                                                {selectedOrder.paymentStatus === 'success'
                                                    ? `Paid on ${new Date(selectedOrder.createdAt).toLocaleString()}`
                                                    : 'No payment information available'}
                                            </p>
                                        </div> */}
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
            <ItemRatingModal
                isOpen={ratingModal.open}
                itemName={ratingModal.item?.productName || ''}
                onClose={handleSkipRating}
                onSubmit={handleSubmitRating}
            />
            {/* {detailOpen && selectedOrder && (
                <div className='w-full h-screen fixed backdrop-blur-sm inset-0 z-10' onClick={() => setDetailOpen(false)}>
                    <OrderSummary 
                    setDetailOpen={setDetailOpen} 
                    detailOpen={detailOpen} 
                    order={selectedOrder} />
                </div>
            )} */}
        </div >
    );
};

export default Orders;
