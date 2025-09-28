import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, IndianRupee, Users, Utensils } from "lucide-react";

const About = () => {
  useEffect(() => window.scrollTo(0, 0), []);

  const catering = [
    {
      title: "Service Areas",
      desc: "We proudly serve across Mumbai including Borivali, Kandivali, Dahisar, Malad, and nearby suburbs. Catering for homes, offices, weddings, and events.",
      icon: <MapPin size={40} className="text-green-600" />,
    },
    {
      title: "Affordable Pricing",
      desc: "Starting from just ₹150 per person for veg menus and ₹180 per person for non-veg menus. Customizable packages available to suit your budget.",
      icon: <IndianRupee size={40} className="text-orange-500" />,
    },
    {
      title: "Bulk Orders",
      desc: "We specialize in handling bulk orders for corporate functions, birthday parties, weddings, and community events – no limit on the number of guests.",
      icon: <Users size={40} className="text-green-500" />,
    },
    {
      title: "Live Catering Experience",
      desc: "Enjoy a live food counter at your event – Veg Biryani, Non-veg Biryani, Pav Bhaji, Pulao, served hot.",
      icon: <Utensils size={40} className="text-orange-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-lime-50 to-green-100 p-6 sm:p-12">
      <div className="max-w-6xl mx-auto text-center space-y-12">
        {/* Heading */}
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-green-800"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Professional Catering Services
        </motion.h1>

        <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
          GoTreats brings you a complete catering solution – from intimate gatherings 
          to grand celebrations. Freshly cooked, hygienic, and served with love.
        </p>

        {/* Services Section */}
        <div className="grid md:grid-cols-2 gap-10 mt-12 text-left">
          {catering.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border-l-4 border-green-500 p-6 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div>{item.icon}</div>
                <div>
                  <h2 className="text-xl font-semibold text-green-700 mb-1">
                    {item.title}
                  </h2>
                  <p className="text-gray-700">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12">
          <p className="text-lg font-medium text-green-800 mb-4">
            Ready to book your next event with us?
          </p>
          <a href="/contact">
            <button className="px-8 py-3 text-lg font-semibold text-white rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-md hover:shadow-xl hover:scale-105 transition duration-300">
              Get a Catering Quot →
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
