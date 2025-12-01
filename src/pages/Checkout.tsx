import { useEffect, useState } from 'react';
import { updateVoucherAfterOrder, validateVoucher } from '@/services/voucherService';
import { OrderDetails, Address } from '../types/orderTypes';

// Extend the Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

import Button, { IconButton } from '../components/Button';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { handleCheckout } from '../services/orderService';
import { updateUserPhoneNumber } from '../services/authService';
import toast from 'react-hot-toast';
import { ShoppingBag, PenBoxIcon, BadgePercent, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import AddressSection from '../components/AddressSection';
import CartSection from '../components/CartSection';
import VoucherModal from './VoucherModal';
import { useDisclosure } from '@heroui/react';
import { Voucher } from '@/types/voucherTypes';
import VoucherAppliedModal from './VoucherAppliedModal';
import OrderPlacedModal from './OrderPlacedModal';
import { useOrderPlacedModalStore } from '@/store/orderPlacedModalStore';
import OrderSummary from '@/components/OrderSummary';

const DELIVERY_PRICE = 20;
// ❌ Removed TAX_RATE = 0;
// ✅ ADDED PACKAGING_CHARGE constant
const PACKAGING_CHARGE = 10;

// Helper to ensure address is always of type Address
function getSafeAddress(addr: any): Address {
  return {
    flatNumber: addr?.flatNumber || '',
    buildingName: addr?.buildingName || '',
    streetAddress: addr?.streetAddress || '',
    landmark: addr?.landmark || '',
    area: addr?.area || '',
    pincode: addr?.pincode || '',
  };
}

const Checkout = () => {
  const {
    items,
    grossTotalPrice,
    totalPrice,
    voucherDiscount,
    calculateGrossTotalPrice,
    calculateTotalPrice,
    updateQuantity: updateItemQuantity,
    clearCart,
    setVoucherDiscount,
    note,
    setNote,
    preferredDeliveryTime,
    setDeliveryTime,
    preferredDeliveryPeriod,
    setDeliveryPeriod,
  } = useCartStore();
  const navigate = useNavigate();
  const userDetails = useAuthStore((state) => state.userDetails);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isVoucherAppliedModalOpen, onOpenChange: onOpenVoucherAppliedModalChange, onOpen: onOpenVoucherAppliedModal } = useDisclosure();
  const { isOpen: isOrderPlacedModalOpen, onOpenChange: onOpenOrderPlacedModalChange } = useDisclosure();
  const [paymentMode, setPaymentMode] = useState('online');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [tempNote, setTempNote] = useState(note || '');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(!!note);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [sendCutlery, setSendCutlery] = useState(note?.toLowerCase().includes('send cutlery'));

  // **NEW STATE FOR DATE**
  const [preferredDeliveryDate, setDeliveryDate] = useState('');

  // **HELPER FUNCTION TO GET DATES**
  const getDates = () => {
    const dates = [];
    const today = new Date();
    // FIX: Change weekday option to a valid type
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toLocaleDateString('en-US', options));
    }
    return dates;
  };
  const deliveryDates = getDates();

  useEffect(() => {
    calculateGrossTotalPrice();
    if (appliedVoucher) {
      const error = validateVoucher(
        appliedVoucher,
        userDetails?.phoneNumber || '',
        // ✅ Add PACKAGING_CHARGE to the total for voucher validation
        grossTotalPrice + DELIVERY_PRICE + PACKAGING_CHARGE
      );
      if (error) {
        setAppliedVoucher(null);
        setVoucherDiscount(0);
        toast.error('Voucher removed: ' + error);
      } else {
        let discount = 0;
        if (appliedVoucher.discountType === 'percentage') {
          discount = (grossTotalPrice * appliedVoucher.discountValue) / 100;
        } else {
          discount = appliedVoucher.discountValue;
        }
        setVoucherDiscount(discount);
      }
    } else {
      setVoucherDiscount(0);
    }
    // ❌ Replace TAX_RATE with 0 in calculateTotalPrice call (since it was 0 anyway, but to be clear)
    // ✅ Pass PACKAGING_CHARGE as the third argument (as a 'tax' or 'extra charge')
    calculateTotalPrice(DELIVERY_PRICE, PACKAGING_CHARGE);
  }, [items, grossTotalPrice, appliedVoucher, userDetails?.phoneNumber, calculateGrossTotalPrice, calculateTotalPrice]);

  useEffect(() => {
    let updatedNote = tempNote;
    if (sendCutlery && !updatedNote.toLowerCase().includes('send cutlery')) {
      updatedNote = updatedNote ? updatedNote + ' | Send cutlery' : 'Send cutlery';
    } else if (!sendCutlery && updatedNote.toLowerCase().includes('send cutlery')) {
      updatedNote = updatedNote.replace(/\s*\|?\s*send cutlery/i, '').trim();
    }
    setTempNote(updatedNote);
    setNote(updatedNote);
  }, [sendCutlery]);

  useEffect(() => window.scrollTo(0, 0), []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePaymentClick = async () => {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);
    try {
      if (!/^\d{6}$/.test(userDetails.address?.pincode || '')) {
        toast.error('Please enter a valid 6-digit pincode');
        setIsPlacingOrder(false);
        return;
      }
      if (!userDetails) {
        toast.error('Please log in to continue');
        setIsPlacingOrder(false);
        return;
      }
      if (!userDetails.address) {
        toast.error('Please add your delivery address');
        setIsPlacingOrder(false);
        return;
      }
      if (!userDetails.phoneNumber || userDetails.phoneNumber.length !== 13) {
        toast.error('Please enter a valid 10-digit phone number');
        setIsPlacingOrder(false);
        return;
      }
      if (!preferredDeliveryDate || !preferredDeliveryTime) {
        toast.error('Please select your preferred delivery date and time');
        setIsPlacingOrder(false);
        return;
      }
      if (items.length === 0) {
        toast.error('Your cart is empty. Please add items to proceed.');
        setIsPlacingOrder(false);
        return;
      }
      // FIX: The OrderDetails type must be updated to include 'deliveryDate'
      const orderDetails: OrderDetails = {
        items: items,
        grossTotalPrice: grossTotalPrice.toFixed(2),
        totalAmount: totalPrice,
        // ❌ Replaced gst with packagingCharge
        // gst: grossTotalPrice * parseFloat(TAX_RATE.toFixed(2)),
        packagingCharge: PACKAGING_CHARGE,
        deliveryCharge: DELIVERY_PRICE,
        totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
        note: note,
        deliveryDate: preferredDeliveryDate,
        deliveryTime: preferredDeliveryTime,
        customer: {
          uid: userDetails.uid,
          name: userDetails.displayName || '',
          email: userDetails.email || '',
          phoneNumber: userDetails.phoneNumber || '',
        },
        address: getSafeAddress(userDetails.address),
        voucherDiscount: voucherDiscount || null,
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
      };
      if (paymentMode === 'cod') {
        const paymentDetails = {
          ...orderDetails,
          paymentStatus: 'pending' as 'pending',
          orderStatus: 'received' as 'received',
        };
        const success = await handleCheckout(paymentDetails);
        if (success && appliedVoucher && userDetails.phoneNumber) {
          await updateVoucherAfterOrder(appliedVoucher, userDetails.phoneNumber);
        }
        if (success) {
          clearCart();
          toast.success('Order placed successfully (Cash on Delivery)');
          useOrderPlacedModalStore.getState().open();
          navigate('/orders');
        } else {
          toast.error('Order placement failed. Please contact support.');
        }
        setIsPlacingOrder(false);
        return;
      }
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsPlacingOrder(false);
        return;
      }
      const amountInPaise = Math.round(totalPrice * 100);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: amountInPaise,
        currency: 'INR',
        name: 'GoTreats Tiffins',
        description: 'Order Payment',
        image: '/favicon.png',
        prefill: {
          name: userDetails?.displayName || '',
          email: userDetails?.email || '',
          contact: userDetails?.phoneNumber || '',
        },
        notes: {
          customer_Name: userDetails?.displayName || '',
          customer_Email: userDetails?.email || '',
          customer_Phone: userDetails?.phoneNumber || '',
          customer_Address: userDetails?.address || '',
          customer_Note: note || '',
          delivery_Date: preferredDeliveryDate,
          delivery_Time: preferredDeliveryTime,
          // ✅ Added packaging charge to notes
          packaging_Charge: PACKAGING_CHARGE,
        },
        remember_customer: true,
        theme: {
          color: '#22c55e',
        },
        modal: {
          ondismiss: function () {
            toast('Payment Cancelled');
            setIsPlacingOrder(false);
          },
        },
        handler: async function (response: any) {
          if (isPlacingOrder) return;
          setIsPlacingOrder(true);
          const paymentDetails = {
            ...orderDetails,
            razorpay_payment_id: response.razorpay_payment_id,
            paymentStatus: 'success' as 'success',
            orderStatus: 'received' as 'received',
          };
          const success = await handleCheckout(paymentDetails);
          if (success && appliedVoucher && userDetails.phoneNumber) {
            await updateVoucherAfterOrder(appliedVoucher, userDetails.phoneNumber);
          }
          if (success) {
            clearCart();
            toast.success('Payment & Order placed successfully');
            useOrderPlacedModalStore.getState().open();
            navigate('/orders');
          } else {
            toast.error('Order placement failed after payment. Please contact support.');
          }
          setIsPlacingOrder(false);
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setIsPlacingOrder(false);
      throw err;
    }
  };

  if (items.length === 0) {
    return (
      <div className='relative flex items-center justify-center min-h-[70vh] md:min-h-[80vh] bg-gray-50 overflow-hidden'>
        <div className="absolute inset-0 z-0 animate-gradient bg-gradient-to-br from-yellow-100 via-purple-100 to-orange-100 opacity-80" />
        <div className="absolute left-4 top-6 text-2xl md:text-4xl lg:text-5xl animate-float-slow select-none">🍕</div>
        <div className="absolute right-6 top-16 text-xl md:text-3xl lg:text-4xl animate-float-fast select-none">🛒</div>
        <div className="absolute left-[12vw] bottom-20 text-2xl md:text-4xl lg:text-5xl animate-float-mid select-none">🥲</div>
        <div className="absolute right-[14vw] bottom-10 text-xl md:text-3xl lg:text-4xl animate-float-mid select-none">🍔</div>
        <div className='flex flex-col gap-6 z-10 items-center w-full px-4'>
          <img src="/shopping.png" className='mx-auto animate-bounce-slow max-w-[180px] sm:max-w-xs md:max-w-sm lg:max-w-md w-full' alt="Empty cart" />
          <p className='text-xl sm:text-2xl font-semibold text-center flex flex-col items-center'>{userDetails?.displayName ? `${userDetails.displayName}, ` : 'Your '} Your cart is empty <span className="text-xl sm:text-2xl mt-1">😔</span></p>
          <Button onClick={() => navigate('/shop')} variant='primary' className="transition-transform duration-200 hover:scale-105 active:scale-95 px-8 sm:px-10 py-3 text-base sm:text-lg rounded-full shadow-lg">Go to Shop</Button>
        </div>
        <style>{`
          @keyframes gradient {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 8s ease-in-out infinite;
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-18px); }
          }
          .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
          @keyframes float-fast {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-30px); }
          }
          .animate-float-fast { animation: float-fast 2.5s ease-in-out infinite; }
          @keyframes float-mid {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          .animate-float-mid { animation: float-mid 3.2s ease-in-out infinite; }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-bounce-slow { animation: bounce-slow 2.2s infinite; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='flex justify-between items-center mb-8 z-10'
        >
          <h1 className="lancelot text-4xl sm:text-5xl font-bold text-gray-900 opacity-100 z-10">Checkout</h1>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-8'>
            <CartSection items={items} updateItemQuantity={updateItemQuantity} />
            <div className="flex flex-row gap-2 items-center mb-4">
              <button
                className="pill-btn"
                onClick={() => navigate('/shop')}
              >
                + Add Items
              </button>

              <button
                className="pill-btn"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                Cooking requests
              </button>

              <label className="pill-btn checkbox-btn">
                <input
                  type="checkbox"
                  checked={sendCutlery}
                  onChange={(e) => setSendCutlery(e.target.checked)}
                />
                <span className="checkmark"></span>
                Send cutlery
              </label>
            </div>
            {showInstructions && (
              <div className="bg-white rounded-2xl shadow-lg p-4 mb-2 animate-fade-in">
                <textarea
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-lg border focus:ring-primary-500 focus:border-primary-500 transition mb-4"
                  placeholder="E.g., Please make it less spicy"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setTempNote('');
                      setNote('');
                      setNoteSaved(false);
                      setShowInstructions(false);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 bg-gray-50 hover:bg-gray-100 transition font-medium"
                    type="button"
                  >
                    Clear
                  </button>
                  <button
                    onClick={async () => {
                      setIsSavingNote(true);
                      await new Promise(res => setTimeout(res, 900));
                      setNote(tempNote);
                      setNoteSaved(!!tempNote);
                      setIsSavingNote(false);
                      setShowInstructions(false);
                      toast.success('Instruction has been added');
                    }}
                    className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-60 shadow-md"
                    disabled={isSavingNote || !tempNote.trim()}
                    type="button"
                  >
                    {isSavingNote ? <Loader2 className="animate-spin w-4 h-4" /> : 'Send'}
                  </button>
                </div>
              </div>
            )}
            {noteSaved && note && !showInstructions && (
              <div
                className="flex items-start gap-3 bg-white rounded-2xl shadow p-4 mb-2 border border-gray-100 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => {
                  setShowInstructions(true);
                  setTempNote(note);
                }}
                title="Click to edit your note"
              >
                <FileText className="w-5 h-5 mt-1 text-primary-500" />
                <div>
                  <div className="font-semibold text-gray-800 mb-1">Note for the restaurant</div>
                  <div className="text-gray-700 break-words">{note}</div>
                </div>
              </div>
            )}
            <AddressSection uid={userDetails!.uid} />
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Preferred Delivery Date</h2>
              <div className="flex flex-row gap-4 overflow-x-auto pb-4">
                {deliveryDates.map((date, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDeliveryDate(date)}
                    className={`px-6 py-3 rounded-full border-2 text-sm font-medium transition-all text-center flex-shrink-0 ${
                      preferredDeliveryDate === date
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow"
                        : "border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50"
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Preferred Delivery Time</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "9:00 AM - 10:00 AM",
                  "10:00 AM - 11:00 AM",
                  "11:00 AM - 12:00 PM",
                  "12:00 PM - 1:00 PM",
                  "1:00 PM - 2:00 PM",
                  "4:00 PM - 5:00 PM",
                  "5:00 PM - 6:00 PM",
                  "6:00 PM - 7:00 PM",
                  "7:00 PM - 8:00 PM",
                  "8:00 PM - 9:00 PM",
                  "9:00 PM - 10:00 PM",
                  "10:00 PM - 11:00 PM",
                 
                ].map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDeliveryTime(slot)}
                    className={`p-4 rounded-xl border-2 text-sm font-medium transition-all text-center ${
                      preferredDeliveryTime === slot
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow"
                        : "border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* ✅ Pass PACKAGING_CHARGE as a new prop */}
            <OrderSummary
              grossTotalPrice={grossTotalPrice}
              voucherDiscount={voucherDiscount}
              deliveryPrice={DELIVERY_PRICE}
              packagingCharge={PACKAGING_CHARGE}
              totalPrice={totalPrice}
              appliedVoucher={appliedVoucher}
              onApplyVoucher={onOpen}
              onRemoveVoucher={() => {
                setAppliedVoucher(null);
                setVoucherDiscount(0);
                toast.success('Voucher removed');
              }}
              paymentMode={paymentMode as 'online' | 'cod'}
              onPaymentModeChange={(mode) => setPaymentMode(mode)}
              onHandlePayment={handlePaymentClick}
              isLoading={isPlacingOrder}
            />
          </div>
        </div>
      </div>

      <VoucherModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onOpen={onOpen}
        onValidVoucher={(voucher) => {
          const error = validateVoucher(
            voucher,
            userDetails?.phoneNumber || '',
            // ✅ Include PACKAGING_CHARGE in the total for voucher validation
            grossTotalPrice + DELIVERY_PRICE + PACKAGING_CHARGE
          );
          if (error) {
            toast.error(error);
          } else {
            setAppliedVoucher(voucher);
            let discount = 0;
            if (voucher.discountType === 'percentage') {
              discount = (grossTotalPrice * voucher.discountValue) / 100;
            } else {
              discount = voucher.discountValue;
            }
            setVoucherDiscount(discount);
            // ✅ Pass PACKAGING_CHARGE as the third argument
            calculateTotalPrice(DELIVERY_PRICE, PACKAGING_CHARGE);
            toast.success('Voucher applied!');
            onOpenVoucherAppliedModal();
          }
        }}
        onOpenVoucherAppliedModal={onOpenVoucherAppliedModal}
      />

      <VoucherAppliedModal
        isOpen={isVoucherAppliedModalOpen}
        onOpenChange={onOpenVoucherAppliedModalChange}
        voucherCode={appliedVoucher?.code || ''}
        discount={voucherDiscount}
      />

      <OrderPlacedModal />
    </div>
  );
};

export default Checkout;
