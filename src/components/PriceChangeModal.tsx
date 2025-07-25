import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from './Button';

interface PriceChange {
    productName: string;
    oldPrice: number;
    newPrice: number;
}

interface PriceChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    priceChanges: PriceChange[];
}

const PriceChangeModal: React.FC<PriceChangeModalProps> = ({ isOpen, onClose, onConfirm, priceChanges }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Price Update</h2>
                        <p className="text-gray-600 mb-6">The prices of some items in your cart have changed.</p>
                        
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {priceChanges.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                    <span className="font-medium text-gray-700">{item.productName}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 line-through">₹{item.oldPrice.toFixed(2)}</span>
                                        <span className="font-semibold text-green-600">₹{item.newPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-4 mt-8">
                            <Button variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button variant="primary" onClick={onConfirm}>Proceed to Checkout</Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PriceChangeModal; 