import { Voucher } from "./voucherTypes";

export type Customer = {
  uid: string;
  name: string;
  email: string;
  phoneNumber: string;
};

export type Address = {
  flatNumber: string;
  buildingName: string;
  streetAddress: string;
  landmark?: string;
  area: string;
  pincode: string;
};

// Define a type for a single item in the order
export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  // Add other properties if needed, e.g., imageUrl, category etc.
};

export type OrderDetails = {
  items: OrderItem[]; // Use the defined OrderItem type instead of any[]
  totalAmount: number;
  grossTotalPrice: number; // Changed to number to match the cart store
  gst?: number;
  deliveryCharge: number;
  totalQuantity: number;
  note?: string;
  deliveryTime: string;
  deliveryDate: string; // This is correct, it will be an ISO string
  customer: Customer;
  address: Address;
  razorpay_payment_id?: string;
  paymentStatus?: 'success' | 'failed' | 'pending';
  orderStatus?: 'received' | 'pending' | 'preparing' | 'out for delivery' | 'delivered' | 'failed' | 'cancelled';
  voucherDiscount?: Voucher; // Use the specific Voucher type
  voucherCode?: string;
};

export type OrderData = OrderDetails & {
  id?: string;
  createdAt: string;
};
