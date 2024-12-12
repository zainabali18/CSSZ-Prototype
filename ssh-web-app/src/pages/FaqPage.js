import React from 'react';

const FaqPage = () => {
    const faqs = [
        {
            question: "What is SSH Smart Homes?",
            answer: "SSH Smart Homes is a smart home system designed to enhance student living by offering tailored recipe recommendations and inventory tracking."
        },
        {
            question: "How does the SSH Camera work?",
            answer: "The SSH Camera uses image recognition to track inventory and expiration dates in your fridge, helping reduce food waste and streamline meal planning."
        },
        {
            question: "Can I customize my dietary preferences?",
            answer: "Yes, SSH allows you to set up a dietary profile for personalized recipe suggestions based on your needs."
        },
        {
            question: "What platforms support SSH Smart Homes?",
            answer: "SSH Smart Homes is accessible via web browsers on desktops, tablets, and mobile devices."
        }
    ];

    return (
        <div>
            <div className="title-container">
                <h1 className="page-title">Frequently Asked Questions</h1>
            </div>

            <div className="faq-container">
                {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                        <h2 className="faq-question">{faq.question}</h2>
                        <p className="faq-answer">{faq.answer}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FaqPage;
