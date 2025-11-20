
import React, { useState } from 'react';

const faqData = [
    { question: "Who can pledge a last wish?", answer: "Anyone, regardless of age, health, or background, can pledge a wish. Our services are for anyone who wants to ensure their good deeds continue." },
    { question: "Is there a cost involved?", answer: "Pledging a wish is free. The fulfillment of the wish is carried out using funds provided by the patron or their estate, as detailed in the MOU." },
    { question: "How do you ensure the wishes are fulfilled?", answer: "We have a dedicated team and a transparent process. The MOU legally binds us to carry out the wishes, and we provide regular updates and documentation to the family." },
    { question: "Can I change my wish after pledging?", answer: "Yes, you can update your pledged wishes at any time by contacting our team. We understand that circumstances and desires can change." },
];

const AccordionItem: React.FC<{ item: typeof faqData[0], isOpen: boolean, onClick: () => void }> = ({ item, isOpen, onClick }) => (
    <div className="border-b">
        <button onClick={onClick} className="w-full flex justify-between items-center py-4 text-left">
            <span className="font-semibold text-lg text-deep-blue">{item.question}</span>
            <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
            <p className="p-4 bg-light-grey rounded-b-md">{item.answer}</p>
        </div>
    </div>
);


const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-20 bg-light-grey">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold text-deep-blue">Frequently Asked Questions</h2>
                    <p className="mt-2 text-lg text-charcoal">Answers to common queries about our mission.</p>
                </div>
                <div className="max-w-3xl mx-auto bg-white p-4 rounded-lg shadow-md fade-in-section">
                    {faqData.map((item, index) => (
                        <AccordionItem key={index} item={item} isOpen={openIndex === index} onClick={() => handleToggle(index)} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
