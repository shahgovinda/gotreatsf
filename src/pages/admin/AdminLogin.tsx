import React, { useState } from "react";
import { Input, InputOtp } from "@heroui/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

import { auth } from "@/config/firebaseConfig";          // ✅ keep this path
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

  const setUser          = useAuthStore((s) => s.setUser);
  const setUserDetails   = useAuthStore((s) => s.setUserDetails);
  const navigate         = useNavigate();

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
          auth,                        // ✅ first param must be Auth
          "recaptcha-container",       // ✅ second param container‑id
          { size: "invisible" }
        );
        await window.recaptchaVerifier.render(); // ensure it mounts
      }

      const result = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        window.recaptchaVerifier
      );
      setConfirmationResult(result);
      toast.success("OTP sent");
    } catch (err) {
      console.error("[sendOtp]", err);
      toast.error("Failed to send OTP");
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
        toast.error("You are not authorized as admin.");
        await handleLogout();
        setLoading(false);
        return;
      }

      // ✅ update zustand store
      setUser(firebaseUser);          // store full Firebase User object
      setUserDetails(userDetails);

      toast.success("Admin logged in");
      navigate("/admin/dashboard");   // adjust route to your admin page
    } catch (err) {
      console.error("[verifyOtp]", err);
      setError("Invalid OTP");
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------- UI -------------------------------- */
  return (
    <div className="h-svh flex items-center justify-center bg-neutral-800 text-white">
      <div className="w-full max-w-md p-8 rounded-xl bg-neutral-700">
        {/* brand */}
        <h1 className="text-center text-3xl font-bold mb-8">
          <span className="text-orange-500">admin.</span>
          <span className="text-green-500">go</span>treats
          <span className="text-orange-500">.in</span>
        </h1>

        {/* phone input */}
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          label="Admin Number"
          placeholder="Enter phone number"
          variant="faded"
          labelPlacement="outside"
          maxLength={10}
          isInvalid={!!error}
          errorMessage={error}
          startContent={
            <div className="flex items-center gap-1 text-white">
              <Phone size={16} />
              <span>+91</span>
            </div>
          }
        />
        <Button
          onClick={handleSendOtp}
          className="mt-4 w-full"
          isLoading={loading}
          variant="primary"
        >
          Send OTP
        </Button>

        {/* otp input */}
        {confirmationResult && (
          <div className="mt-6">
            <InputOtp
              value={otp}
              onValueChange={setOtp}
              length={6}
              variant="faded"
              isInvalid={!!error}
              errorMessage={error}
            />
            <Button
              onClick={handleVerifyOtp}
              className="mt-4 w-full"
              isLoading={loading}
              variant="primary"
            >
              Verify OTP
            </Button>
          </div>
        )}
      </div>

      {/* recaptcha placeholder */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default AdminLogin;
