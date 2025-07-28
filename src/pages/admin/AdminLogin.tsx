import React, { useState } from "react";
import { Input, InputOtp } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

import { useAuthStore } from "@/store/authStore";
import Button from "@/components/Button";
import {
    getUserFromDb,
    handleLogout,
    saveNewUserToFirestore,
} from "@/services/authService";
import { Phone } from "lucide-react";
import { auth } from "@/config/firebaseConfig";

// ✅ Fix TypeScript error for window.recaptchaVerifier
declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
    }
}

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
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(
                    auth,
                    "recaptcha-container",
                    {
                        size: "invisible",
                    }
                );
            }

            const result = await signInWithPhoneNumber(
                auth,
                `+91${phone}`,
                window.recaptchaVerifier
            );
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

            const userDetails = await getUserFromDb(user.uid);

            if (userDetails) {
                if (userDetails.role !== "admin") {
                    toast.error("You are not authorized as admin.");
                    await handleLogout();
                    setUser(null);
                    setUserDetails(null);
                    setLoading(false);
                    return;
                }

                setUser(user);
                setUserDetails(userDetails);
                toast.success("Admin Logged In");
                navigate("/");
            } else {
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
        <div className="h-svh bg-neutral-700 text-white">
            <div className="text-white h-full flex items-center justify-center">
                <div className="w-full m-4 md:w-1/3 rounded-4xl p-10">
                    {/* Branding */}
                    <div className="cursor-pointer flex justify-center mb-20">
                        <p className="comfortaa flex items-end font-bold tracking-tighter text-2xl lg:text-3xl text-orange-600">
                            <p className="text-white text-sm">admin .</p>
                            <span className="text-green-500">go</span>treats
                            <p className="text-white text-sm"> . in</p>
                        </p>
                    </div>

                    {/* Phone Input */}
                    <div className="dark">
                        <Input
                            type="tel"
                            autoFocus
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            label="Admin Number"
                            placeholder="Enter Phone Number"
                            variant="faded"
                            labelPlacement="outside"
                            size="lg"
                            isInvalid={error !== ""}
                            errorMessage={error}
                            isRequired
                            maxLength={10}
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

                    {/* OTP Input */}
                    {confirmationResult && (
                        <div className="dark flex flex-col items-center justify-center mt-6">
                            <p>Enter OTP</p>
                            <InputOtp
                                value={otp}
                                onValueChange={setOtp}
                                length={6}
                                variant="faded"
                                size="lg"
                                isInvalid={error !== ""}
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
                    )}
                </div>
            </div>
            <div id="recaptcha-container"></div>
        </div>
    );
};

export default AdminLogin;
