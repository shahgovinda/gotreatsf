import { MailIcon, Phone, Store, User, MessageSquare } from 'lucide-react'
import Button from '../components/Button'
import { useEffect, useState } from 'react';
import { useFormspark } from "@formspark/use-formspark";
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Contact = () => {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const [submit, submitting] = useFormspark({
        formId: import.meta.env.VITE_FORMSPARK_ID,
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await submit({
                name,
                phone,
                email,
                message,
                _email: {
                    from: email,
                    subject: `New Contact Form Submission from ${name}`,
                    template: {
                        text: `
Name: ${name}
Phone: ${phone}
Email: ${email}
Message: ${message}
                        `
                    }
                }
            });
            toast.success("Message Sent Successfully");
            setEmail("");
            setName("");
            setPhone("");
            setMessage("");
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error("Failed to send message. Please try again.");
        }
    }

    useEffect(() => window.scrollTo(0, 0), [])
    return (
        <div className='min-h-screen bg-[#f8f5f2] pb-10'>
            <div className='text-center mt-6 py-6 md:py-8 px-5'>
                <motion.h1
                    className='text-5xl md:text-6xl font-bold mb-4 tracking-tight text-[#2d1a0a]'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Get In <motion.span
                        className='text-[#ff7a1a] relative'
                    >
                        Touch
                        <motion.div
                            className='absolute left-0 right-0 h-1 bg-[#ff7a1a] -bottom-4 rounded-full'
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                        />
                    </motion.span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mt-6 text-[#2d1a0a]"
                >
                    Hi! 👋🏻 It's Govinda Jayprakash Shah. If you have any query just contact me
                </motion.p>
            </div>

            <div className='container mx-auto flex lg:flex-row px-4 flex-col justify-evenly gap-7 lg:gap-0 mt-10'>
                <div className='group border border-[#ff7a1a]/40 h-46 md:h-56 w-full lg:w-86 flex flex-col justify-between p-6 gap-5 rounded-xl bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-md'>
                    <MailIcon size={40} strokeWidth='1.4' className='group-hover:animate-bounce text-[#ff7a1a] transition-colors' />
                    <div>
                        <h2 className='text-[#2d1a0a] text-xl tracking-tight font-semibold'>Email Us</h2>
                        <p className='text-gray-600 text-sm'>Send us an email, we will get back to you.</p>
                        <a href="mailto:govindashah603@gmail.com" className='text-[#ff7a1a] mt-3 group-hover:underline group-hover:text-[#2d1a0a] transition-colors duration-200 break-all'>govindashah603@gmail.com</a>
                    </div>
                </div>

                <div className='group border border-[#ff7a1a]/40 h-46 md:h-56 w-full lg:w-86 flex flex-col justify-between p-6 gap-5 rounded-xl bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-md'>
                    <Phone size={40} strokeWidth='1.4' className='group-hover:animate-bounce text-[#ff7a1a] transition-colors' />
                    <div>
                        <h2 className='text-[#2d1a0a] text-xl tracking-tight font-semibold'>Call Us</h2>
                        <p className='text-gray-600 text-sm'>Prefer to talk? Give us a call at.</p>
                        <a href="tel:+917045617506" className='text-[#ff7a1a] mt-3 group-hover:underline group-hover:text-[#2d1a0a] transition-colors duration-200'>+91-7045617506</a>
                    </div>
                </div>

                <div className='group border border-[#ff7a1a]/40 h-auto md:h-56 w-full lg:w-86 flex flex-col justify-between p-6 gap-5 rounded-xl bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-md'>
                    <Store size={40} strokeWidth='1.4' className='group-hover:animate-bounce text-[#ff7a1a] transition-colors' />
                    <div>
                        <h2 className='text-[#2d1a0a] text-xl tracking-tight font-semibold'>Visit Us</h2>
                        <p className='text-gray-600 text-sm'>Operational Address</p>
                        <p className='text-[#ff7a1a] mt-3 group-hover:underline group-hover:text-[#2d1a0a] transition-colors duration-200 break-all'>
                            Room No.6, Ratnabai Chawl, Saibaba Nagar, Behind Nehru Garden, Borivali West, Maharashtra, PIN: 400092
                        </p>
                    </div>
                </div>
            </div>

            <div className='flex justify-center lg:mt-10 p-4 lg:p-0'>
                <form className='mt-4 sm:mt-10 w-full max-w-lg space-y-4 sm:space-y-6' onSubmit={onSubmit}>
                    <div className="relative">
                        <p className='mb-2 text-[#ff7a1a] font-medium'>Name</p>
                        <div className="relative">
                            <input
                                type="text"
                                value={name}
                                required
                                onChange={(e) => setName(e.target.value)}
                                className='pl-12 border border-[#ff7a1a]/30 bg-white text-[#2d1a0a] rounded-xl p-3 w-full 
                                focus:outline-none focus:border-[#ff7a1a] focus:ring-2 focus:ring-[#ff7a1a]/30 transition-all duration-300
                                placeholder:text-gray-400'
                                placeholder='Enter your name'
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ff7a1a] w-5 h-5" />
                        </div>
                    </div>
                    <div className="relative">
                        <p className='mb-2 text-[#ff7a1a] font-medium'>Phone number</p>
                        <div className="relative">
                            <input
                                type="number"
                                value={phone}
                                required
                                onChange={(e) => setPhone(e.target.value)}
                                className='pl-12 border border-[#ff7a1a]/30 bg-white text-[#2d1a0a] rounded-xl p-3 w-full 
                                focus:outline-none focus:border-[#ff7a1a] focus:ring-2 focus:ring-[#ff7a1a]/30 transition-all duration-300
                                placeholder:text-gray-400'
                                placeholder='Enter your number'
                            />
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ff7a1a] w-5 h-5" />
                        </div>
                    </div>
                    <div className="relative">
                        <p className='mb-2 text-[#ff7a1a] font-medium'>Email</p>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                className='pl-12 border border-[#ff7a1a]/30 bg-white text-[#2d1a0a] rounded-xl p-3 w-full 
                                focus:outline-none focus:border-[#ff7a1a] focus:ring-2 focus:ring-[#ff7a1a]/30 transition-all duration-300
                                placeholder:text-gray-400'
                                placeholder='Enter your email'
                            />
                            <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ff7a1a] w-5 h-5" />
                        </div>
                    </div>
                    <div className="relative">
                        <p className='mb-2 text-[#ff7a1a] font-medium'>Your Message</p>
                        <div className="relative">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                required
                                className='pl-12 border border-[#ff7a1a]/30 bg-white text-[#2d1a0a] rounded-xl p-3 w-full 
                                focus:outline-none focus:border-[#ff7a1a] focus:ring-2 focus:ring-[#ff7a1a]/30 transition-all duration-300
                                placeholder:text-gray-400 resize-none'
                                placeholder='Write your message'
                            />
                            <MessageSquare className="absolute left-4 top-6 text-[#ff7a1a] w-5 h-5" />
                        </div>
                    </div>
                    <div className="w-full mt-8">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl font-semibold text-lg relative overflow-hidden
                            bg-[#ff7a1a] text-white hover:bg-white hover:text-[#ff7a1a] border-2 border-[#ff7a1a] hover:scale-105 hover:shadow-xl transition-all duration-300
                            ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {submitting ? 'Sending...' : 'Send Message'}
                            <svg
                                className="w-5 h-5 transition-transform duration-200 transform group-hover:translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>

            {/* Official WhatsApp Button */}
            <a
                href="https://wa.me/917045617506"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 group"
                aria-label="Chat on WhatsApp"
            >
                <div className="relative flex flex-col items-center">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        WhatsApp
                        {/* Tooltip Arrow */}
                        <div className="absolute bottom-0 left-1/2 -mb-2 -ml-2 border-4 border-transparent border-t-gray-900"></div>
                    </div>

                    {/* WhatsApp Button */}
                    <div className="bg-[#25D366] hover:bg-[#20BA5C] p-3.5 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            fill="white"
                            viewBox="0 0 448 512"
                        >
                            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                        </svg>
                    </div>

                    {/* Pulse Effect */}
                    <div className="absolute inset-0 rounded-full animate-ping bg-[#25D366] opacity-25"></div>
                </div>
            </a>

        </div>
    )
}

export default Contact;
