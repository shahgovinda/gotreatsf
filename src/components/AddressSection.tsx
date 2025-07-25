import React, { useState, useEffect } from "react";
import { updateUserAddress, getUserFromDb } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import Button from "./Button";
import toast from "react-hot-toast";
import { Home, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddressFields {
    flatNumber?: string;
    buildingName?: string;
    streetAddress?: string;
    landmark?: string;
    area?: string;
    pincode?: string;
}

interface AddressSectionProps {
    uid: string;
}

const AddressSection: React.FC<AddressSectionProps> = ({ uid }) => {
    const [address, setAddress] = useState<AddressFields>({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const { userDetails, setUserDetails } = useAuthStore();

    const fetchAddress = async () => {
        if (!uid) return;
        try {
            const dbUserDetails = await getUserFromDb(uid);
            if (dbUserDetails?.address && typeof dbUserDetails.address === 'object') {
                setAddress(dbUserDetails.address);
                if (JSON.stringify(userDetails?.address) !== JSON.stringify(dbUserDetails.address)) {
                    setUserDetails({ ...userDetails, address: dbUserDetails.address });
                }
            } else {
                setIsEditing(true); // If no address, open editor
            }
        } catch (error) {
            console.error("Failed to fetch address:", error);
        }
    };
    
    const formatAddress = (addr: any): string => {
        if (!addr) return "";
        if (typeof addr === 'string') return addr;
        if (typeof addr === 'object') {
            return [
                addr.flatNumber,
                addr.buildingName,
                addr.streetAddress,
                addr.landmark,
                addr.area,
                addr.pincode
            ].filter(Boolean).join(', ');
        }
        return "";
    };
    
    useEffect(() => {
        if (uid) {
            fetchAddress();
        }
    }, [uid]);

    useEffect(() => {
        if (userDetails?.address && typeof userDetails.address === 'object') {
            setAddress(userDetails.address);
        }
    }, [userDetails?.address]);

    const handleSaveAddress = async () => {
        const requiredFields: (keyof AddressFields)[] = ['flatNumber', 'buildingName', 'streetAddress', 'area', 'pincode'];
        const missingField = requiredFields.find(field => !address[field]?.trim());

        if (missingField) {
            toast.error(`Please fill in all required fields. Missing: ${missingField}`);
            return;
        }

        try {
            setLoading(true);
            await updateUserAddress(uid, address);
            setUserDetails({ ...userDetails, address });
            toast.success("Address updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update address:", error);
            toast.error("Failed to save address. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (userDetails?.address && typeof userDetails.address === 'object') {
            setAddress(userDetails.address);
        }
    };
    
    const displayAddress = formatAddress(userDetails?.address);

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Delivery Information</h2>
                {!isEditing && displayAddress && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="!bg-[#2d014d] !text-white !font-semibold !rounded-full !shadow-md hover:!bg-[#4b206b] transition-colors border border-[#4b206b] px-5 py-2 flex items-center gap-2"
                    >
                        <span className="inline-flex items-center gap-1">
                            <Home size={16} className="text-white" /> Edit Address
                        </span>
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.div
                        key="editing"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden space-y-4"
                    >
                        <div>
                            <label className="text-sm font-medium text-gray-700">Flat/House Number*</label>
                            <input name="flatNumber" value={address.flatNumber || ''} onChange={handleInputChange} required className="w-full p-3 mt-1 rounded-lg border" placeholder="e.g., Flat 123, Shop 45" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Building/Society Name*</label>
                            <input name="buildingName" value={address.buildingName || ''} onChange={handleInputChange} required className="w-full p-3 mt-1 rounded-lg border" placeholder="e.g., Sunshine Apartments" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Street Address*</label>
                            <input name="streetAddress" value={address.streetAddress || ''} onChange={handleInputChange} required className="w-full p-3 mt-1 rounded-lg border" placeholder="e.g., MG Road, 4th Cross" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Landmark</label>
                            <input name="landmark" value={address.landmark || ''} onChange={handleInputChange} className="w-full p-3 mt-1 rounded-lg border" placeholder="e.g., Near Post Office" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Area*</label>
                            <input name="area" value={address.area || ''} onChange={handleInputChange} required className="w-full p-3 mt-1 rounded-lg border" placeholder="e.g., Borivali West" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Pincode*</label>
                            <input name="pincode" value={address.pincode || ''} onChange={handleInputChange} required className="w-full p-3 mt-1 rounded-lg border" placeholder="e.g., 400092" />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button onClick={handleCancelEdit} variant='secondary'>Cancel</Button>
                            <Button onClick={handleSaveAddress} disabled={loading} variant='primary'>{loading ? "Saving..." : "Save Address"}</Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="display"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {displayAddress ? (
                            <motion.div
                                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 group relative overflow-hidden address-animate-card"
                                whileHover={{ scale: 1.025, boxShadow: '0 8px 32px 0 rgba(34,197,94,0.10)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                {/* Animated gradient border */}
                                <span className="absolute inset-0 rounded-xl pointer-events-none border-2 border-transparent group-hover:border-primary-400 group-hover:animate-gradient-move transition-all duration-300" style={{zIndex:1}} />
                                {/* Animated Home icon */}
                                <motion.div
                                    className="z-10"
                                    whileHover={{ scale: 1.15, color: '#22c55e' }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <Home size={24} className="text-primary-500 mt-1 flex-shrink-0 transition-colors duration-300 group-hover:text-primary-400" />
                                </motion.div>
                                <p className="text-gray-700 whitespace-pre-wrap z-10 text-base sm:text-lg md:text-base lg:text-lg xl:text-xl leading-relaxed break-words">
                                    {displayAddress}
                                </p>
                                {/* Responsive, animated background gradient (subtle) */}
                                <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary-50/60 via-white/80 to-primary-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                            </motion.div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No address found. Please add your address to proceed.</p>
                                <Button onClick={() => setIsEditing(true)} variant="primary">Add Address</Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddressSection;