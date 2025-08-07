import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { motion, Variants } from "framer-motion";
import {
  UserPlus,
  LogIn,
  ShoppingCart,
  CreditCard,
  Truck,
  ArrowRight,
  ArrowDown,
  Volume2,
  VolumeX,
} from "lucide-react";

const Concept = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const headingVariants: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const wordVariants: Variants = {
    initial: { backgroundPosition: "0% 50%" },
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: { duration: 3, repeat: Infinity, ease: "linear" },
    },
  };

  const steps = [
    { icon: <UserPlus size={28} />, title: "Register", desc: "Create an account" },
    { icon: <LogIn size={28} />, title: "Login", desc: "Log into your account" },
    { icon: <ShoppingCart size={28} />, title: "Select Meal", desc: "Choose your meal" },
    { icon: <CreditCard size={28} />, title: "Payment", desc: "Securely checkout" },
    { icon: <Truck size={28} />, title: "Delivery", desc: "Get it at your doorstep" },
  ];

  useEffect(() => window.scrollTo(0, 0), []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-lime-50 to-green-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto text-center space-y-8">
        <motion.div
          className="text-center mb-8"
          initial="initial"
          animate="animate"
          variants={headingVariants}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold">
            Our{" "}
            <motion.span className="text-orange-500 relative inline-block">
              Concept
              <motion.div
                className="absolute left-0 right-0 h-1 bg-orange-500 -bottom-4"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.6, delay: 0.5 }}
              />
            </motion.span>
          </h1>
        </motion.div>

        <p className="text-lg text-gray-700">
          At GoTreats, we deliver homemade meals that are fresh, healthy, and affordable – crafted with love and served with care.
        </p>

        {/* ✅ Updated Video Section (Zomato-like) */}
        <div className="w-full flex justify-center my-8 px-4">
          <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-lg group">
            {/* Fallback image */}
            <img
              src="/gotreats.png"
              alt="GoTreats Video Fallback"
              className="absolute w-full h-full object-cover z-0"
              loading="lazy"
            />

            {/* Video */}
            <video
              ref={videoRef}
              className="absolute w-full h-full object-cover z-10"
              autoPlay
              loop
              muted
              playsInline
              onError={(e) => {
                const video = e.currentTarget;
                video.style.display = "none";
              }}
            >
              <source src="/gotreats.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Mute/Unmute Button */}
            <button
              onClick={toggleMute}
              className="absolute bottom-3 right-3 bg-black/60 text-white p-2 rounded-full z-20 hover:bg-black transition"
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 text-green-700">How It Works</h2>
        <p className="text-gray-700 mb-4">Just 5 steps to your meal!</p>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:flex-wrap">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <StepCard step={step} />
              {idx < steps.length - 1 && (
                <div className="text-orange-500">
                  <span className="hidden sm:inline">
                    <ArrowRight size={24} />
                  </span>
                  <span className="sm:hidden">
                    <ArrowDown size={24} />
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <p className="mt-10 text-lg text-green-800 font-medium">
          GoTreats is not just a meal service – it's a lifestyle.
        </p>

        <Link to="/shop" className="inline-block mt-6 group">
          <Button
            variant="success"
            className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-green-600 relative overflow-hidden group transition-transform transform hover:scale-105 duration-500"
          >
            <span className="relative z-10">Start Ordering →</span>
            <span className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out z-0"></span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

const StepCard = ({
  step,
}: {
  step: { icon: React.ReactNode; title: string; desc: string };
}) => (
  <div className="bg-white border-2 border-green-600 rounded-lg shadow-md p-4 w-40 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:brightness-110">
    <div className="text-orange-500 mb-2">{step.icon}</div>
    <h3 className="font-semibold">{step.title}</h3>
    <p className="text-sm text-gray-600">{step.desc}</p>
  </div>
);

export default Concept;
