import React, { useEffect } from 'react'

const TermsConditions = () => {
    useEffect(() => window.scrollTo(0, 0), [])
    return (
        <div className="w-full min-h-screen bg-white">
            <div className="bg-orange-500 text-center py-10 px-2">
                <h1 className="lancelot text-4xl md:text-5xl text-white font-bold">Terms and Conditions</h1>
            </div>
            <div className="max-w-5xl mx-auto px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-10 text-base md:text-lg text-gray-800">
                <section className="mb-8">
                    <p className="mb-4 text-justify">
                        Welcome to our website. Please read these Terms and Conditions carefully before using our services. By accessing or using our website, you agree to be bound by these Terms, our Privacy Policy, and any other policies referenced here.
                    </p>
                    <p className="mb-4 text-justify">
                        We may update these Terms at any time. Please check this page regularly to stay informed of any changes.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">1. General Use</h2>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li>You must provide accurate and complete information during registration and are responsible for all activity under your account.</li>
                        <li>We do not guarantee the accuracy, completeness, or suitability of any information or materials on this website for any particular purpose.</li>
                        <li>Information and materials may contain errors or inaccuracies. We are not liable for any such errors to the fullest extent permitted by law.</li>
                        <li>Your use of our website and services is at your own risk. Please ensure our services meet your needs before using them.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">2. Intellectual Property</h2>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li>All content on this website is owned by us. You may not claim any intellectual property rights to our content or services.</li>
                        <li>Unauthorized use of our website or services may result in legal action.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">3. User Responsibilities</h2>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li>You agree to pay all charges associated with using our services.</li>
                        <li>You must not use our website or services for any unlawful or prohibited purpose.</li>
                        <li>Our website may contain links to third-party sites. We are not responsible for the content or policies of those sites.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">4. Transactions & Refunds</h2>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li>By making a purchase, you enter into a legally binding contract with us.</li>
                        <li>If we are unable to provide a service you paid for, you may request a refund within the time period specified in our policies. Refunds are not available after this period.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">5. Limitation of Liability</h2>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li>We are not liable for any failure to perform our obligations due to events beyond our control (force majeure).</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">6. Governing Law & Disputes</h2>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li>These Terms are governed by the laws of India.</li>
                        <li>All disputes will be subject to the exclusive jurisdiction of the courts in Borivali West, Maharashtra.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">7. Contact</h2>
                    <p className="text-justify">If you have any questions or concerns about these Terms, please contact us using the information provided on our website.</p>
                </section>
            </div>
        </div>
    )
}

export default TermsConditions