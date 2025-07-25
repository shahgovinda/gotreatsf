import React, { useState } from "react";
import { Input, InputOtp } from "@heroui/react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import { useAuthStore } from "../store/authStore";
import Button from "@/components/Button";
import { getUserFromDb, saveNewUserToFirestore } from "@/services/authService";
import { Phone } from "lucide-react";

const Register = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
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
      setStep(2);
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

      // 👇 Since getUserFromDb returns `data()` or undefined, just check truthiness
      const userDetails = await getUserFromDb(user.uid);

      if (userDetails) {
        // 🔐 Existing user
        setUser(user);
        setUserDetails(userDetails);
        toast.success(`Welcome back, ${userDetails.displayName || 'there'}!`);
        navigate("/");
      } else {
        // New user
        console.log("[verifyOtp] New user detected. Moving to name/email input.");
        setStep(3);
      }
    } catch (err) {
      console.error("[verifyOtp]", err);
      setError("Invalid OTP");
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewUser = async () => {
    const { name, email } = formData;
    if (!name || !email) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      const newUser = {
        uid: user.uid,
        displayName: name,
        email,
        phoneNumber: user.phoneNumber,
        role: "customer",
        address: null,
        profileImage: '',
      };

      await saveNewUserToFirestore(newUser);
      setUser(user);
      setUserDetails(newUser);
      toast.success(`Account created! Welcome, ${name || 'there'}!`);
      navigate("/");
    } catch (err) {
      console.error("[saveNewUser]", err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-svh bg-gradient-to-br from-white via-orange-50 to-green-50 flex flex-col">
      {/* Animated Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 shadow-md border border-orange-100 hover:bg-orange-50 hover:scale-105 transition-all duration-200 group"
        style={{ fontFamily: 'inherit' }}
        aria-label="Go Back"
      >
        <svg className="w-5 h-5 text-orange-500 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        <span className="font-semibold text-orange-600 group-hover:text-orange-700 text-base">Back</span>
      </button>
      <div className="md:grid grid-cols-2 h-full px-7 md:px-0">
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="w-full flex flex-col items-center justify-center animate-fadeInUp">
          {/* Step 1: Phone Number Input */}
          {step === 1 && (
              <div className="md:w-96 w-full bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-orange-100 animate-fadeInUp">
                <p className="text-3xl font-extrabold mb-2 flex items-center gap-2 lancelot tracking-tight text-gray-900">
                  Welcome to
                  <span onClick={() => navigate('/')} className="cursor-pointer ml-2">
                    <span className='comfortaa font-bold tracking-tighter text-3xl text-orange-600'><span className='text-green-500'>go</span>treats</span>
                  </span>
                </p>
                {/* Custom Phone Number Input */}
                <div className="w-full">
                  <label className="block text-sm font-semibold text-orange-500 mb-1 ml-1">
                    Phone Number<span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border-2 border-orange-200 focus-within:border-orange-400 rounded-xl bg-white/80 px-3 py-2 transition-all">
                    <Phone size={18} className="text-gray-500 mr-2" />
                    <span className="text-gray-500 mr-2">+91</span>
                    <input
                      type="tel"
                value={phone}
                      onChange={e => setPhone(e.target.value)}
                      maxLength={10}
                placeholder="Enter Phone Number"
                      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-lg"
                      autoFocus
                      required
                    />
                  </div>
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSendOtp}
                  className="mt-2 w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-full shadow-lg hover:from-orange-600 hover:to-orange-500 hover:scale-105 transition-all duration-200"
                isLoading={loading}
              >
                Send OTP
              </Button>
                <p className="text-xs text-gray-600 mt-2 text-center">By Clicking "Send OTP", you agree to our <Link to="/terms-and-conditions" className="text-orange-600 hover:underline font-semibold">Terms and Conditions</Link> and <Link to="/privacy-policy" className="text-orange-600 hover:underline font-semibold">Privacy Policy</Link></p>
            </div>
          )}

          {/* Step 2: OTP Input */}
          {step === 2 && (
              <div className="md:w-96 w-full bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-orange-100 animate-fadeInUp">
                <p className="text-3xl font-extrabold mb-2 lancelot tracking-tight text-gray-900">Enter OTP</p>
                <p className="text-sm text-gray-600 mb-2 text-center">We have sent an OTP to your Phone Number <span className="font-semibold text-orange-600">+91{phone}</span></p>
                {/* Custom OTP Input UI */}
                <div className="flex gap-2 w-full justify-center">
                  {[...Array(6)].map((_, idx) => (
                    <input
                      key={idx}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[idx] || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (!val) return;
                        const otpArr = otp.split('');
                        otpArr[idx] = val;
                        setOtp(otpArr.join('').slice(0, 6));
                        // Move to next input
                        const next = document.getElementById(`otp-input-${idx + 1}`);
                        if (next) next.focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Backspace') {
                          const otpArr = otp.split('');
                          otpArr[idx] = '';
                          setOtp(otpArr.join(''));
                          if (idx > 0) {
                            const prev = document.getElementById(`otp-input-${idx - 1}`);
                            if (prev) prev.focus();
                          }
                        }
                      }}
                      id={`otp-input-${idx}`}
                      className="w-12 h-12 md:w-14 md:h-14 text-2xl text-center rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white shadow-sm transition-all outline-none"
                      style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                      autoFocus={idx === 0}
                      aria-label={`OTP digit ${idx + 1}`}
              />
                  ))}
                </div>
              <Button
                variant="primary"
                onClick={handleVerifyOtp}
                  className="mt-2 w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-full shadow-lg hover:from-orange-600 hover:to-orange-500 hover:scale-105 transition-all duration-200"
                isLoading={loading}
              >
                Verify OTP
              </Button>
            </div>
          )}

          {/* Step 3: Name and Email Input for New Users */}
          {step === 3 && (
              <div className="md:w-96 w-full bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-orange-100 animate-fadeInUp">
                <p className="text-3xl font-extrabold mb-2 lancelot tracking-tight text-gray-900">Enter Details</p>
                <Input
                  label="Enter Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  size="md"
                  autoFocus
                  variant="underlined"
                  isRequired
                  className="rounded-xl border-2 border-orange-200 focus-within:border-orange-400 transition-all"
                />
                <Input
                  label="Current Number"
                  value={phone}
                  disabled
                  size="md"
                  variant="underlined"
                  className="rounded-xl border-2 border-orange-200 focus-within:border-orange-400 transition-all"
                  isRequired
                />
                <Input
                  label="Enter Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  size="md"
                  variant="underlined"
                  type="email"
                  isRequired
                  className="rounded-xl border-2 border-orange-200 focus-within:border-orange-400 transition-all"
                />
              <Button
                variant="primary"
                onClick={handleSaveNewUser}
                  className="mt-2 w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-full shadow-lg hover:from-orange-600 hover:to-orange-500 hover:scale-105 transition-all duration-200"
                isLoading={loading}
              >
                Save and Create Account
              </Button>
            </div>
          )}
        </div>
        </div>
        <div className="bg-[url('/register.webp')] bg-cover bg-center bg-no-repeat h-full hidden lg:block rounded-l-3xl shadow-2xl animate-fadeInRight"></div>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Register;