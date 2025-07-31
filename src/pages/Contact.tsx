import React, { useState, ChangeEvent, FormEvent } from 'react';

// Define the shape of the form data for type safety
interface FormData {
  name: string;
  email: string;
  phoneNumber: string; // Storing as string for easier regex validation on input
  message: string;
  agreedToTerms: boolean;
}

const Contact = () => {
    // State to hold form data and validation errors
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phoneNumber: '',
        message: '',
        agreedToTerms: false,
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        message: '',
        agreedToTerms: '',
    });

    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Email and phone number validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    // Generic handler for all input types
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let newValue;

        if (type === 'checkbox') {
            newValue = (e.target as HTMLInputElement).checked;
        } else {
            newValue = value;
        }

        setFormData({ ...formData, [name]: newValue });

        // Real-time validation
        validateField(name, newValue);
    };

    const validateField = (name: string, value: any) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value) error = "Name is required.";
                break;
            case 'email':
                if (!value) {
                    error = "Email is required.";
                } else if (!emailRegex.test(value)) {
                    error = "Please enter a valid email address.";
                }
                break;
            case 'phoneNumber':
                if (!value) {
                    error = "Phone number is required.";
                } else if (!phoneRegex.test(value)) {
                    error = "Please enter a valid 10-digit phone number.";
                }
                break;
            case 'message':
                if (!value) error = "Message is required.";
                break;
            case 'agreedToTerms':
                if (!value) error = "You must agree to the terms and conditions.";
                break;
            default:
                break;
        }
        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Final validation before submission
        validateField('name', formData.name);
        validateField('email', formData.email);
        validateField('phoneNumber', formData.phoneNumber);
        validateField('message', formData.message);
        validateField('agreedToTerms', formData.agreedToTerms);

        // Check if there are any errors
        const hasErrors = Object.values(errors).some(error => error !== '') ||
                         Object.values(formData).some(value => value === '' && value !== false);

        if (!hasErrors) {
            setSubmitting(true);
            try {
                // Simulate form submission
                console.log('Form data submitted:', formData);
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                setIsSubmitted(true);
                // Clear form data after successful submission
                setFormData({
                    name: '',
                    email: '',
                    phoneNumber: '',
                    message: '',
                    agreedToTerms: false,
                });
            } catch (error) {
                console.error('Form submission error:', error);
                // Handle submission error
            } finally {
                setSubmitting(false);
            }
        }
    };

    const InputWithIcon = ({ icon, type, name, placeholder, value, onChange, error, ...rest }) => (
        <div className="relative">
            <p className='mb-2 text-[#ff7a1a] font-medium capitalize'>{name.replace(/([A-Z])/g, ' $1').trim()}</p>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`pl-12 border rounded-xl p-3 w-full
                    focus:outline-none focus:border-[#ff7a1a] focus:ring-2 focus:ring-[#ff7a1a]/30 transition-all duration-300
                    placeholder:text-gray-400 ${error ? 'border-red-500' : 'border-[#ff7a1a]/30 bg-white text-[#2d1a0a]'}`}
                    placeholder={placeholder}
                    {...rest}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ff7a1a] w-5 h-5">
                    {icon}
                </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );

    return (
        <div className='min-h-screen bg-[#f8f5f2] pb-10'>
            <div className='text-center mt-6 py-6 md:py-8 px-5'>
                <h1 className='text-5xl md:text-6xl font-bold mb-4 tracking-tight text-[#2d1a0a]'>
                    Get In <span className='text-[#ff7a1a] relative'>
                        Touch
                        <span className='absolute left-0 right-0 h-1 bg-[#ff7a1a] -bottom-4 rounded-full' />
                    </span>
                </h1>
                <p className="mt-6 text-[#2d1a0a]">
                    Hi! 👋🏻 It's Govinda Jayprakash Shah. If you have any query just contact me
                </p>
            </div>

            <div className='container mx-auto flex lg:flex-row px-4 flex-col justify-evenly gap-7 lg:gap-0 mt-10'>
                <div className='group border border-[#ff7a1a]/40 h-46 md:h-56 w-full lg:w-86 flex flex-col justify-between p-6 gap-5 rounded-xl bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-md'>
                    <svg className='w-10 h-10 group-hover:animate-bounce text-[#ff7a1a] transition-colors' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    <div>
                        <h2 className='text-[#2d1a0a] text-xl tracking-tight font-semibold'>Email Us</h2>
                        <p className='text-gray-600 text-sm'>Send us an email, we will get back to you.</p>
                        <a href="mailto:govindashah603@gmail.com" className='text-[#ff7a1a] mt-3 group-hover:underline group-hover:text-[#2d1a0a] transition-colors duration-200 break-all'>govindashah603@gmail.com</a>
                    </div>
                </div>

                <div className='group border border-[#ff7a1a]/40 h-46 md:h-56 w-full lg:w-86 flex flex-col justify-between p-6 gap-5 rounded-xl bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-md'>
                    <svg className='w-10 h-10 group-hover:animate-bounce text-[#ff7a1a] transition-colors' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <div>
                        <h2 className='text-[#2d1a0a] text-xl tracking-tight font-semibold'>Call Us</h2>
                        <p className='text-gray-600 text-sm'>Prefer to talk? Give us a call at.</p>
                        <a href="tel:+917045617506" className='text-[#ff7a1a] mt-3 group-hover:underline group-hover:text-[#2d1a0a] transition-colors duration-200'>+91-7045617506</a>
                    </div>
                </div>

                <div className='group border border-[#ff7a1a]/40 h-auto md:h-56 w-full lg:w-86 flex flex-col justify-between p-6 gap-5 rounded-xl bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-md'>
                    <svg className='w-10 h-10 group-hover:animate-bounce text-[#ff7a1a] transition-colors' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
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
                {isSubmitted ? (
                    <div className="p-6 bg-green-100 border border-green-400 text-green-700 rounded-lg w-full max-w-lg text-center">
                        <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
                        <p>Your message has been successfully sent. We will get back to you shortly.</p>
                    </div>
                ) : (
                    <form className='mt-4 sm:mt-10 w-full max-w-lg space-y-4 sm:space-y-6' onSubmit={handleSubmit}>
                        <InputWithIcon
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            error={errors.name}
                        />

                        <InputWithIcon
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                            type="tel"
                            name="phoneNumber"
                            placeholder="Enter your number"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            maxLength={10}
                            required
                            error={errors.phoneNumber}
                        />
                        
                        <InputWithIcon
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            error={errors.email}
                        />

                        <div className="relative">
                            <p className='mb-2 text-[#ff7a1a] font-medium'>Your Message</p>
                            <div className="relative">
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={3}
                                    required
                                    className='pl-12 border border-[#ff7a1a]/30 bg-white text-[#2d1a0a] rounded-xl p-3 w-full
                                    focus:outline-none focus:border-[#ff7a1a] focus:ring-2 focus:ring-[#ff7a1a]/30 transition-all duration-300
                                    placeholder:text-gray-400 resize-none'
                                    placeholder='Write your message'
                                />
                                <div className="absolute left-4 top-6 text-[#ff7a1a] w-5 h-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                </div>
                            </div>
                            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                        </div>

                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                name="agreedToTerms"
                                id="agreedToTerms"
                                checked={formData.agreedToTerms}
                                onChange={handleInputChange}
                                required
                                className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="agreedToTerms" className="ml-2 block text-sm text-gray-900">
                                I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms and Conditions</a>
                            </label>
                        </div>
                        {errors.agreedToTerms && <p className="text-red-500 text-sm -mt-2 ml-6">{errors.agreedToTerms}</p>}

                        <div className="w-full mt-8">
                            <button
                                type="submit"
                                disabled={submitting || Object.values(errors).some(e => e !== '')}
                                className={`w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl font-semibold text-lg relative overflow-hidden
                                bg-[#ff7a1a] text-white hover:bg-white hover:text-[#ff7a1a] border-2 border-[#ff7a1a] hover:scale-105 hover:shadow-xl transition-all duration-300
                                ${submitting || Object.values(errors).some(e => e !== '') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                )}
            </div>

            {/* Official WhatsApp Button */}
            <a
                href="https://wa.me/917045617506?text=Hello%20GoTreats%2C%20this%20is%20a%20message%20from%20your%20website!"
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
                </div>
            </a>
        </div>
    );
};

export default Contact;
