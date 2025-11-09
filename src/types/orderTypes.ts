import { Voucher } from "./voucherTypes";

export type Customer = {
    uid: string;
    name: string;
    email: string;
    phoneNumber: string;
    profileImage?: string; // ✅ Added optional field for uploaded image
    initialAvatar?: string; // ✅ Added optional field for Google initial image
};

export type Address = {
    flatNumber: string;
    buildingName: string;
    streetAddress: string;
    landmark?: string;
    area: string;
    pincode: string;
};

export type OrderDetails = {
    items: any[];
    totalAmount: number;
    grossTotalPrice: string;
    // ❌ Replaced gst?: number;
    // ✅ Added packagingCharge (now mandatory in the Checkout flow)
    packagingCharge: number;
    deliveryCharge: number;
    totalQuantity: number;
    note?: string;
    deliveryTime: string;
    deliveryDate: string;
    customer: Customer;
    address: Address;
    razorpay_payment_id?: string;
    paymentStatus?: 'success' | 'failed' | 'pending';
    orderStatus?: 'received' | 'pending' | 'preparing' | 'out for delivery' | 'delivered' | 'failed' | 'cancelled';
    voucherDiscount?: any;
    voucherCode?: string;
};

export type OrderData = OrderDetails & {
    id?: string;
    createdAt: string;
};
