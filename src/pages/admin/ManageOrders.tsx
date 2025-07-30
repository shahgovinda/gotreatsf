import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllOrders, updateOrderStatus } from '../../services/orderService';
import OrderCard from '../../components/OrderCard';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@/components/Button';
import { addToast, cn } from '@heroui/react';
import { X } from 'lucide-react';

const ManageOrders = () => {
  const [activeTab, setActiveTab] = useState<'Active' | 'Delivered' | 'Failed' | 'Cancelled' | 'All'>('Active');
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchAllOrders,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (orders.length > previousOrderCount) {
      // Optional: Toast for new orders
    }
    setPreviousOrderCount(orders.length);
  }, [orders, previousOrderCount]);

  const mutation = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: string; newStatus: string }) =>
      updateOrderStatus(orderId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });

      addToast({
        title: 'Order Status Updated',
        color: 'default',
        shouldShowTimeoutProgress: true,
        timeout: 2000,
        hideIcon: true,
        classNames: {
          closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 stroke-2",
        },
        closeIcon: <X size={32} />,
      });
    },
  });

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    mutation.mutate({ orderId, newStatus });
  };

  const formatAddress = (address: any) => {
    if (!address || typeof address !== 'object') return 'N/A';
    const { flatNumber, buildingName, area, landmark, pincode } = address;
    return [flatNumber, buildingName, area, landmark, pincode].filter(Boolean).join(', ');
  };

  const filteredOrders = orders
    .filter(order => {
      switch (activeTab) {
        case 'Active':
          return (
            order.orderStatus === 'received' ||
            order.orderStatus === 'preparing' ||
            order.orderStatus === 'out for delivery'
          );
        case 'Delivered':
          return order.orderStatus === 'delivered';
        case 'Failed':
          return order.orderStatus === 'failed';
        case 'Cancelled':
          return order.orderStatus === 'cancelled';
        case 'All':
          return true;
        default:
          return false;
      }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) return <div>Loading orders...</div>;
  if (isError) return <div>Error loading orders.</div>;

  return (
    <div className="md:mx-4 w-full">
      <h1 className="md:text-4xl text-3xl font-bold text-center md:text-start lancelot mb-4 md:mb-6 text-white">
        Manage Orders
      </h1>
      <div className="flex justify-center items-center mb-6">
        {['Active', 'Delivered', 'Failed', 'Cancelled'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 ${tab === 'Active' ? 'rounded-l-full' : ''} 
              ${tab === 'Cancelled' ? 'rounded-r-full' : ''}
              ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <div className="text-center my-20 text-gray-500 animate-bounce capitalize">
              Looks like there are no {activeTab.toLowerCase()} orders yet.
            </div>
          ) : (
            filteredOrders.map((order, i) => (
              <div key={i} className="bg-gray-800 text-white p-4 rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">Status: {order.orderStatus}</p>
                  <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <button
                  className="bg-white text-black px-3 py-1 rounded"
                  onClick={() => setSelectedOrder(order)}
                >
                  View
                </button>
              </div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* View Order Modal with white background */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
              onClick={() => setSelectedOrder(null)}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
            <p><strong>Status:</strong> {selectedOrder.orderStatus}</p>
            <p><strong>Created At:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            <p><strong>Address:</strong> {formatAddress(selectedOrder.address)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
