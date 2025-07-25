import { CheckCircle, Home, Store, BadgePercent, Check, IndianRupee, Tag, ChevronRight } from "lucide-react";
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { Voucher } from '@/types/voucherTypes';
import { useCartStore } from '../store/cartStore';

interface OrderSummaryProps {
    grossTotalPrice: number;
    voucherDiscount: number;
    deliveryPrice: number;
    totalPrice: number;
    appliedVoucher: Voucher | null;
    onApplyVoucher: () => void;
    onRemoveVoucher?: () => void;
    paymentMode: 'online' | 'cod';
    onPaymentModeChange: (mode: 'online' | 'cod') => void;
    onHandlePayment: () => void;
    isLoading: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
    grossTotalPrice,
    voucherDiscount,
    deliveryPrice,
    totalPrice,
    appliedVoucher,
    onApplyVoucher,
    onRemoveVoucher,
    paymentMode,
    onPaymentModeChange,
    onHandlePayment,
    isLoading
}) => {
    const { items } = useCartStore();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Bill Summary</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {items.length} items
                </span>
            </div>

            {/* Item List */}
            <div className="space-y-3 mb-6">
                {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-gray-700">
                        <div className="flex-1">
                            <span className="text-base">{item.productName} x{item.quantity}</span>
                        </div>
                        <span className="text-base font-medium">₹{(item.offerPrice * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Charges Breakdown */}
            <div className="space-y-3 text-gray-600">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{grossTotalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-medium">₹{deliveryPrice.toFixed(2)}</span>
                </div>
                {voucherDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Voucher Discount</span>
                        <span className="font-medium">- ₹{voucherDiscount.toFixed(2)}</span>
                    </div>
                )}
            </div>

            {/* Applied Voucher Card */}
            {appliedVoucher && (
                <div className="flex items-center justify-between bg-white rounded-2xl shadow border border-dashed border-gray-300 px-6 py-4 mb-4 mt-2">
                    <div>
                        <span className="text-lg font-extrabold text-gray-900 tracking-wide">'{appliedVoucher.code}'</span>
                        <div className="text-gray-700 text-base mt-1">Discount applied on the bill</div>
                    </div>
                    <button
                        onClick={() => onRemoveVoucher?.()}
                        className="font-extrabold text-red-600 text-lg px-3 py-1 rounded-lg hover:bg-red-50 transition-all"
                        aria-label="Remove voucher"
                    >
                        REMOVE
                    </button>
                </div>
            )}

            {/* SAVINGS CORNER - Apply Voucher Card */}
            <div className="mt-6">
                <div className="text-xs font-bold tracking-widest text-gray-400 mb-2 ml-1">SAVINGS CORNER</div>
                <button
                        onClick={onApplyVoucher}
                    className="w-full flex items-center justify-between bg-white rounded-2xl shadow-sm px-4 py-3 transition hover:shadow-md active:scale-[0.98]"
                    >
                    <div className="flex items-center gap-3">
                        <span className="bg-orange-500 rounded-full p-2 flex items-center justify-center">
                            <Tag size={20} className="text-white" />
                        </span>
                        <span className="text-base font-semibold text-gray-800">Apply Voucher</span>
                    </div>
                    <ChevronRight size={22} className="text-gray-400" />
                </button>
                </div>

            {/* Total */}
            <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                </div>
            </div>

            {/* Payment Section */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Payment Mode</h3>
                <div className="flex gap-4 mb-6">
                    <Button
                        variant={paymentMode === 'online' ? 'primary' : 'secondary'}
                        onClick={() => onPaymentModeChange('online')}
                        className='flex-1'
                    >
                        Online
                    </Button>
                    <Button
                        variant={paymentMode === 'cod' ? 'primary' : 'secondary'}
                        onClick={() => onPaymentModeChange('cod')}
                        className='flex-1'
                    >
                        Cash on Delivery
                    </Button>
                </div>
                {/* Professional Pay Button */}
                <button
                    className="w-full py-4 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={onHandlePayment}
                    disabled={isLoading}
                >
                    {paymentMode === 'cod' ? 'Pay on Delivery' : `Pay ₹${totalPrice.toFixed(0)}`}
                </button>
            </div>
        </motion.div>
    );
};

export default OrderSummary;
