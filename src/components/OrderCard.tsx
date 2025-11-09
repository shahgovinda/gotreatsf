import {
  ArrowLeft,
  Banknote,
  BanknoteIcon,
  Box,
  Circle,
  Clock,
  CookingPot,
  Copy,
  Download,
  Eye,
  HandCoins,
  Home,
  Info,
  Loader,
  MapPin,
  ShoppingBasket,
  TriangleAlert,
  Truck,
  User,
  X
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
  Tooltip
} from "@heroui/react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Button, { IconButton } from "./Button";
import { StatusBadge } from "./StatusBadge";

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
      timeStyle: "short"
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const safeCurrency = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? "0.00" : n.toFixed(2);
  };

  // ✅ Choose image priority: manual > Google initial > first letter
  const imageUrl =
    order.customer.profileImage ||
    order.customer.initialAvatar ||
    null;
  const fallbackLetter = order.customer.name
    ? order.customer.name.charAt(0).toUpperCase()
    : "U";

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
      <div
        className={`p-3 flex justify-between md:items-center transition-colors duration-300 ${getBackgroundColor(
          order.orderStatus
        )}`}
      >
        <h2 className="font-semibold text-white text-lg">
          # {order.id.slice(-6)}
        </h2>
        <h2 className="font-semibold text-white text-lg animate-pulse">
          {order.razorpay_payment_id ? (
            <p className="flex gap-1">
              <BanknoteIcon /> Paid
            </p>
          ) : (
            <p className="flex gap-1">
              <HandCoins /> COD
            </p>
          )}
        </h2>
        <h2 className="hidden md:block font-semibold text-white text-lg capitalize">
          {order.orderStatus}
        </h2>
        <h2 className="text-white text-lg">{formatOrderDateTime(order.createdAt)}</h2>
      </div>

      <div className="p-4 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-2 md:gap-0 md:justify-items-center">
          {/* ✅ Customer Info with Image */}
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-700">
                  {fallbackLetter}
                </div>
              )}
              <div>
                <p className="font-semibold text-xl">{order.customer.name}</p>
                <p className="text-gray-800 text-sm">{order.customer.phoneNumber}</p>
                <p className="text-gray-600 text-sm">{order.customer.email}</p>
              </div>
            </div>
          </div>

          <hr className="md:hidden border border-gray-400 my-2" />

          {/* Items */}
          <div>
            {order.items.map((item, idx) => (
              <p key={idx} className="font-bold text-purple-700 comfortaa">
                {item.productName} x {item.quantity}
              </p>
            ))}
          </div>

          <hr className="md:hidden border border-gray-400 my-2" />

          {/* Delivery */}
          <div>
            <p className="inline-flex items-center gap-2">
              <Clock size={16} /> {order.deliveryDate} | {order.deliveryTime}
            </p>
            <p className="inline-flex items-center gap-2">
              <Home size={16} /> {order.address}
            </p>
          </div>

          <hr className="md:hidden border border-gray-400 my-2" />

          {/* Totals */}
          <div className="hidden md:block">
            <p>
              <strong>Total Items:</strong> {order.totalQuantity}
            </p>
            <p>
              <strong>Total Price:</strong> ₹{safeCurrency(order.totalAmount)}
            </p>
            <p className="animate-pulse capitalize">
              <strong>Payment Status:</strong> {order.paymentStatus}
            </p>
          </div>

          {/* Status + Buttons */}
          <div className="flex w-full gap-4">
            <Select
              placeholder="Select Status"
              selectedKeys={new Set([order.orderStatus])}
              variant="bordered"
              radius="full"
              className={`border-4 p-px rounded-full ${getBorderColor(order.orderStatus)}`}
              onSelectionChange={(newStatus) => handleStatusChange(newStatus)}
            >
              <SelectItem key="received" startContent={<Download size={15} />}>
                Received
              </SelectItem>
              <SelectItem key="preparing" startContent={<Loader className="animate-spin" size={15} />}>
                Preparing
              </SelectItem>
              <SelectItem key="out for delivery" startContent={<Truck size={15} />}>
                Out for Delivery
              </SelectItem>
              <SelectItem key="delivered" startContent={<Circle size={15} />}>
                Delivered
              </SelectItem>
              <SelectItem key="cancelled" startContent={<X size={15} />}>
                Cancelled
              </SelectItem>
              <SelectItem key="failed" startContent={<TriangleAlert size={15} />}>
                Failed
              </SelectItem>
            </Select>

            <Button size="sm" className="md:hidden" variant="secondary" onClick={onOpen}>
              <Eye size={20} /> View
            </Button>
            <Tooltip content="View Order Details" color="secondary">
              <span
                onClick={() => setExpanded(!expanded)}
                className="hidden p-2 hover:bg-gray-100 md:inline-flex justify-center items-center rounded-full focus:bg-gray-100"
              >
                <Info size={20} />
              </span>
            </Tooltip>
          </div>
        </div>

        {/* EXPANDED DESKTOP DETAILS */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden md:block mt-4 border-t border-gray-300 p-4 overflow-hidden bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-purple-700 mb-2 flex gap-2 items-center">
                    <User size={19} /> Customer Details
                  </h3>
                  <p><strong>Name:</strong> {order.customer.name}</p>
                  <p><strong>Phone:</strong> {order.customer.phoneNumber}</p>
                  <p><strong>Email:</strong> {order.customer.email}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-purple-700 mb-2 flex gap-2 items-center">
                    <MapPin size={19} /> Address
                  </h3>
                  <p>{order.address}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-purple-700 mb-2 flex gap-2 items-center">
                    <Banknote size={19} /> Payment
                  </h3>
                  <p><strong>Total:</strong> ₹{safeCurrency(order.totalAmount)}</p>
                  <p><strong>Delivery:</strong> ₹{safeCurrency(order.deliveryCharge)}</p>
                  <p><strong>Packaging:</strong> ₹{safeCurrency(order.packagingCharge)}</p>
                  <p><strong>Status:</strong> {order.paymentStatus}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MOBILE DRAWER DETAILS */}
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-white">
          {(onClose) => (
            <>
              <DrawerHeader className="flex items-center gap-1 bg-white border-b fixed top-0 w-full z-[100] shadow-sm">
                <IconButton>
                  <ArrowLeft size={20} onClick={onClose} />
                </IconButton>
                <p>Order #{order.id.slice(-6)}</p>
              </DrawerHeader>

              <DrawerBody className="h-full overflow-auto mt-16 p-4">
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-xl mb-2 flex gap-2">
                      <User size={19} /> Customer Details
                    </h3>
                    <p><strong>Name:</strong> {order.customer.name}</p>
                    <p><strong>Phone:</strong> {order.customer.phoneNumber}</p>
                    <p><strong>Email:</strong> {order.customer.email}</p>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-xl mb-2 flex gap-2">
                      <ShoppingBasket size={19} /> Items
                    </h3>
                    {order.items.map((item, idx) => (
                      <p key={idx}>
                        {item.productName} × {item.quantity}
                      </p>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold text-xl mb-2 flex gap-2">
                      <CookingPot size={19} /> Instruction
                    </h3>
                    <p>"{order.note || "No special instructions."}"</p>
                  </div>
                </div>
              </DrawerBody>

              <DrawerFooter className="border-t-2 border-gray-200">
                <Button variant="secondary" className="w-full" onClick={onClose}>
                  Close
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {order.note && (
        <div className="hidden md:flex items-center justify-center gap-4 border-t text-pink-600 py-1 bg-white">
          <CookingPot className="animate-pulse" size={20} />
          <p className="animate-pulse">"{order.note}"</p>
        </div>
      )}
    </motion.div>
  );
};

export default OrderCard;
