import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input
} from "@heroui/react";

import Button from '@/components/Button'
import { Voucher, VoucherScope, VoucherDiscountType } from '@/types/voucherTypes'
import { BadgeIndianRupee, BadgePercent, Earth, IndianRupee, Percent, TicketPercent, UserRound, UserRoundPlus, UsersRound } from 'lucide-react'
import React, { useEffect } from 'react'
import { getVoucherByCode, validateVoucher } from "@/services/voucherService";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const VoucherModal = (
    {
        isOpen,
        onOpenChange,
        onOpen,
        onValidVoucher,
        onOpenVoucherAppliedModal
    }: {
        isOpen: boolean,
        onOpenChange: () => void,
        onOpen: () => void,
        onOpenVoucherAppliedModal: () => void,
        onValidVoucher: (voucher: Voucher) => void
    }
) => {

    const { grossTotalPrice, totalPrice, calculateGrossTotalPrice, calculateTotalPrice, } = useCartStore()

    const userDetails = useAuthStore((state) => state.userDetails)
    const [code, setCode] = React.useState('TASTY23');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [voucher, setVoucher] = React.useState<Voucher | null>(null);


    const handleCheckVoucher = async () => {
        setVoucher(null);
        setLoading(true);
        setError('');

        if (!code.trim()) {
            setError('Please enter a voucher code');
            setLoading(false);
            return;
        }

        const voucher = await getVoucherByCode(code);
        if (voucher) {

            console.log('Voucher found:', voucher);
            setLoading(false);
            // onValidVoucher(voucher); 
        }
        if (!voucher) {
            setError('Voucher not found');
            console.log('Voucher not found');
            setLoading(false);
            return;

        }

        const validationError = validateVoucher(voucher, userDetails.phoneNumber, grossTotalPrice);
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        } else {
            setVoucher(voucher);
            // onValidVoucher(voucher);
            setLoading(false);
        }
    }



    useEffect(() => {
        if (!isOpen) {
            setVoucher(null);
            setCode('');
            setError('');
        }
    })


    return (
        <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange} size='lg' scrollBehavior='inside' backdrop='opaque' className="!bg-white">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center lancelot text-2xl gap-3"> <TicketPercent size={25} strokeWidth={1.6} />Apply Voucher</ModalHeader>
                        <ModalBody>
                            <p className="text-sm">Enter Voucher Code</p>
                            <Input
                                // label="Voucher Code"
                                labelPlacement="outside"
                                placeholder="EXAMPLEX20"
                                variant="bordered" size="lg"
                                required radius="full"
                                autoFocus autoCapitalize="on"
                                type="text" value={code} onChange={(e) => setCode(e.target.value.toLocaleUpperCase())}
                                className="font-bold relative "
                                startContent={<TicketPercent size={20} strokeWidth={1.6} />}
                                endContent={<button className=" absolute right-0.5 rounded-full px-4 text-white  py-2 bg-orange-600 hover:bg-orange-700"
                                    onClick={handleCheckVoucher}
                                    disabled={loading}
                                    style={{ opacity: loading ? 0.5 : 1 }}
                                >Check</button>}
                            />


                            <div>
                                {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
                                {
                                    voucher && (
                                        <>
                                            {!error && <p className="mt-2 text-center text-green-600">You are eligible for this voucher</p>}

                                            <div className="border-dashed border-2 border-orange-300 hover:border-green-500 rounded-xl p-4 mt-4 gap-y-2 flex flex-col ">
                                                <span className="px-4 py-1 self-center rounded-lg border items-center inline-flex gap-2  font-semibold bg-green-100 text-green-800 border-green-400 ">
                                                    {voucher.discountType === 'percentage' ? <BadgePercent size={20} strokeWidth={1.8} /> : <BadgeIndianRupee size={22} strokeWidth={1.8} />}
                                                    {voucher.code}
                                                </span>
                                                <p className="font-semibold text-center text-gray-800 text-lg"> {voucher.name}</p>
                                                <p className="text-sm text-gray-600">{`Use code "${voucher.code}" & get ${voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `₹${voucher.discountValue}`}  off on orders above ₹${voucher.minOrderValue}. `}</p>
                                                <p className="text-sm text-gray-800">Terms & Conditions</p>
                                                <ul className="list-disc list-inside text-xs text-gray-700">
                                                    {voucher.singleUsePerCustomer && <li>Offer is valid for one time use only.</li>}
                                                    <li>
                                                        Offer valid till {
                                                            (() => {
                                                                let expiry = voucher.expiryDate;
                                                                if (!expiry) return "N/A";
                                                                if (typeof (expiry as any).toDate === "function") {
                                                                    expiry = (expiry as any).toDate();
                                                                } else {
                                                                    expiry = new Date(expiry as any);
                                                                }
                                                                return expiry.toLocaleDateString('en-GB');
                                                            })()
                                                        }
                                                    </li>
                                                </ul>
                                                {
                                                    !error && (

                                                        <Button variant="success" onClick={() => {
                                                            onValidVoucher(voucher);
                                                            onClose();
                                                            onOpenVoucherAppliedModal();
                                                        }} 
                                                        className="w-full comfortaa font-bold  hover:shadow-lg transition-all duration-300 ease-in-out">
                                                            <TicketPercent size={25} strokeWidth={1.6} />Apply
                                                            <TicketPercent size={25} strokeWidth={1.6} />
                                                        </Button>
                                                    )
                                                }
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="secondary" className="w-full " onClick={onClose}>
                                Close
                            </Button>

                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default VoucherModal