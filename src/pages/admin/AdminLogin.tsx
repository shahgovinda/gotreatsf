import React, { useState } from "react";
import { Input } from "@heroui/react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { getUserFromDb } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

const AdminLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!phone) {
      toast.error("Please enter phone number");
      return;
    }

    try {
      const appVerifier = new RecaptchaVerifier("recaptcha-container", {
        size: "invisible",
        callback: (response: any) => {
          // reCAPTCHA solved
        },
      }, auth);

      await appVerifier.render();

      const result = await signInWithPhoneNumber(auth, "+91" + phone, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success("OTP sent to " + phone);
    } catch (error) {
      console.error("OTP error:", error);
      toast.error("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    if (!otp || !confirmationResult) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      console.log("Signed in UID:", user.uid);

      const userDetails = await getUserFromDb(user.uid);
      console.log("Fetched userDetails:", userDetails);

      if (!userDetails || userDetails.role !== "admin") {
        toast.error("Access denied: You are not an admin");
        return;
      }

      setUser({
        uid: user.uid,
        phone: user.phoneNumber ?? "",
        role: userDetails.role,
      });

      toast.success("Welcome Admin!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("OTP Verification Error:", error);
      toast.error("Invalid OTP or verification failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Admin Login
        </h2>
        <div className="mb-4">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {otpSent && (
          <div className="mb-4">
            <Input
              label="OTP"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        )}

        {!otpSent ? (
          <button
            onClick={sendOtp}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Send OTP
          </button>
        ) : (
          <button
            onClick={verifyOtp}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Verify OTP
          </button>
        )}

        <div id="recaptcha-container"></div>

        <p className="text-sm mt-4 text-center text-gray-600 dark:text-gray-400">
          Not an admin? <Link to="/" className="text-blue-500">Go back</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
