import React, { useEffect } from 'react'

const RefundPolicy = () => {
    useEffect(() => window.scrollTo(0, 0), [])
    return (
        <div className="w-full min-h-screen bg-white">
            <div className="bg-orange-500 text-center py-10 px-2">
                <h1 className="lancelot text-4xl md:text-5xl text-white font-bold">Cancellation and Refund Policy</h1>
            </div>
            <div className="max-w-5xl mx-auto px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-10 text-base md:text-lg text-gray-800">
                <section className="mb-8">
                    <p className="mb-2 text-sm text-gray-500">Effective Date: May 10, 2025</p>
                    <p className="mb-4 text-justify">
                        This Cancellation and Refund Policy outlines the terms and conditions regarding order cancellations and refunds for online food orders placed through GoTreats (the "Services").
                    </p>
                </section>
                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">1. Cancellation Policy</h2>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li><strong>Customer Cancellation:</strong> You may be able to cancel your GoTreats order before it has been prepared or dispatched. The specific timeframe for cancellation may vary depending on preparation time and delivery logistics. Please check your order confirmation or contact our customer support immediately at <a href="tel:7045617506" className="text-blue-500">7045617506</a> to inquire about cancellation.</li>
                        <li><strong>Our Cancellation:</strong> We may cancel your order for reasons including, but not limited to:
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Unavailability of certain menu items.</li>
                                <li>Delivery limitations to your area.</li>
                                <li>Technical issues or errors in order processing.</li>
                                <li>Suspicion of fraudulent activity.</li>
                                <li>Events outside our control (e.g., extreme weather conditions).</li>
                            </ul>
                            If we cancel your order, we will attempt to notify you and provide a full refund of the order amount.
                        </li>
                    </ul>
                </section>
                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">2. Refund Policy</h2>
                    <h3 className="text-md font-semibold mb-1">Eligibility for Refund</h3>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li><strong>Order Cancellation by Us:</strong> If we cancel your GoTreats order before delivery.</li>
                        <li><strong>Incorrect Order:</strong> If you receive an order significantly different from what you ordered. Please notify us immediately with photographic evidence.</li>
                        <li><strong>Damaged or Spoilage:</strong> If your order is delivered in a damaged condition or is spoiled upon arrival. Please notify us immediately with photographic evidence.</li>
                        <li><strong>Missing Items:</strong> If any items from your order are missing. Please notify us immediately.</li>
                    </ul>
                    <h3 className="text-md font-semibold mt-6 mb-1">Non-Eligibility for Refund</h3>
                    <ul className="list-disc pl-6 space-y-2 text-justify">
                        <li>Minor discrepancies in the order (e.g., slight variations in quantity or presentation).</li>
                        <li>Change of mind after the order has been prepared or dispatched.</li>
                        <li>Incorrect delivery address provided by the customer.</li>
                        <li>Food that has been consumed partially or fully.</li>
                    </ul>
                </section>
                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">3. Refund Process</h2>
                    <p className="text-justify mb-2">
                        To request a refund, please contact our customer support within <strong>[Specify Timeframe, e.g., 1 hour]</strong> of receiving your order at <a href="tel:7045617506" className="text-blue-500">7045617506</a> or <a href="mailto:govindashah603@gmail.com" className="text-blue-500">govindashah603@gmail.com</a> with details of the issue and supporting evidence (e.g., photographs).
                    </p>
                    <p className="text-justify mb-2">
                        We will review your request and may require further information. If your refund request is approved, we will process the refund within <strong>[Specify Timeframe, e.g., 5-7 business days]</strong>. The refund will be processed using the original payment method. Please note that it may take additional time for the refund to reflect in your account depending on your bank or payment provider (RazorPay).
                    </p>
                </section>
                <section className="mb-8">
                    <h2 className="font-semibold text-lg md:text-xl mb-2 text-orange-600">4. Contact Us</h2>
                    <p className="text-justify mb-2">
                        If you have any questions or concerns about our Cancellation and Refund Policy, please contact us at:
                    </p>
                    <address className="not-italic text-justify">
                        GoTreats<br />
                        Saibaba Nagar, Borivali West, Mumbai - 400092<br />
                        Email: <a href="mailto:govindashah603@gmail.com" className="text-blue-500">govindashah603@gmail.com</a><br />
                        Phone: <a href="tel:7045617506" className="text-blue-500">7045617506</a>
                    </address>
                </section>
            </div>
        </div>
    )
}

export default RefundPolicy