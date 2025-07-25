import { ArrowLeft, ArrowRight, Banknote, Box, Check, Circle, Clock, Coins, CookingPot, Copy, Download, Eye, HandCoins, Home, Info, Loader, MapPin, ShoppingBasket, TriangleAlert, Truck, BanknoteIcon, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { Select, SelectSection, SelectItem, Drawer, useDisclosure, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Tooltip } from "@heroui/react";
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Button, { IconButton } from './Button';
import { StatusBadge } from './StatusBadge';

const OrderCard = ({ order, onUpdateStatus, i }) => {
    const [expanded, setExpanded] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(new Set([order.orderStatus]));
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const handleStatusChange = (newStatus) => {
        setSelectedStatus(newStatus);
        const status = Array.from(newStatus)[0]; // Convert Set to array and get the first value
        onUpdateStatus(order.id, status); // Update the order status
        // toast.success(`Order for ${order.customer.name} is ${status}`);

    };

    // Format the createdAt date and time
     const formatOrderDateTime = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
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
            case 'received':
                return 'bg-orange-500';
            case 'preparing':
                return 'bg-yellow-500';
            case 'out for delivery':
                return 'bg-blue-500';
            case 'delivered':
                return 'bg-green-500';
            case 'cancelled':
            case 'failed':
                return 'bg-red-500';
            case 'pending':
                return 'bg-gray-400';
            default:
                return 'bg-gray-300';
        }
    };

    function copyToClipboard(phoneNumber: string): void {
        navigator.clipboard.writeText(phoneNumber)
            .then(() => {
                toast.success('Phone number copied to clipboard!');
            })
            .catch(() => {
                toast.error('Failed to copy phone number.');
            });
    }

    return (
        <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -50 }} // Mount animation: from top
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }} // Unmount animation: fade out to the right
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className={`border rounded-lg overflow-hidden shadow ${getBorderColor(
                order.orderStatus
            )}`}
        >
            {/* Dynamic background color for the header */}
            <div className={`p-3 flex justify-between md:items-center transition-colors duration-300 ${getBackgroundColor(order.orderStatus)}`}>
                <h2 className="font-semibold text-white text-lg"># {order.id.slice(-6)}</h2>
                <h2 className=" font-semibold text-white text-lg animate-pulse">{order.razorpay_payment_id  ? <p className='flex gap-1'><BanknoteIcon/> Paid</p> : <p className='flex gap-1'><HandCoins /> COD</p>}</h2>
                <h2 className=" hidden md:block font-semibold text-white text-lg capitalize">{order.orderStatus}</h2>
                <h2 className="text-white text-lg">{formatOrderDateTime(order.createdAt)}</h2>
            </div>
            <div className="p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-2 md:gap-0 md:justify-items-center">
                    <div className=''>
                        {/* for mobile */}
                        <div className='md:hidden flex items-center justify-between'>
                            <p className="font-semibold text-xl">{order.customer.name}</p>
                            <StatusBadge status={order.orderStatus} />
                        </div>
                        <p className=" hidden md:block font-semibold text-xl">{order.customer.name}</p>
                        <p className="text-gray-800">{order.customer.phoneNumber}</p>
                        <p>{order.customer.email}</p>
                    </div>
                    <hr className=" md:hidden border border-gray-400 my-2" />
                    <div>
                        {order.items.map((item, index) => (
                            <p key={index} className="font-bold  text-purple-700 comfortaa">
                                {item.productName} x {item.quantity}
                            </p>
                        ))}
                    </div>
                    <hr className=" md:hidden border border-gray-400 my-2" />
                    <div>
                        <p className="inline-flex items-center gap-2">
                            <Clock size={16} /> {order.deliveryTime}
                        </p>
                        <p className="inline-flex items-center gap-2">
                            <Home size={16} /> {order.address}
                        </p>
                    </div>
                    <hr className=" md:hidden border border-gray-400 my-2" />
                    <div className='hidden md:block'>
                        <p>
                            <strong>Total Items:</strong> {order.totalQuantity}
                        </p>
                        <p>
                            <strong>Total Price:</strong> ₹{order.totalAmount}
                        </p>
                        <p className='animate-pulse capitalize'>
                            <strong>Payment Status:</strong> {order.paymentStatus}
                        </p>
                    </div>
                    {/* <hr className=" md:hidden border border-gray-400 my-2" /> */}
                    <div className='flex w-full gap-4 '>
                        {/* Dropdown to update order status */}

                        <Select
                            placeholder="Select Status"
                            selectedKeys={new Set([order.orderStatus])} // Use order.orderStatus directly
                            variant="bordered"
                            radius="full"
                            className={`border-4 p-px rounded-full ${getBorderColor(order.orderStatus)}`}
                            onSelectionChange={(newStatus) => {
                                const status = Array.from(newStatus)[0]; // Convert Set to array and get the first value
                                onUpdateStatus(order.id, status); // Update the order status
                            }}
                        >
                            <SelectItem
                                key="received"
                                startContent={<Download size={15} />}
                                color="warning"
                                className="bg-orange-200"
                            >
                                Received
                            </SelectItem>
                            <SelectItem
                                key="preparing"
                                startContent={<Loader className="animate-spin" size={15} />}
                                color="warning"
                                className="bg-yellow-200"
                            >
                                Preparing
                            </SelectItem>
                            <SelectItem
                                key="out for delivery"
                                startContent={<Truck size={15} />}
                                className="hover:bg-blue-500 bg-blue-200"
                            >
                                Out for Delivery
                            </SelectItem>
                            <SelectItem
                                key="delivered"
                                startContent={<Circle size={15} />}
                                color="success"
                                className="bg-green-300"
                            >
                                Delivered
                            </SelectItem>
                            <SelectItem
                                key="cancelled"
                                startContent={<X size={15} />}
                                color="danger"
                                className="bg-red-200"
                            >
                                Cancelled
                            </SelectItem>
                            <SelectItem
                                key="failed"
                                startContent={<TriangleAlert size={15} />}
                                color="danger"
                                className="bg-red-200"
                            >
                                Failed
                            </SelectItem>
                        </Select>

                        {/* Button to view order details */}

                        <Button size='sm' className='md:hidden'
                            variant='secondary' onClick={onOpen}
                        >
                            <Eye size={20} />
                            View</Button>
                        <Tooltip content="View Order Details" color='secondary' >
                            <span
                                onClick={() => setExpanded(!expanded)}
                                className=' hidden p-2 hover:bg-gray-100 md:inline-flex justify-center items-center rounded-full focus:bg-gray-100'>
                                <Info size={20} />
                            </span>
                        </Tooltip>
                    </div>
                </div>
                {/* for desktop */}

                <AnimatePresence>


                    {
                        expanded && (

                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                transition={{ duration: 0.3 }}
                                exit={{ height: 0 }}
                                className='hidden md:block mt-4 border-t border-gray-300 p-4 overflow-hidden'>

                                <div className="grid  grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Customer Details */}
                                    <div className=''>
                                        <h3 className="font-semibold lancelot text-purple-700 mb-2 flex gap-2 item-center"><User size={19} /> Customer Details</h3>
                                        <p className='flex justify-between pr-10'><strong>Name:</strong> {order.customer.name}</p>
                                        <p className='flex text-sm justify-between pr-10'><strong>Customer ID:</strong> {order.customer.uid}</p>
                                        <p className='flex justify-between pr-10'><strong>Phone:</strong> {order.customer.phoneNumber}</p>
                                        <p className='flex justify-between pr-10'><strong>Email:</strong> {order.customer.email}</p>
                                    </div>
                                    {/* Address Breakdown */}
                                    <div>
                                        <h3 className="font-semibold lancelot text-purple-700 mb-2 flex gap-2 item-center"><MapPin size={19} /> Address</h3>
                                        <p>{order.address}</p>
                                    </div>

                                    {/* Payment Details */}
                                    <div>
                                        <h3 className="font-semibold lancelot text-purple-700 mb-2 flex gap-2 item-center"><Banknote size={19} /> Payment Details</h3>
                                        <p className='flex justify-between pr-10'><strong>Total Items:</strong> {order.totalQuantity}</p>
                                        <p className='flex justify-between pr-10'><strong>Total Price:</strong> ₹{order.totalAmount}</p>
                                        <p className='text-green-600 flex justify-between pr-10'><strong>Payment ID:</strong> {order.razorpay_payment_id || 'CASH ON DELIVERY'}</p>
                                        <p className='text-green-600 flex justify-between pr-10'><strong>Payment Status:</strong> {order.paymentStatus}</p>
                                        <p className='flex justify-between pr-10'><strong>Delivery Time:</strong> {order.deliveryTime}</p>
                                    </div>
                                    {/* Items */}
                                    <div className="">
                                        <h3 className="font-semibold lancelot text-purple-700 flex gap-2 item-center"><ShoppingBasket size={19} /> Items</h3>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {order.items.map((item, index) => (
                                                <li key={index} className='flex justify-between pr-10'>
                                                    <strong>{item.productName}</strong>  Quantity: {item.quantity}, Price: {item.offerPrice}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold lancelot text-purple-700 mb-2 flex gap-2 item-center"><Box size={19} /> Order Details</h3>
                                        <p className='flex justify-between pr-10'><strong>Total Items:</strong> {order.totalQuantity}</p>
                                        <p className='flex justify-between pr-10'><strong>Order Status:</strong> {order.orderStatus}</p>
                                        <p className='flex justify-between pr-10'><strong>Gross Total: </strong> ₹{order.grossTotalPrice}</p>
                                        <p className='flex justify-between pr-10'><strong>Discount: </strong> -₹{order.voucherDiscount ? order.voucherDiscount : 0}</p>
                                        <p className='flex justify-between pr-10'><strong>Voucher Code: </strong> '{order.voucherCode ? order.voucherCode : 'No Voucher'}'</p>
                                        <p className='flex justify-between pr-10'><strong>Delivery: </strong> ₹{order.deliveryCharge}</p>
                                        <p className='flex justify-between pr-10'><strong>GST: </strong> ₹{order.gst}</p>
                                        <p className='flex justify-between pr-10'><strong>Order Created At:</strong> {formatOrderDateTime(order.createdAt)}</p>

                                    </div>
                                    <div>
                                        <h3 className="font-bold lancelot text-purple-700 mb-2 flex gap-2 item-center">< CookingPot size={19} /> Instruction</h3>
                                        <p className='text-gray-600'>" {order.note} "</p>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence>
            </div>

            <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="flex items-center gap-1 bg-white  border-b fixed  top-0 w-full z-[100] shadow-sm">
                                <IconButton><ArrowLeft size={20} onClick={onClose} /></IconButton>
                                <p> Order #{order?.id}</p>

                            </DrawerHeader>
                            <DrawerBody className="h-full overflow-auto mt-18">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {/* Customer Details */}
                                    <div>
                                        <h3 className="font-semibold lancelot text-2xl mb-2">Customer Details</h3>
                                        <p className='flex justify-between '><strong>Name:</strong> {order.customer.name}</p>
                                        <p className='flex justify-between text-sm'><strong>Customer ID:</strong> {order.customer.uid}</p>
                                        <p className='flex items-center justify-between gap-2 '><strong>Phone:</strong> {order.customer.phoneNumber}</p>
                                        <p className='flex justify-between '><strong>Email:</strong> {order.customer.email}</p>
                                    </div>
                                    <hr className='md:hidden border border-gray-400 my-1' />
                                    {/* Address Breakdown */}
                                    <div>
                                        <h3 className="font-semibold lancelot text-2xl mb-2">Address</h3>
                                        <p>{order.address}</p>
                                    </div>

                                    <hr className='md:hidden border border-gray-400 my-1' />
                                    {/* Items */}
                                    <div className="">
                                        <h3 className="font-semibold lancelot text-2xl mb-2">Items</h3>
                                        <ul className="list-disc px-5 space-y-1">
                                            {order.items.map((item, index) => (
                                                <li key={index} className='flex justify-between '>
                                                    <strong className='comfortaa font-bold text-purple-700 '>{item.productName} X {item.quantity}</strong>  ₹{item.offerPrice * item.quantity}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <hr className='md:hidden border border-gray-400 my-1' />
                                    {/* Payment Details */}
                                    <div>
                                        <h3 className="font-semibold lancelot text-2xl mb-2">Payment Details</h3>
                                        <p className='flex justify-between '><strong>Total Items:</strong> {order.totalQuantity}</p>
                                        <p className='flex justify-between '><strong>GST:</strong> ₹{order.gst.toFixed(2)}</p>
                                        <p className='flex justify-between '><strong>Delivery Charge:</strong> ₹{order.deliveryCharge}</p>
                                        <p className='text-green-600 flex font-bold justify-between'><strong>Total Price:</strong> ₹{order.totalAmount}</p>
                                        <p className='text-green-600 flex justify-between'><strong>Payment ID:</strong> {order.razorpay_payment_id || 'CASH ON DELIVERY'}</p>
                                        <p className='text-green-600 flex justify-between'><strong>Payment Status:</strong> {order.paymentStatus}</p>
                                        <p><strong>Delivery Time:</strong> {order.deliveryTime}</p>
                                    </div>
                                    <hr className='md:hidden border border-gray-400 my-1' />

                                    <div>
                                        <h3 className="font-bold lancelot text-2xl mb-2">Order Details</h3>
                                        <p className='flex justify-between '><strong>Total Items:</strong> {order.totalQuantity}</p>
                                        <p className='flex justify-between '><strong>Order Status:</strong> {order.orderStatus}</p>
                                        <p className='flex justify-between font-bold '><strong>Gross Total: </strong> ₹{order.grossTotalPrice}</p>
                                        <p className='flex justify-between  font-bold'><strong>Discount: </strong> -₹{order.voucherDiscount}</p>
                                        <p className='flex justify-between '><strong>Voucher Code: </strong> '{order.voucherCode}'</p>
                                        <p className='flex justify-between '><strong>Delivery: </strong> ₹{order.deliveryCharge}</p>
                                        <p className='flex justify-between '><strong>GST: </strong> ₹{order.gst}</p>
                                        <p className='flex justify-between '><strong>Order Created At:</strong> {formatOrderDateTime(order.createdAt)}</p>

                                    </div>
                                    <hr className='md:hidden border border-gray-400 my-1' />
                                    <div>
                                        <h3 className="font-bold lancelot text-2xl mb-2">Cooking Instruction</h3>
                                        <p className='text-gray-600'>" {order.note} "</p>
                                    </div>
                                </div>
                            </DrawerBody>
                            <DrawerFooter className='border-t-2 border-gray-200'>
                                <Select
                                    placeholder="Select Status"
                                    selectedKeys={new Set([order.orderStatus])} // Use order.orderStatus directly
                                    variant="bordered"
                                    radius="full"
                                    className={`border-4 p-px rounded-full ${getBorderColor(order.orderStatus)}`}
                                    onSelectionChange={(newStatus) => {
                                        const status = Array.from(newStatus)[0]; // Convert Set to array and get the first value
                                        onUpdateStatus(order.id, status); // Update the order status
                                    }}
                                >
                                    <SelectItem
                                        key="received"
                                        startContent={<Download size={15} />}
                                        color="warning"
                                        className="bg-orange-200"
                                    >
                                        Received
                                    </SelectItem>
                                    <SelectItem
                                        key="preparing"
                                        startContent={<Loader className="animate-spin" size={15} />}
                                        color="warning"
                                        className="bg-yellow-200"
                                    >
                                        Preparing
                                    </SelectItem>
                                    <SelectItem
                                        key="out for delivery"
                                        startContent={<Truck size={15} />}
                                        className="hover:bg-blue-500 bg-blue-200"
                                    >
                                        Out for Delivery
                                    </SelectItem>
                                    <SelectItem
                                        key="delivered"
                                        startContent={<Circle size={15} />}
                                        color="success"
                                        className="bg-green-300"
                                    >
                                        Delivered
                                    </SelectItem>
                                    <SelectItem
                                        key="cancelled"
                                        startContent={<X size={15} />}
                                        color="danger"
                                        className="bg-red-200"
                                    >
                                        Cancelled
                                    </SelectItem>
                                    <SelectItem
                                        key="failed"
                                        startContent={<TriangleAlert size={15} />}
                                        color="danger"
                                        className="bg-red-200"
                                    >
                                        Failed
                                    </SelectItem>
                                </Select>
                                <Button variant="secondary" size='sm' onClick={onClose}>
                                    Close
                                </Button>

                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
            {
                order.note && (
                    <div className='hidden md:flex items-center justify-center gap-4 border-t text-pink-600 py-1 bg-white'>
                        <CookingPot className='animate-pulse' size={20} />
                        <p className='animate-pulse'>"{order.note}"</p>
                    </div>
                )
            }

        </motion.div>
    );
};

export default OrderCard;