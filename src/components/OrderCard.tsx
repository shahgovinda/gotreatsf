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
  X,
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
  Tooltip,
} from "@heroui/react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Button, { IconButton } from "./Button";
import { StatusBadge } from "./StatusBadge";

const OrderCard = ({ order, onUpdateStatus, i }) => {
  const [expanded, setExpanded] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
      case "failed":
        return "border-red-500";
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
      default:
        return "bg-gray-400";
    }
  };

  const safeCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  function copyToClipboard(phoneNumber) {
    navigator.clipboard
      .writeText(phoneNumber)
      .then(() => toast.success("Phone number copied!"))
      .catch(() => toast.error("Failed to copy."));
  }

  const photoURL = order?.customer?.photoURL;

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

      {/* Body */}
      <div className="p-4 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-2 md:gap-0 md:justify-items-center">
          {/* Customer Info */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-300">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Customer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-200">
                  <User className="text-gray-500" size={28} />
                </div>
              )}
            </div>

            <div className="text-center md:text-left">
              <p className="font-semibold text-xl">{order.customer.name}</p>
              <p className="text-gray-800">{order.customer.phoneNumber}</p>
              <p className="text-sm text-gray-600">{order.customer.email}</p>
            </div>
          </div>

          {/* Items */}
          <hr className="md:hidden border border-gray-400 my-2" />
          <div>
            {order.items.map((item, index) => (
              <p key={index} className="font-bold text-purple-700 comfortaa">
                {item.productName} × {item.quantity}
              </p>
            ))}
          </div>

          {/* Address + Time */}
          <hr className="md:hidden border border-gray-400 my-2" />
          <div>
            <p className="inline-flex items-center gap-2">
              <Clock size={16} /> {order.deliveryDate} | {order.deliveryTime}
            </p>
            <p className="inline-flex items-center gap-2">
              <Home size={16} /> {order.address}
            </p>
          </div>

          {/* Payment Info */}
          <hr className="md:hidden border border-gray-400 my-2" />
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

          {/* Controls */}
          <div className="flex w-full gap-4">
            <Select
              placeholder="Select Status"
              selectedKeys={new Set([order.orderStatus])}
              variant="bordered"
              radius="full"
              className={`border-4 p-px rounded-full ${getBorderColor(
                order.orderStatus
              )}`}
              onSelectionChange={(newStatus) => {
                const status = Array.from(newStatus)[0];
                onUpdateStatus(order.id, status);
              }}
            >
              <SelectItem key="received" startContent={<Download size={15} />}>
                Received
              </SelectItem>
              <SelectItem key="preparing" startContent={<Loader size={15} />}>
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

            <Button
              size="sm"
              className="md:hidden"
              variant="secondary"
              onClick={onOpen}
            >
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

        {/* Expanded View (Desktop) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden md:block mt-4 border-t border-gray-300 p-4 bg-white overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Customer Details */}
                <div>
                  <h3 className="font-semibold lancelot text-purple-700 mb-2 flex gap-2 items-center">
                    <User size={19} /> Customer Details
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
                      {photoURL ? (
                        <img
                          src={photoURL}
                          alt="Customer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-200">
                          <User className="text-gray-500" size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p>
                        <strong>{order.customer.name}</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.customer.email}
                      </p>
                    </div>
                  </div>
                  <p>
                    <strong>Customer ID:</strong> {order.customer.uid}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.customer.phoneNumber}
                  </p>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-semibold lancelot text-purple-700 mb-2 flex gap-2 items-center">
                    <MapPin size={19} /> Address
                  </h3>
                  <p>{order.address}</p>
                </div>

                {/* Payment */}
                <div>
                  <h3 className="font-semibold lancelot text-purple-700 mb-2 flex gap-2 items-center">
                    <Banknote size={19} /> Payment Details
                  </h3>
                  <p>
                    <strong>Total Items:</strong> {order.totalQuantity}
                  </p>
                  <p>
                    <strong>Total Price:</strong> ₹{safeCurrency(order.totalAmount)}
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
    </motion.div>
  );
};

export default OrderCard;
