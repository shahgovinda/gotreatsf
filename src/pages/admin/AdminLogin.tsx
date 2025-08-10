import React, { useState, useRef, useEffect } from "react";
import { Input, InputOtp } from "@heroui/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

import { auth } from "@/config/firebaseConfig";
import { getUserFromDb, handleLogout } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/Button";
import { Phone } from "lucide-react";

/* ------------------------------------------------------------------ */
/* -- tell TS about the singleton verifier on window ---------------- */
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}
/* ------------------------------------------------------------------ */

const AdminLogin: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const setUser = useAuthStore((s) => s.setUser);
  const setUserDetails = useAuthStore((s) => s.setUserDetails);
  const navigate = useNavigate();

  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (confirmationResult && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [confirmationResult]);

  /* ----------------------- send OTP ------------------------------- */
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
          { size: "invisible" }
        );
        await window.recaptchaVerifier.render();
      }

      const result = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        window.recaptchaVerifier
      );
      setConfirmationResult(result);
      toast.success("OTP sent successfully!");
    } catch (err) {
      console.error("[sendOtp]", err);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------- verify OTP ------------------------------ */
  const handleVerifyOtp = async () => {
    if (!confirmationResult) {
      toast.error("Please request OTP first");
      return;
    }
    
    if (otp.length !== 6) {
        toast.error("Invalid OTP format. Please enter 6 digits.");
        return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;

      const userDetails = await getUserFromDb(firebaseUser.uid);
      if (!userDetails) {
        toast.error("No admin account found for this number.");
        await handleLogout();
        setLoading(false);
        return;
      }

      if (userDetails.role !== "admin") {
        toast.error("You are not authorized as an admin.");
        await handleLogout();
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      setUserDetails(userDetails);

      toast.success("Admin logged in successfully!");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("[verifyOtp]", err);
      setError("Invalid OTP");
      toast.error("The OTP you entered is incorrect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------- UI -------------------------------- */
  return (
    <div className="h-svh flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-gray-800 shadow-2xl">
        {/* brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-orange-500">admin.</span>
            <span className="text-green-500">go</span>treats
            <span className="text-orange-500">.in</span>
          </h1>
          <p className="text-gray-400 mt-2">Secure Admin Login</p>
        </div>

        {/* Conditional rendering for phone or OTP form */}
        {!confirmationResult ? (
          <>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendOtp();
                }
              }}
              label="Admin Number"
              placeholder="Enter phone number"
              variant="faded"
              labelPlacement="outside"
              maxLength={10}
              isInvalid={!!error}
              errorMessage={error}
              startContent={
                <div className="flex items-center gap-1 text-gray-400">
                  <Phone size={16} />
                  <span className="text-sm font-medium">+91</span>
                </div>
              }
              className="w-full"
            />
            <Button
              onClick={handleSendOtp}
              className="mt-6 w-full py-3 text-lg font-semibold"
              isLoading={loading}
              variant="primary"
            >
              Send OTP
            </Button>
          </>
        ) : (
          /* otp input */
          <div className="mt-6">
            <p className="text-sm text-gray-400 mb-4">
              An OTP has been sent to +91{phone}
            </p>
            <InputOtp
              value={otp}
              onValueChange={(val) => {
                setOtp(val);
                if (val.length === 6) {
                  handleVerifyOtp(); // Auto-submit on completion
                }
              }}
              length={6}
              variant="faded"
              isInvalid={!!error}
              errorMessage={error}
              autoFocus
              ref={otpInputRef}
              className="flex justify-center mb-6"
              onPaste={async (e) => {
                e.preventDefault();
                const pasteData = e.clipboardData.getData('text').slice(0, 6);
                setOtp(pasteData);
                if (pasteData.length === 6) {
                    // Give a moment for state to update, then submit
                    setTimeout(() => handleVerifyOtp(), 100);
                }
              }}
            />
            <Button
              onClick={handleVerifyOtp}
              className="mt-6 w-full py-3 text-lg font-semibold"
              isLoading={loading}
              variant="primary"
            >
              Verify OTP
            </Button>
            <button
              onClick={() => {
                setConfirmationResult(null);
                setOtp("");
                setError("");
              }}
              className="mt-4 w-full text-center text-sm text-gray-400 hover:text-orange-500 transition-colors"
            >
              Change number?
            </button>
          </div>
        )}
      </div>

      {/* recaptcha placeholder */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default AdminLogin;
