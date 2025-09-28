import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import { Trash } from 'lucide-react';
import { CartItem } from '../types/CartTypes';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';

interface CartSectionProps {
	items: CartItem[];
	updateItemQuantity: (itemId: string, quantity: number) => void;
}

const CartSection: React.FC<CartSectionProps> = ({ items, updateItemQuantity }) => {
	const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
	const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
	const clearCart = useCartStore((state) => state.clearCart);
	const navigate = useNavigate();

	const handleClearCart = () => {
		clearCart();
		setShowClearCartConfirm(false);
	};

	const handleRemoveItem = () => {
		if (itemToRemove) {
			updateItemQuantity(itemToRemove.id, 0);
			setItemToRemove(null);
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
			<div className="p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-semibold text-gray-800">
						Your Cart
						<span className="text-lg text-gray-500 ml-2">
							({items.reduce((total, item) => total + item.quantity, 0)} items)
						</span>
					</h2>
					{items.length > 0 && (
						<button
							onClick={() => setShowClearCartConfirm(true)}
							className="text-gray-500 hover:text-red-500 transition-colors"
							aria-label="Clear cart"
						>
							<Trash size={22} />
						</button>
					)}
				</div>

				{items.length > 0 ? (
					<motion.div layout className="space-y-4">
						<AnimatePresence>
							{items.map((item) => (
								<motion.div
									key={item.id}
									layout
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
									className="flex items-center gap-4 p-4 rounded-xl bg-gray-50"
								>
									<button
										onClick={() => navigate(`/shop?itemId=${item.id}`)}
										className="focus:outline-none"
										title={`View details for ${item.productName}`}
									>
										<img
											src={item.imageUrl}
											alt={item.productName}
											className="w-16 h-16 object-cover rounded-lg flex-shrink-0 hover:scale-105 transition-transform"
										/>
									</button>
									<div className="flex-grow">
										<h3 className="font-semibold text-gray-800">{item.productName}</h3>
										<p className="text-gray-500">₹{Number(item.offerPrice).toFixed(2)}</p>
									</div>
									<div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
										<motion.button
											whileTap={{ scale: 0.85 }}
											className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 bg-red-50 hover:bg-red-100 active:scale-90 transition"
											onClick={() => {
												if (item.quantity === 1) {
													setItemToRemove(item);
												} else {
													updateItemQuantity(item.id, item.quantity - 1);
												}
											}}
											aria-label="Decrease quantity"
										>
											-
										</motion.button>
										<span className="w-8 text-center font-bold text-gray-800 select-none">
											{item.quantity}
										</span>
										<motion.button
											whileTap={{ scale: 0.85 }}
											className="w-8 h-8 flex items-center justify-center rounded-full text-green-600 bg-green-50 hover:bg-green-100 active:scale-90 transition"
											onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
											aria-label="Increase quantity"
										>
											+
										</motion.button>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>
				) : (
					<div className="text-center py-12">
						<p className="text-gray-500">Your cart is empty.</p>
					</div>
				)}
			</div>

			<Modal
				isOpen={showClearCartConfirm}
				title="Clear Cart?"
				message="Are you sure you want to remove all items from your cart? This action cannot be undone."
				confirmLabel="Clear Cart"
				cancelLabel="Cancel"
				onConfirm={handleClearCart}
				onCancel={() => setShowClearCartConfirm(false)}
			/>

			<Modal
				isOpen={!!itemToRemove}
				title="Remove Item?"
				message={`Are you sure you want to remove "${itemToRemove?.productName}" from your cart?`}
				confirmLabel="Remove"
				cancelLabel="Cancel"
				onConfirm={handleRemoveItem}
				onCancel={() => setItemToRemove(null)}
			/>
		</div>
	);
};

export default CartSection;
