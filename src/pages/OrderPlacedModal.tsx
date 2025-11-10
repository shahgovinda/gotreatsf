import React, { useEffect, useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalBody,
    ModalFooter,
} from "@heroui/react";
import { motion } from 'framer-motion';
import { CircleCheck } from 'lucide-react';
import { useOrderPlacedModalStore } from '@/store/orderPlacedModalStore';

// Assuming you have a sound file in your public directory, e.g., 'public/order_success.mp3'
const orderSuccessSound = '/order_success.mp3';

const OrderPlacedModal = () => {
    const { isOpen, close } = useOrderPlacedModalStore();
    const [timer, setTimer] = useState(5);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        let timeout: NodeJS.Timeout | null = null;

        if (isOpen) {
            // Play the sound
            try {
                const audio = new Audio(orderSuccessSound);
                audio.play().catch(e => console.error("Error playing sound:", e));
            } catch (e) {
                console.error("Audio API not supported or failed to play:", e);
            }

            setTimer(5);
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            timeout = setTimeout(() => close(), 5000); // Changed to 5000 to sync with the 5-second timer
        }

        return () => {
            if (interval) clearInterval(interval);
            if (timeout) clearTimeout(timeout);
        };
    }, [isOpen, close]);

    return (
        <Modal isOpen={isOpen} placement="center" onOpenChange={close} size='lg' hideCloseButton shadow='none' className='relative' scrollBehavior='inside' backdrop='blur'>
            <ModalContent className='bg-green-500'>
                {() => (
                    <>
                        <ModalBody className='my-20 flex flex-col items-center gap-10'>
                            <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1, transition: { duration: 0.3, ease: "easeInOut", } }}
                            >
                                <CircleCheck size={90} strokeWidth={1.5} className='fill-green-700 stroke-white' />
                            </motion.span>
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeInOut", delay: 0.3 } }}
                            >
                                <p className='text-2xl font-bold text-white text-center'>Order Placed Successfully</p>
                            </motion.div>
                            <motion.p
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1, transition: { duration: 0.4, ease: "easeInOut", delay: 0.4 } }}
                                className='text-center text-white'>Thank you for your order! We’re preparing your delicious meal.</motion.p>
                        </ModalBody>
                        <ModalFooter className='overflow-hidden border-t border-white cursor-pointer transition-all duration-100 ease-in-out hover:bg-green-500' onClick={close}>
                            <p className='text-lg text-center text-white w-full font-black'>Wait ({timer})</p>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default OrderPlacedModal;
