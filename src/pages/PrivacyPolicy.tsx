import React, { useEffect } from 'react'

const PrivacyPolicy = () => {
    useEffect(() => window.scrollTo(0, 0), [])
    return (
        <div className="w-full min-h-screen bg-white">
            <div className="bg-orange-500 text-center py-10 px-2">
                <h1 className="lancelot text-4xl md:text-5xl text-white font-bold">Privacy Policy</h1>
            </div>
            <div className="max-w-5xl mx-auto px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-10 text-base md:text-lg text-gray-800">
                <section className="mb-8">
                    <p className="mb-2 text-sm text-gray-500">Last Updated: May 10, 2025</p>
                    <p className="mb-4 text-justify">
                        At GoTreats, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our online food ordering and delivery services.
                    </p>
                </section>
                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">1. Information We Collect</h2>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li><strong>Personal Identification Information:</strong> Name, email address, phone number, and delivery address.</li>
                        <li><strong>Payment Information:</strong> Payment details (e.g., card or UPI info) processed securely by our payment gateway (RazorPay); not stored by us.</li>
                        <li><strong>Order Information:</strong> Food items ordered, order history, and special instructions.</li>
                        <li><strong>Device and Usage Information:</strong> Device details (IP, browser, OS) and usage data (pages visited, time spent).</li>
                        <li><strong>Communications:</strong> Records of your communication with us, including inquiries and feedback.</li>
                    </ul>
                </section>
                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">2. How We Use Your Information</h2>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li>To process and fulfill your orders, including delivery.</li>
                        <li>To manage your account and provide customer support.</li>
                        <li>To personalize your experience and offer relevant recommendations.</li>
                        <li>To communicate with you about orders, promotions, and updates (with your consent where required).</li>
                        <li>To improve our services and develop new offerings.</li>
                        <li>To detect and prevent fraud and ensure platform security.</li>
                        <li>To comply with legal obligations.</li>
                    </ul>
                </section>
                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">3. Disclosure of Your Information</h2>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li><strong>Service Providers:</strong> Third-party vendors (e.g., payment processors) who help us provide services. They are contractually obligated to protect your information.</li>
                        <li><strong>Legal Authorities:</strong> We may disclose your information to government authorities or law enforcement if required by law.</li>
                    </ul>
                </section>
                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">4. Data Security</h2>
                    <p className="text-justify mb-2">
                        We implement reasonable security measures (encryption, firewalls) to protect your personal information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
                    </p>
                </section>
                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">5. Your Rights</h2>
                    <p className="text-justify mb-2">You may have certain rights regarding your personal information, including the right to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li>Access the personal information we hold about you.</li>
                        <li>Request correction of inaccurate or incomplete information.</li>
                        <li>Request deletion of your personal information (subject to legal limitations).</li>
                        <li>Object to the processing of your personal information for certain purposes.</li>
                        <li>Withdraw your consent to marketing communications at any time.</li>
                    </ul>
                </section>
                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">6. Contact Us</h2>
                    <p className="text-justify mb-2">To exercise your rights or if you have questions about this Privacy Policy, please contact us at:</p>
                    <p className="text-justify">
                        Email: <a href="mailto:govindashah603@gmail.com" className="text-blue-500">govindashah603@gmail.com</a><br />
                        Phone: <a href="tel:7045617506" className="text-blue-500">7045617506</a>
                    </p>
                </section>
            </div>
        </div>
    )
}

export default PrivacyPolicy