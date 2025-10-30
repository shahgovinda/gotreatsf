import { db } from '../config/firebaseConfig';
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { OrderDetails, OrderData } from '../types/orderTypes';

export const handleCheckout = async (orderDetails: OrderDetails): Promise<boolean> => {
    try {
        // This spreads all fields from the updated OrderDetails type (including packagingCharge)
        const orderData: OrderData = {
            ...orderDetails,
            createdAt: new Date().toISOString(),
            paymentStatus: orderDetails.paymentStatus || 'pending',
            orderStatus: orderDetails.orderStatus || 'pending',
        };

        await addDoc(collection(db, 'orders'), orderData);
        return true;
    } catch (error) {
        console.error('Error placing order:', error);
        return false;
    }
};

// Fetch orders for a specific user (by UID)
export const fetchUserOrders = async (uid: string): Promise<OrderData[]> => {
    try {
        const userOrdersQuery = query(
            collection(db, 'orders'),
            where('customer.uid', '==', uid),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(userOrdersQuery);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderData));
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return [];
    }
};

// Fetch all orders from Firestore
export const fetchAllOrders = async (): Promise<OrderData[]> => {
    try {
        const allOrdersQuery = query(
            collection(db, 'orders'),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(allOrdersQuery);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderData));
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw new Error('Failed to fetch orders');
    }
};

// Update order status in Firestore
export const updateOrderStatus = async (orderId: string, newStatus: string): Promise<void> => {
    try {
        const orderRef = doc(db, 'orders', orderId);

        // Fetch current order data
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) throw new Error('Order not found');
        const order = orderSnap.data() as OrderData;

        // Prepare update object
        const updateObj: any = { orderStatus: newStatus };

        // If delivered and paymentStatus is pending, set paymentStatus to success
        if (newStatus === 'delivered' && order.paymentStatus === 'pending') {
            updateObj.paymentStatus = 'success';
        }

        await updateDoc(orderRef, updateObj);
    } catch (error) {
        console.error('Error updating order status:', error);
        throw new Error('Failed to update order status');
    }
};


export async function deleteOrdersByCustomerUid(uid: string) {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("customer.uid", "==", uid));
    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map((orderDoc) =>
        deleteDoc(doc(db, "orders", orderDoc.id))
    );

    await Promise.all(deletePromises);
    return deletePromises.length; // returns number of deleted docs
}
