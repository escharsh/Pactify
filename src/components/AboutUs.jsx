import React from "react";

const AboutUs = () => {
    return (
        <div className="bg-black w-screen overflow-x-hidden">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            About <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">Pactify</span>
                        </h1>
                        <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
                            Simplifying legal documentation for businesses and individuals with powerful, intuitive contract generation tools.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-black from-black to-transparent"></div>
            </div>

            {/* Our Mission */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
                <div className="lg:flex lg:items-center lg:space-x-8">
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl font-bold text-white">Our Mission</h2>
                        <div className="mt-6 text-lg text-gray-400 space-y-4">
                            <p>
                                At Plactify, we believe that legal documentation should be accessible to everyone,
                                not just large corporations with dedicated legal teams. Our mission is to democratize
                                contract creation and management through intuitive technology.
                            </p>
                            <p>
                                We strive to simplify complex legal processes while maintaining the highest standards
                                of accuracy and compliance. By combining cutting-edge technology with legal expertise,
                                we provide a platform that anyone can use to create professional, legally-sound documents.
                            </p>
                        </div>
                    </div>
                    <div className="mt-10 lg:mt-0 lg:w-1/2">
                        <div className="bg-blue-600 rounded-xl p-1">
                            <div className="bg-gray-800 rounded-lg p-6 h-full">
                                <blockquote className="text-xl italic font-medium text-white">
                                    "Our vision is a world where legal documentation is no longer a barrier to business growth and personal security, but rather an enabler of success for everyone."
                                </blockquote>
                                <div className="mt-4 flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-base font-medium text-white">4e&lt;ers</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>





            {/* Call to Action */}
            <div className=" text-center py-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
                <h2 className="text-3xl font-semibold">Ready to Start?</h2>
                <p className="mt-4 text-lg">
                    Join thousands of businesses and individuals who trust ContractEase to create legally binding documents with ease.
                </p>
                <div className="mt-6">
                    <a href="#" className="bg-white text-blue-600 px-6 py-3 rounded-full text-lg font-medium">
                        Get Started
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
