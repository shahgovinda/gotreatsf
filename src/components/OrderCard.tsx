import {
  ArrowLeft,
  Banknote,
  BanknoteIcon,
  Clock,
  Copy,
  HandCoins,
  Home,
  Info,
  MapPin,
  ShoppingBasket,
  User,
} from "lucide-react";
import React, { useState } from "react";
import {
  Select,
  SelectItem,
  Drawer,
  useDisclosure,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Button from "./Button";

const OrderCard = ({ order, onUpdateStatus, i }) => {
  const [expanded, setExpanded] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleStatusChange = (newStatus) => {
    const status = Array.from(newStatus)[0];
    onUpdateStatus(order.id, status);
  };

  const formatOrderDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const getBorderColor = (status) => {
    switch (status) {
      case "received":
        return "border-orange-500";
      case "preparing":
        return "border-yellow-500";
      case "out for delivery":
        return "border-blue-500";
      case "delivered":
        return "border-green-700";
      case "cancelled":
        return "border-red-500";
      case "pending":
        return "border-gray-400";
      case "failed":
        return "border-red-400";
      default:
        return "border-gray-300";
    }
  };

  const getBackgroundColor = (status) => {
    switch (status) {
      case "received":
        return "bg-orange-500";
      case "preparing":
        return "bg-yellow-500";
      case "out for delivery":
        return "bg-blue-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
      case "failed":
        return "bg-red-500";
      case "pending":
        return "bg-gray-400";
      default:
        return "bg-gray-300";
    }
  };

  const safeCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const copyToClipboard = (phoneNumber) => {
    navigator.clipboard
      .writeText(phoneNumber)
      .then(() => toast.success("Phone number copied!"))
      .catch(() => toast.error("Failed to copy phone number."));
  };

  // ✅ Determine profile image logic
  const customer = order.customer || {};
  const manualPhoto = customer.manualPhotoURL; // manually uploaded
  const googlePhoto = customer.photoURL; // google photo
  const userName = customer.name || "User";
  const initialLetter = userName.charAt(0).toUpperCase();

  // ✅ Final profile image logic
  const profileImage = manualPhoto || googlePhoto || null;

  return (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3, delay: i * 0.1 }}
      className={`border rounded-lg overflow-hidden shadow ${getBorderColor(
        order.orderStatus
      )}`}
    >
      {/* Header */}
      <div
        className={`p-3 flex justify-between md:items-center ${getBackgroundColor(
          order.orderStatus
        )}`}
      >
        <h2 className="font-semibold text-white text-lg">
          # {order.id.slice(-6)}
        </h2>
        <h2 className="font-semibold text-white text-lg flex items-center gap-1">
          {order.razorpay_payment_id ? (
            <>
              <BanknoteIcon /> Paid
            </>
          ) : (
            <>
              <HandCoins /> COD
            </>
          )}
        </h2>
        <h2 className="hidden md:block font-semibold text-white text-lg capitalize">
          {order.orderStatus}
        </h2>
        <h2 className="text-white text-lg">
          {formatOrderDateTime(order.createdAt)}
        </h2>
      </div>

      {/* Body */}
      <div className="p-4 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-3 md:gap-0 md:justify-items-center">
          {/* 🧍‍♂️ Customer Info with Profile */}
          <div className="flex items-center gap-3">
            {profileImage ? (
              <img
                src={profileImage}
                alt="User"
                className="w-12 h-12 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white font-bold text-lg">
                {initialLetter}
              </div>
            )}
            <div>
              <p className="font-semibold text-xl">{userName}</p>
              <p className="text-gray-800">{customer.phoneNumber}</p>
              <p className="text-sm">{customer.email}</p>
            </div>
          </div>

          <div>
            {order.items.map((item, index) => (
              <p key={index} className="font-bold text-purple-700 comfortaa">
                {item.productName} x {item.quantity}
              </p>
            ))}
          </div>

          <div>
            <p className="inline-flex items-center gap-2">
              <Clock size={16} /> {order.deliveryDate} | {order.deliveryTime}
            </p>
            <p className="inline-flex items-center gap-2">
              <Home size={16} /> {order.address}
            </p>
          </div>

          <div className="hidden md:block">
            <p>
              <strong>Total Items:</strong> {order.totalQuantity}
            </p>
            <p>
              <strong>Total Price:</strong> ₹{safeCurrency(order.totalAmount)}
            </p>
            <p className="capitalize">
              <strong>Payment Status:</strong> {order.paymentStatus}
            </p>
          </div>

          {/* Status Dropdown + View */}
          <div className="flex w-full gap-3">
            <Select
              placeholder="Select Status"
              selectedKeys={new Set([order.orderStatus])}
              variant="bordered"
              radius="full"
              className={`border-4 p-px rounded-full ${getBorderColor(
                order.orderStatus
              )}`}
              onSelectionChange={(newStatus) => handleStatusChange(newStatus)}
            >
              <SelectItem key="received">Received</SelectItem>
              <SelectItem key="preparing">Preparing</SelectItem>
              <SelectItem key="out for delivery">Out for Delivery</SelectItem>
              <SelectItem key="delivered">Delivered</SelectItem>
              <SelectItem key="cancelled">Cancelled</SelectItem>
              <SelectItem key="failed">Failed</SelectItem>
            </Select>

            <Button size="sm" variant="secondary" onClick={onOpen}>
              <Info size={18} />
              View
            </Button>
          </div>
        </div>

        {/* 🔽 Expanded (Desktop) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden md:block mt-4 border-t p-4 bg-white"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-purple-700 mb-2 flex gap-2">
                    <User size={19} /> Customer Details
                  </h3>
                  <p>
                    <strong>Name:</strong> {customer.name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {customer.phoneNumber}
                  </p>
                  <p>
                    <strong>Email:</strong> {customer.email}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-purple-700 mb-2 flex gap-2">
                    <MapPin size={19} /> Address
                  </h3>
                  <p>{order.address}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-purple-700 mb-2 flex gap-2">
                    <Banknote size={19} /> Payment
                  </h3>
                  <p>
                    <strong>Total:</strong> ₹{safeCurrency(order.totalAmount)}
                  </p>
                  <p>
                    <strong>Status:</strong> {order.paymentStatus}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 📱 Mobile Drawer */}
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-white">
          {(onClose) => (
            <>
              <DrawerHeader className="flex items-center gap-2 border-b">
                <ArrowLeft
                  size={20}
                  onClick={onClose}
                  className="cursor-pointer"
                />
                <p>Order #{order.id.slice(-6)}</p>
              </DrawerHeader>

              <DrawerBody className="overflow-auto p-4">
                <div className="space-y-4">
                  <div className="border-b pb-4 flex items-center gap-3">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="User"
                        className="w-14 h-14 rounded-full border object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white font-bold text-xl">
                        {initialLetter}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{userName}</h3>
                      <p className="text-sm text-gray-700">{customer.email}</p>
                      <p
                        className="text-blue-600 flex items-center gap-1 cursor-pointer"
                        onClick={() => copyToClipboard(customer.phoneNumber)}
                      >
                        {customer.phoneNumber} <Copy size={14} />
                      </p>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-lg mb-2 flex gap-2">
                      <ShoppingBasket size={18} /> Items
                    </h3>
                    {order.items.map((item, i) => (
                      <p key={i}>
                        {item.productName} × {item.quantity}
                      </p>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex gap-2">
                      <Banknote size={18} /> Billing
                    </h3>
                    <p>
                      <strong>Gross Total:</strong> ₹
                      {safeCurrency(order.grossTotalPrice)}
                    </p>
                    <p>
                      <strong>Discount:</strong> -₹
                      {safeCurrency(order.voucherDiscount)}
                    </p>
                    <p>
                      <strong>Packaging:</strong> ₹
                      {safeCurrency(order.packagingCharge || 10)}
                    </p>
                    <p>
                      <strong>Total Paid:</strong> ₹
                      {safeCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </DrawerBody>

              <DrawerFooter>
                <Button variant="secondary" className="w-full" onClick={onClose}>
                  Close
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
};

export default OrderCard;
