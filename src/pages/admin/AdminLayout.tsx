import { Link, Navigate, Outlet } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import { BadgeIndianRupee, Banknote, HandCoins, Menu, UsersRound } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/drawer";
import { ToastProvider, useDisclosure } from "@heroui/react";
import { Box, Calendar, Home, Inbox, MessageCircleMore, Salad, Search, Settings, TicketPercent } from "lucide-react"
import { handleLogout } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import { BrandLogo } from '@/components/Navbar';
import { useEffect } from 'react';
import { requestForToken, requestNotificationPermision } from '@/utils/fwc';
import { doc, setDoc } from 'firebase/firestore';
import { db, messaging } from '@/config/firebaseConfig';
import { onMessage } from 'firebase/messaging';



const AdminLayout = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, userDetails } = useAuthStore()


    const items = [
        {
            title: "Orders",
            url: "/view-all-orders",
            icon: Box,
        },
        {
            title: "Items",
            url: "/view-all-products",
            icon: Salad,
        },
        {
            title: "Reviews",
            url: "/manage-reviews",
            icon: MessageCircleMore,
        },
        {
            title: "Vouchers",
            url: "/manage-vouchers",
            icon: TicketPercent,
        },
        {
            title: "Collections",
            url: "/collections",
            icon: Banknote,
        },
        {
            title: "Customers",
            url: "/customers",
            icon: UsersRound,
        },
        {
            title: "Payments",
            url: "/payments",
            icon: BadgeIndianRupee,
        },


    ]

    const handleLogoutClick = async () => {
        try {
            await handleLogout();
            toast.success('Logged out successfully');
           <Navigate to="/" />
        } catch (error) {
            toast.error('Failed to logout. Please try again.');
        }
    };

    useEffect(() => {
        if (userDetails?.role === "admin") {
            requestForToken().then(token => {
                if (token) {
                    // Save admin's FCM token to Firestore
                    setDoc(doc(db, "adminTokens", userDetails.uid), { token }, { merge: true });
                }
            });
        }
    }, [userDetails]);

    useEffect(() => {
        if (location.pathname === '/') {
            requestNotificationPermision();
        }
    }, [location.pathname])

    useEffect(() => {
        const unsubscribe = onMessage(messaging, (payload) => {
            // Show a notification using the Notification API
            if (Notification.permission === "granted") {
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: "/favicon.png"
                });
            }
        });
        return unsubscribe;
    }, []);
    return (

        <div className='flex' >

            <div className='w-12 space-y-4 pt-5 px-1 bg-white  hidden md:block md:fixed'>
                <button
                    className='p-2 rounded-md  bg-green-500  text-white hover:bg-orange-500'
                    onClick={(event) => {
                        event.stopPropagation()
                        onOpen()
                    }}>
                    <Menu />
                </button>
                {items.map((item) => (
                    <Link to={item.url} key={item.title} className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md" onClick={onClose}>
                        <item.icon size={25} strokeWidth={1.5} />
                    </Link>
                ))}
            </div>
            <main className="flex-1 md:ml-12 p-5 min-h-screen bg-black/90  md:flex items-start overflow-x-hidden ">
                <button
                    className='p-2 rounded-md md:hidden fixed bg-green-500  text-white hover:bg-orange-500'
                    onClick={(event) => {
                        event.stopPropagation()
                        onOpen()
                    }}>
                    <Menu />
                </button>

                <Outlet />

                {/* <Toaster /> */}

                {/* <div className='hidden md:block'>
                    <ToastProvider
                        placement="bottom-left"
                        toastProps={{
                            variant: "flat",
                        }} />
                </div> */}
                {/* <div className='block md:hidden'>
                    <ToastProvider
                        placement="top-right"
                        toastProps={{
                            variant: "flat",
                        }} />
                </div> */}
            </main>

          <Drawer
  isOpen={isOpen}
  placement="left"
  onOpenChange={onClose}
  className="max-w-[200px]"
>
  <DrawerContent className="bg-white">
    <DrawerHeader>
      <BrandLogo />
    </DrawerHeader>
    <DrawerBody>
      {items.map((item) => (
        <Link
          to={item.url}
          key={item.title}
          className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md"
          onClick={onClose}
        >
          <item.icon size={20} strokeWidth={1.5} />
          <span className="text-lg">{item.title}</span>
        </Link>
      ))}
    </DrawerBody>
    <DrawerFooter className="flex flex-col items-start">
      <button
        className="p-2 rounded-md bg-blue-500 text-white mb-4"
        onClick={() => {
          if (Notification.permission === "granted") {
            new Notification("Cool! You Got The Notification", {
              body: "This is a test notification.",
              icon: "/favicon.png",
            });
          } else {
            alert("Please allow notifications in your settings.");
          }
        }}
      >
        Test Notification
      </button>
      <div className="p-2">
        <h2 className="font-bold text-xl">{userDetails?.displayName}</h2>
        <p className="text-sm text-gray-500">{userDetails?.email}</p>
        <p className="text-sm text-gray-500">{userDetails?.phoneNumber}</p>
        <Button variant="danger" onClick={handleLogoutClick}>
          Logout
        </Button>
      </div>
    </DrawerFooter>
  </DrawerContent>
</Drawer>


        </div>
    );
};

export default AdminLayout;
