import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, IndianRupee, Users, Utensils, HeartHandshake, Smile } from "lucide-react";

// The main component for the page, renamed to About
const About = () => {
  // Scrolls to the top on component load
  useEffect(() => window.scrollTo(0, 0), []);

  // NOTE: We cannot use the direct image URL from a previous generation in a new file block, 
  // so I am using a high-quality placeholder. Replace this with your actual image URL 
  // of the young chef holding the thali once you host it.
  const HERO_IMAGE_URL = "https://placehold.co/400x400/84cc16/ffffff?text=CHEF+AND+THALI";

  // New, refined content for the catering services
  const services = [
    {
      title: "Signature Event Catering",
      description: "Flawless full-service catering for weddings, large corporate gatherings, and grand celebrations. Custom menus, professional serving staff, and complete setup.",
      icon: <HeartHandshake size={24} className="text-white" />,
      imageUrl: "https://placehold.co/600x400/10b981/ffffff?text=Grand+Celebration+Catering",
    },
    {
      title: "Corporate & Bulk Orders",
      description: "Reliable and fast delivery of hot, hygienic meals for office meetings, team lunches, and industrial events. Special volume pricing for 50+ guests.",
      icon: <Users size={24} className="text-white" />,
      imageUrl: "https://placehold.co/600x400/f97316/ffffff?text=Corporate+Bulk+Order",
    },
    {
      title: "Birthday & Private Parties",
      description: "The perfect flexible menu solution for intimate family dinners and lively birthday parties. Choose from customizable Indian, Continental, and Fusion packages.",
      icon: <Smile size={24} className="text-white" />,
      imageUrl: "https://placehold.co/600x400/34d399/ffffff?text=Birthday+Party+Food",
    },
    {
      title: "Exciting Live Food Counters",
      description: "Elevate your event with live cooking stations! Offer fresh, hot Pav Bhaji, Biryani, Chaat, or Dosa, prepared instantly by our chefs on-site for a dynamic experience.",
      icon: <Utensils size={24} className="text-white" />,
      imageUrl: "https://placehold.co/600x400/ef4444/ffffff?text=Live+Chaat+Counter",
    },
    {
      title: "Affordable Pricing",
      description: "Menus starting from just ₹150 per person for veg and ₹180 for non-veg. We provide transparent pricing with no hidden costs to perfectly suit your budget.",
      icon: <IndianRupee size={24} className="text-white" />,
      imageUrl: "https://placehold.co/600x400/f59e0b/ffffff?text=Affordable+Pricing+Plan",
    },
    {
      title: "Wide Service Areas (Mumbai)",
      description: "We proudly cater across all major Mumbai suburbs, including Borivali, Kandivali, Malad, Andheri, and extend our services to all nearby suburbs for convenience.",
      icon: <MapPin size={24} className="text-white" />,
      imageUrl: "https://placehold.co/600x400/9ca3af/ffffff?text=Mumbai+Service+Area",
    },
  ];

  const FeatureCard = ({ title, description, icon, imageUrl, index }) => (
    <motion.div
      className="flex flex-col overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-b-4 border-green-500/80"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/10b981/ffffff?text=Food+Service"; }}
        />
        <div className="absolute inset-0 bg-green-900/10 backdrop-brightness-75"></div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-green-600 rounded-full shadow-lg">
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {title}
          </h2>
        </div>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-lime-50 to-green-100 pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            className="text-center md:text-left space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl sm:text-6xl font-extrabold text-green-800 leading-tight">
              <span className="block text-green-600">Taste the Excellence.</span>
              Professional Catering Services in Mumbai.
            </h1>
            <p className="text-xl text-gray-700 max-w-xl md:max-w-none">
              GoTreats is your trusted partner for premium event catering. Experience freshly cooked, hygienic, and delicious meals served with unmatched professionalism for any occasion.
            </p>
            <a href="#services">
              <button className="mt-6 px-10 py-4 text-xl font-semibold text-white rounded-full bg-gradient-to-r from-green-500 to-green-700 shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 transform hover:-translate-y-1">
                Explore Our Services →
              </button>
            </a>
          </motion.div>

          {/* Image */}
          <motion.div
            className="relative flex justify-center md:justify-end"
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={HERO_IMAGE_URL}
                alt="Young chef holding a traditional Indian Thali with Roti, Sabji, Dal, Rice, Salad, and Gulab Jamun"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x400/84cc16/ffffff?text=Chef+Holding+Thali"; }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Services Grid Section */}
      <section id="services" className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.h2
            className="text-4xl font-extrabold text-gray-800 mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            A Solution for Every Event
          </motion.h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Our specialized catering features are designed to meet all your needs, ensuring a memorable and stress-free event every time.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((item, idx) => (
              <FeatureCard key={idx} {...item} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <div className="bg-green-700 py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <motion.h3
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Plan Your Next Event Effortlessly
          </motion.h3>
          <p className="text-xl text-green-100 mb-8">
            Get a personalized, obligation-free catering quote tailored to your guest count and menu preferences today!
          </p>
          <a href="#"> {/* Placeholder for contact/quote page */}
            <motion.button
              className="px-12 py-4 text-xl font-bold rounded-full text-green-900 bg-white shadow-2xl ring-4 ring-green-400 hover:ring-green-300 hover:scale-[1.03] transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Request a Free Quote Now
            </motion.button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
