import React, { useState } from 'react';

const servicesData = [
    {
        grade: "Grade 1",
        title: "Personal & Family Care",
        shortItems: ["Inform relatives & friends", "Funeral arrangements & rituals", "Recording / live streaming", "Will discussion with lawyer", "Remembrance services"],
        icon: "👨‍👩‍👧‍👦",
        details: {
            modalTitle: "Family Care & Dignified Farewell",
            description: "Grade 1 services provide support during sensitive times ensuring dignity, transparency, and comfort. From notifying relatives to arranging funeral rituals, we take care of every step while respecting personal and religious traditions.",
            process: [
                "Notify relatives & friends automatically",
                "Arrange funeral & rituals at preferred location",
                "Record or live-stream ceremonies for distant loved ones",
                "Conduct will discussion with legal guidance",
                "Organize remembrance events annually"
            ],
            examples: [
                { text: "Mr. Rajesh Khanna", detail: "– Supported 30 underprivileged families via Mumbai Funeral Care Trust (+91 98765 43210)" },
                { text: "Ananya Patel", detail: "– Sponsored remembrance services for her late father, feeding 100 people annually" }
            ],
            impact: [
                { number: "50+", label: "families served this year" },
                { number: "200+", label: "remembrance services organized" }
            ],
            partners: [
                { name: "Mumbai Funeral Care Trust", contact: "+91 98765 43210" },
                { name: "Local volunteers and family donors", contact: null }
            ],
            ctas: [
                { text: "Request Family Care Support", href: "#contact" },
                { text: "Sponsor a Family Service", href: "#contact" }
            ]
        }
    },
    {
        grade: "Grade 2",
        title: "Small Social Contributions",
        shortItems: ["Food donations, spectacles, essentials", "Scholarships & school support", "Book & stationery contributions", "Annual awards"],
        icon: "❤️",
        details: {
            modalTitle: "Small Acts, Big Impact",
            description: "Grade 2 encourages small but meaningful acts of kindness that create immediate positive change for individuals and communities.",
            process: ["Collect donations (food, books, essentials)", "Verify beneficiaries", "Distribute with proper documentation", "Publish results / updates for transparency"],
            examples: [
                { text: "Mrs. Kavita Mehra", detail: "– Donated 500 notebooks & 200 school bags in Raigad" },
                { text: "Mr. Sameer Joshi", detail: "– Distributed 200 spectacles in Nashik villages" },
                { text: "Smile Foundation India", detail: "– Provides scholarships to 1,500 students (Helpline: 1800-120-1234)" }
            ],
            impact: [
                { number: "2,000+", label: "children supported" },
                { number: "5,000+", label: "meals served" },
                { number: "50", label: "scholarships awarded" }
            ],
            partners: [
                { name: "Smile Foundation India", contact: "1800-120-1234" },
                { name: "Local community volunteers", contact: null }
            ],
            ctas: [
                { text: "Donate Essentials", href: "#contact" },
                { text: "Sponsor a Scholarship", href: "#contact" }
            ]
        }
    },
    {
        grade: "Grade 3",
        title: "Social Infrastructure",
        shortItems: ["Schools & classrooms", "Toilets", "Water reservoirs"],
        icon: "🏫",
        details: {
            modalTitle: "Building Communities, Building Futures",
            description: "Grade 3 focuses on long-term infrastructure that benefits generations, including educational and sanitation facilities, as well as water reservoirs for rural communities.",
            process: ["Assess community infrastructure needs", "Partner with local NGOs & authorities", "Fund & construct projects", "Handover completed projects to community"],
            examples: [
                { text: "Rotary Club of Navi Mumbai", detail: "– Constructed 5 classrooms in Raigad District" },
                { text: "Mr. Akash Verma", detail: "– Funded 3 rural toilets" },
                { text: "WaterAid India", detail: "– Built 20 water reservoirs (+91 98111 22334)" }
            ],
            impact: [
                { number: "20+", label: "classrooms built" },
                { number: "15,000+", label: "villagers benefited" },
                { number: "10", label: "water reservoirs completed" }
            ],
            partners: [
                { name: "Rotary Club", contact: "+91 98111 22334" },
                { name: "WaterAid India", contact: "+91 98765 67890" }
            ],
            ctas: [
                { text: "Sponsor Infrastructure Project", href: "#contact" },
                { text: "Join as Volunteer", href: "#contact" }
            ]
        }
    },
    {
        grade: "Grade 4",
        title: "Community Activities",
        shortItems: ["Sports & cultural events", "Educational competitions", "Medical health camps"],
        icon: "🎉",
        details: {
            modalTitle: "Connecting Communities",
            description: "Grade 4 promotes social bonding through sports, cultural events, educational competitions, and health initiatives.",
            process: ["Organize community events (sports/cultural/educational)", "Partner with schools, NGOs, and volunteers", "Conduct free health & medical camps", "Document & report outcomes"],
            examples: [
                { text: "Dr. Neha Sharma", detail: "– Free health camp for 1,000 villagers" },
                { text: "Tata Trusts", detail: "– Sponsors 50+ educational competitions" },
                { text: "Mr. Suresh Reddy", detail: "– Cricket tournaments for underprivileged kids" }
            ],
            impact: [
                { number: "5,000+", label: "participants benefited" },
                { number: "100+", label: "events conducted" }
            ],
            partners: [
                { name: "Tata Trusts", contact: "+91 98765 67890" },
                { name: "Local volunteers & community organizations", contact: null }
            ],
            ctas: [
                { text: "Join Event Team", href: "#contact" },
                { text: "Sponsor a Camp / Competition", href: "#contact" }
            ]
        }
    },
    {
        grade: "Grade 5",
        title: "Spiritual & Cultural Legacy",
        shortItems: ["Temples, mosques, community places", "Wells, water tanks, stadiums", "Religious tourism"],
        icon: "🕊️",
        details: {
            modalTitle: "Preserving Faith & Heritage",
            description: "Grade 5 supports spiritual and cultural projects, maintaining temples, mosques, water resources, and stadiums while promoting heritage and tourism.",
            process: ["Identify project location & needs", "Partner with local authorities & communities", "Fund & construct/renovate", "Conduct inauguration / religious tourism programs"],
            examples: [
                { text: "ISKCON India", detail: "– Renovated 3 temples in Maharashtra" },
                { text: "Mrs. Leela Nair", detail: "– Sponsored 50,000-litre water tank in Kerala" },
                { text: "Mr. Abdul Rahman", detail: "– Mosque library project in Hyderabad" }
            ],
            impact: [
                { number: "5", label: "temples/places renovated" },
                { number: "2", label: "water reservoirs built" },
                { number: "3", label: "stadium/community spaces completed" }
            ],
            partners: [
                { name: "ISKCON India", contact: "+91 98765 54321" },
                { name: "Local philanthropists", contact: null }
            ],
            ctas: [
                { text: "Sponsor Cultural Project", href: "#contact" },
                { text: "Join Religious Tourism Drive", href: "#contact" }
            ]
        }
    },
    {
        grade: "Grade 6",
        title: "Collective Causes",
        shortItems: ["Support orphanages & old-age homes", "Cancer care, war widows rehabilitation", "Para-athletes & tribal children", "Marathons for social causes"],
        icon: "🤝",
        details: {
            modalTitle: "Collective Good, Collective Impact",
            description: "Grade 6 unites multiple patrons for large-scale social causes like orphanage support, elderly care, cancer programs, and athletic/tribal development.",
            process: ["Form collective funding groups", "Identify long-term projects & NGOs", "Allocate resources transparently", "Monitor and report impact"],
            examples: [
                { text: "CRY", detail: "– Supporting 2,000 orphans (1800-419-1414)" },
                { text: "Major (Retd.) Anil Deshmukh", detail: "– Scholarships for war widows’ children" },
                { text: "Indian Cancer Society", detail: "– Camps across Mumbai (+91 99309 45060)" },
                { text: "Ms. Ritu Malhotra", detail: "– Para-athlete training for 15 athletes" }
            ],
            impact: [
                { number: "2,500+", label: "beneficiaries in 2025" },
                { number: "10", label: "marathons organized for awareness" },
                { number: "500+", label: "scholarships distributed" }
            ],
            partners: [
                { name: "CRY", contact: "1800-419-1414" },
                { name: "Indian Cancer Society", contact: "+91 99309 45060" }
            ],
            ctas: [
                { text: "Join Collective Cause", href: "#contact" },
                { text: "Sponsor a Marathon / Project", href: "#contact" }
            ]
        }
    },
];

type Service = typeof servicesData[0];

const ServiceModal: React.FC<{ service: Service, onClose: () => void }> = ({ service, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
        <div 
            className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative animate-fadeUp"
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={onClose} className="absolute top-4 right-4 text-charcoal/50 hover:text-charcoal text-3xl font-bold">&times;</button>
            <h2 className="text-3xl font-serif font-bold text-deep-blue mb-4">{service.details.modalTitle}</h2>
            <p className="text-charcoal mb-6">{service.details.description}</p>

            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-emerald mb-2">Step-by-Step Process</h3>
                    <ul className="list-decimal list-inside space-y-1 text-charcoal">
                        {service.details.process.map((step, i) => <li key={i}>{step}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-emerald mb-2">Real-Life Examples</h3>
                    <ul className="list-disc list-inside space-y-1 text-charcoal">
                        {service.details.examples.map((ex, i) => <li key={i}><strong className="text-deep-blue">{ex.text}</strong> {ex.detail}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-emerald mb-2">Impact Numbers</h3>
                    <div className="flex flex-wrap gap-4">
                        {service.details.impact.map((imp, i) => (
                            <div key={i} className="text-center p-3 bg-light-grey rounded-md">
                                <span className="text-2xl font-bold text-marigold">{imp.number}</span>
                                <p className="text-sm font-semibold">{imp.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-emerald mb-2">Contributors / Partners</h3>
                    <ul className="list-disc list-inside space-y-1 text-charcoal">
                        {service.details.partners.map((p, i) => <li key={i}>{p.name} {p.contact && `- ${p.contact}`}</li>)}
                    </ul>
                </div>
                <div className="flex flex-wrap gap-4 pt-4 border-t">
                    {service.details.ctas.map((cta, i) => (
                        <a key={i} href={cta.href} className="bg-golden text-deep-blue font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105">
                            {cta.text}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </div>
);


const ServiceCard: React.FC<{ service: Service; onLearnMore: () => void }> = ({ service, onLearnMore }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:border-golden border-2 border-transparent group">
        <div className="text-5xl mb-4">{service.icon}</div>
        <h4 className="text-sm font-bold text-marigold">{service.grade}</h4>
        <h3 className="text-2xl font-serif font-bold text-deep-blue mb-3">{service.title}</h3>
        <ul className="space-y-2 text-charcoal list-disc list-inside flex-grow">
            {service.shortItems.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
        <button onClick={onLearnMore} className="mt-4 text-emerald font-bold opacity-0 group-hover:opacity-100 transition-opacity text-left">
            Learn More &rarr;
        </button>
    </div>
);

const Services: React.FC = () => {
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    return (
        <>
            <section id="services" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-serif font-bold text-deep-blue">Our Services</h2>
                        <p className="mt-2 text-lg text-charcoal">Fulfilling wishes across every sphere of life.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {servicesData.map((service, index) => (
                            <div key={index} className="fade-in-section" style={{ transitionDelay: `${index * 100}ms` }}>
                                <ServiceCard service={service} onLearnMore={() => setSelectedService(service)} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {selectedService && <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />}
        </>
    );
};

export default Services;
