import React, { useState } from "react";
import { Input, InputOtp } from "@heroui/react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

import { useAuthStore } from "@/store/authStore";
import Button from "@/components/Button";
import { getUserFromDb, handleLogout, saveNewUserToFirestore } from "@/services/authService";
import { Phone } from "lucide-react";
import { auth } from "@/config/firebaseConfig";

// Helper function to check if phone number is admin
const isAdminPhone = (phoneNumber: string): boolean => {
    const normalizedPhone = phoneNumber?.replace(/\s/g, '');
    const adminPhones = [
        "+917045617506",
        // Add more admin numbers here if needed
        // "+919876543210",
    ];
    return adminPhones.includes(normalizedPhone);
};

const AdminLogin = () => {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState<any>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const setUserDetails = useAuthStore((state) => state.setUserDetails);

    const handleSendOtp = async () => {
        if (!/^[6-9]\d{9}$/.test(phone)) {
            toast.error("Invalid phone number");
            setError("Invalid phone number");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
            });
            const result = await signInWithPhoneNumber(auth, `+91${phone}`, verifier);
            setConfirmationResult(result);
            toast.success("OTP sent");
        } catch (error) {
            console.error("[sendOtp]", error);
            toast.error("Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!confirmationResult) {
            toast.error("Please request OTP first");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const result = await confirmationResult.confirm(otp);
            const user = result.user;

            console.log("[AdminLogin] OTP verified, UID:", user.uid);
            console.log("[AdminLogin] Phone number from Firebase:", user.phoneNumber);

            let userDetails = await getUserFromDb(user.uid);
            console.log("[AdminLogin] User details from Firestore:", userDetails);

            // Normalize phone number for comparison (remove spaces, ensure +91 format)
            const normalizedPhone = user.phoneNumber?.replace(/\s/g, '');
            console.log("[AdminLogin] Normalized phone:", normalizedPhone);
            console.log("[AdminLogin] Is admin phone:", isAdminPhone(user.phoneNumber));

            // Auto-create admin user if not found and phone matches
            if (!userDetails && isAdminPhone(user.phoneNumber)) {
                console.log("[AdminLogin] Creating new admin user...");
                const newAdmin = {
                    uid: user.uid,
                    phoneNumber: user.phoneNumber,
                    role: "admin",
                    displayName: user.displayName || "Admin",
                    email: user.email || "",
                };
                await saveNewUserToFirestore(newAdmin);
                userDetails = await getUserFromDb(user.uid);
                console.log("[AdminLogin] New admin user created:", userDetails);
                toast.success("Admin account created!");
            }

            // Update existing user to admin if they have admin phone but wrong role
            if (userDetails && isAdminPhone(user.phoneNumber) && userDetails.role !== "admin") {
                console.log("[AdminLogin] Updating existing user to admin...");
                const updatedUser = {
                    ...userDetails,
                    role: "admin"
                };
                await saveNewUserToFirestore(updatedUser);

                // Wait a moment for Firestore to update
                await new Promise(res => setTimeout(res, 500));
                userDetails = await getUserFromDb(user.uid);

                if (!userDetails || userDetails.role !== "admin") {
                    // Try one more time after a short delay
                    await new Promise(res => setTimeout(res, 1000));
                    userDetails = await getUserFromDb(user.uid);
                }
                console.log("[AdminLogin] User updated to admin (after retry):", userDetails);
                toast.success("User role updated to admin!");
            }

            if (userDetails) {
                console.log("[AdminLogin] User role:", userDetails.role);
                if (userDetails.role !== "admin") {
                    console.log("[AdminLogin] User is not admin, denying access");
                    toast.error("You are not authorized as admin.");
                    await handleLogout();
                    setUser(null);
                    setUserDetails(null);
                    setLoading(false);
                    return;
                }
                // 🔐 Existing admin user
                console.log("[AdminLogin] Admin login successful");
                setUser(user);
                setUserDetails(userDetails);
                toast.success("Admin Logged In");
                navigate("/dashboard");
            } else {
                // New user but not admin
                console.log("[AdminLogin] No user found and not admin number");
                toast.error("No admin account found for this number.");
                await handleLogout();
                setUser(null);
                setUserDetails(null);
            }
        } catch (err) {
            console.error("[verifyOtp]", err);
            setError("Invalid OTP");
            toast.error("Invalid OTP");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="h-svh bg-neutral-700 text-white ">

            <div className="text-white h-full flex items-center justify-center">

                <div className=" w-full m-4 md:w-1/3  rounded-4xl p-10 ">
                    {/* <h1 className="text-3xl font-bold text-center pb-8">Admin Login</h1> */}

                    <div className="cursor-pointer flex justify-center mb-20">
                        <p className='comfortaa flex items-end font-bold tracking-tighter text-2xl lg:text-3xl text-orange-600'>
                            <p className='text-white text-sm'>admin .</p><span className='text-green-500'>go</span>treats <p className='text-white  text-sm'> . in</p>
                        </p>
                    </div>

                    <div className="dark   ">
                        <Input
                            type="tel" autoFocus
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            label="Admin Number"
                            placeholder="Enter Phone Number"
                            variant="faded"
                            labelPlacement="outside"
                            size="lg" isInvalid={error !== ""}
                            errorMessage={error}
                            isRequired maxLength={10}
                            startContent={
                                <div className="flex items-center gap-2 text-white">
                                    <Phone size={16} />|<p>+91</p>
                                </div>
                            }
                        />
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleSendOtp}
                            className="mt-4 w-full"
                            isLoading={loading}
                        >
                            Send OTP
                        </Button>
                    </div>


                    {confirmationResult &&

                        <div className="dark flex flex-col items-center  justify-center">
                            <p>Enter OTP</p>
                            <InputOtp
                                value={otp}
                                onValueChange={setOtp}
                                length={6}
                                variant="faded"
                                size="lg" isInvalid={error !== ""}
                                errorMessage={error}
                                autoFocus
                            />
                            <Button
                                variant="primary"
                                onClick={handleVerifyOtp}
                                className="mt-4 w-full"
                                isLoading={loading}

                            >
                                Verify OTP
                            </Button>
                        </div>
                    }

                </div>

            </div>
            <div id="recaptcha-container"></div>
        </div>
    );
};

export default AdminLogin;
