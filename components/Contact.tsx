
import React from 'react';

const Contact: React.FC = () => {
    return (
        <section id="contact" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold text-deep-blue">Get In Touch</h2>
                    <p className="mt-2 text-lg text-charcoal">We're here to answer your questions and help you begin your legacy journey.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="fade-in-section">
                        <h3 className="text-2xl font-bold text-deep-blue mb-4">Contact Details</h3>
                        <div className="space-y-4 text-charcoal">
                            <p><strong>Address:</strong><br />111b Vardhaman Industrial Estate, Gokul Nagar, Thane West 400601, Maharashtra</p>
                            <p><strong>Phone:</strong><br />
                                📱 +91 93241 90698<br />
                                📱 +91 90048 57376<br />
                                📱 +91 87791 01817<br />
                                📱 +91 87791 02007
                            </p>
                            <p><strong>Email:</strong> <a href="mailto:connect@aviyanaventures.com" className="text-marigold hover:underline">connect@aviyanaventures.com</a></p>
                            <p><strong>Website:</strong> <a href="http://www.aviyanahrsolutions.com" target="_blank" rel="noopener noreferrer" className="text-marigold hover:underline">www.aviyanahrsolutions.com</a></p>
                        </div>
                        <div className="flex space-x-4 mt-6">
                            {/* Social Icons would go here */}
                            <a href="#" className="text-deep-blue hover:text-golden">Twitter</a>
                            <a href="#" className="text-deep-blue hover:text-golden">Facebook</a>
                            <a href="#" className="text-deep-blue hover:text-golden">Instagram</a>
                        </div>
                    </div>
                    <div className="fade-in-section" style={{ transitionDelay: '200ms' }}>
                        <div className="overflow-hidden rounded-lg shadow-lg h-96">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.169123687391!2d72.9554228148523!3d19.1877960870237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b9212c000001%3A0x853bdef05ef0339a!2sVardhaman%20Industrial%20Estate!5e0!3m2!1sen!2sin!4v1672522545199!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
