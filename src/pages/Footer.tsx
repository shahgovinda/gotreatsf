import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin, Mail, Phone, Clock, PartyPopper, Bike, Home, ShoppingBag, ScrollText, Lightbulb, Info, PhoneCall } from 'lucide-react';
import { BrandLogo } from '@/components/Navbar';

const Footer = () => {
  
  return (
    <footer className="bg-neutral-900 text-white mt-20 pt-12 pb-8  translate-y-5 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

          {/* Company Info */}
          <div>
            <BrandLogo/>
            <p className="text-gray-400 dark:text-gray-300 mt-4">
              Ghar ka khana just the way you want.
            </p>

            {/* Social Icons */}
            <div className="flex gap-6 mt-10 justify-center">
              {/* Instagram */}
              <div className="group relative cursor-pointer">
                <a
                  href="https://www.instagram.com/ig_govindashah/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    className="transition-all duration-300 hover:scale-125 lg:grayscale lg:group-hover:grayscale-0"
                  >
                    <defs>
                      <linearGradient id="instaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#feda75" />
                        <stop offset="30%" stopColor="#fa7e1e" />
                        <stop offset="60%" stopColor="#d62976" />
                        <stop offset="100%" stopColor="#4f5bd5" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5-.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z"
                      className="fill-[url(#instaGradient)] lg:fill-white lg:group-hover:fill-[url(#instaGradient)] transition-all duration-300"
                    />
                  </svg>
                </a>
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-1.5 text-sm font-semibold text-black shadow-md transition-all duration-300 ease-in-out group-hover:scale-100 lg:group-hover:scale-100 lg:hidden block">
                  Instagram
                </span>
                <span className="hidden lg:block absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-1.5 text-sm font-semibold text-black shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
                  Instagram
                </span>
              </div>

              {/* Google */}
              <div className="group relative cursor-pointer">
                <a
                  href="https://www.google.co.in/search?q=Go+Treats"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/google.svg"
                    width={26}
                    height={26}
                    className="transition-all duration-300 hover:scale-125 lg:grayscale lg:group-hover:grayscale-0"
                    alt="Google"
                  />
                </a>
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-1.5 text-sm font-semibold text-black shadow-md transition-all duration-300 ease-in-out group-hover:scale-100 lg:group-hover:scale-100 lg:hidden block">
                  Google
                </span>
                <span className="hidden lg:block absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-1.5 text-sm font-semibold text-black shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
                  Google
                </span>
              </div>

              {/* YouTube */}
              <div className="group relative cursor-pointer">
                <a
                  href="https://www.youtube.com/@govindashah4954"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    className="transition-all duration-300 hover:scale-125 lg:grayscale lg:group-hover:grayscale-0"
                  >
                    <path
                      fill="#FF0000"
                      className="lg:fill-white lg:group-hover:fill-red-600"
                      d="M21.8 8s-.2-1.5-.8-2.2c-.8-.9-1.7-.9-2.1-1C16.3 4.5 12 4.5 12 4.5h-.1s-4.3 0-6.9.3c-.4.1-1.3.1-2.1 1-.6.7-.8 2.2-.8 2.2S2 9.6 2 11.2v1.6c0 1.6.2 3.2.2 3.2s.2 1.5.8 2.2c.8.9 1.9.9 2.4 1 1.8.2 7.4.3 7.4.3s4.3 0 6.9-.3c.4-.1 1.3-.1 2.1-1 .6-.7.8-2.2.8-2.2s.2-1.6.2-3.2v-1.6c0-1.6-.2-3.2-.2-3.2zM9.7 14.7V9.3l5.4 2.7-5.4 2.7z"
                    />
                  </svg>
                </a>
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-1.5 text-sm font-semibold text-black shadow-md transition-all duration-300 ease-in-out group-hover:scale-100 lg:group-hover:scale-100 lg:hidden block">
                  YouTube
                </span>
                <span className="hidden lg:block absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-1.5 text-sm font-semibold text-black shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
                  YouTube
                </span>
              </div>

              {/* Zomato */}
              <div className="group relative cursor-pointer">
                <a
                  href="https://zomato.onelink.me/xqzv/ut3cavr1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src="https://cdn.brandfetch.io/idEql8nEWn/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B"
                    alt="Zomato"
                    className="w-7 h-7 transition-all duration-300 hover:scale-125 lg:grayscale lg:group-hover:grayscale-0"
                  />
                </a>
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-1.5 text-sm font-semibold text-black shadow-md transition-all duration-300 ease-in-out group-hover:scale-100 lg:group-hover:scale-100 lg:hidden block">
                  Zomato
                </span>
                <span className="hidden lg:block absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-1.5 text-sm font-semibold text-black shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
                  Zomato
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: 'Home', Icon: Home },
                // { to: '/shop', label: 'Products', Icon: ShoppingBag },
                { to: '/terms-and-conditions', label: 'Terms & Conditions', Icon: ScrollText },
                { to: '/concept', label: 'Concept', Icon: Lightbulb },
                { to: '/about', label: 'About', Icon: Info },
                { to: '/privacy-policy', label: 'Privacy Policy', Icon: Info },
                { to: '/refund-policy', label: 'Refund Policy', Icon: Info },
                { to: '/contact', label: 'Contact', Icon: PhoneCall },
              ].map(({ to, label, Icon }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-gray-400 dark:text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-4 group"
                  >
                    <Icon className="text-orange-500 group-hover:scale-110 transition-transform" size={20} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-4 group transition-all duration-300 hover:translate-x-1">
                <MapPin className="text-orange-500 mt-1 group-hover:scale-110 transition-transform" size={20} />
                <span className="text-gray-400 dark:text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                  <strong className="text-white">Office Address:</strong><br />

                  Saibaba Nagar<br />
                  Borivali West, Mumbai,<br />
                  Maharashtra – 400092
                </span>
              </li>
              <li className="flex items-center gap-4 group hover:translate-x-1 transition-all duration-300">
                <Mail className="text-orange-500 group-hover:scale-110 transition-transform" size={20} />
                <a href="mailto:govindashah603@gmail.com" className="text-gray-400 dark:text-gray-300 group-hover:text-white transition-colors">
                  govindashah603@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-4 group hover:translate-x-1 transition-all duration-300">
                <Phone className="text-orange-500 group-hover:scale-110 transition-transform" size={20} />
                <a href="tel:+917045617506" className="text-gray-400 dark:text-gray-300 group-hover:text-white transition-colors">
                  +91 7045617506
                </a>
              </li>
            </ul>
          </div>

          {/* Delivery Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Delivery Service</h4>
            <ul className="space-y-2 text-sm">
              {[
                'Kandivali West',
                'Borivali West',
                'Shimpoli',
                'Satya Nagar',
                'Dhanukarwadi',
                'Ram Nagar',
                'Mulji Nagar'
              ].map((location) => (
                <li key={location} className="flex items-center gap-4 group hover:translate-x-1 transition-all duration-300">
                  <Bike className="text-orange-500 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-gray-400 dark:text-gray-300 group-hover:text-white transition-colors">
                    {location}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timing & Party Orders */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Business Hours</h4>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-4 group transition-all duration-300">
                <Clock className="text-orange-500 mt-1 group-hover:scale-110 transition-transform" size={20} />
                <div className="text-gray-400 dark:text-gray-300 leading-relaxed">
                  <p className="text-white font-semibold mb-2">Delivery Timings:</p>
                  <p>Morning: 11:00 AM - 2:00 PM</p>
                  <p>Evening: 8:00 PM - 12:00 AM</p>
                </div>
              </li>
              <li className="flex items-start gap-4 group transition-all duration-300">
                <PartyPopper className="text-orange-500 mt-1 group-hover:scale-110 transition-transform" size={20} />
                <div className="text-gray-400 dark:text-gray-300 leading-relaxed">
                  <p className="text-white font-semibold mb-2">Party Orders:</p>
                  <p>We accept bulk & party orders!</p>
                  <a
                    href="tel:+917045617506"
                    className="inline-block mt-1 text-orange-500 hover:text-orange-400 transition-colors"
                  >
                    Contact us for details →
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GoTreats. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
