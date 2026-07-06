import React from 'react';
import featureImage from '../assets/New 375x667 updated.jpg.png';


const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-kbz-gray-bg sm:p-6 lg:p-12 text-center md:text-left relative overflow-hidden">
            {/* Decorative Blur Background Element */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-kbz-blue opacity-5 rounded-full blur-3xl pointer-events-none hidden lg:block"></div>
            <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-kbz-blue opacity-5 rounded-full blur-3xl pointer-events-none hidden lg:block"></div>

            <div className="w-full h-[100dvh] md:h-auto max-w-6xl bg-white sm:rounded-3xl shadow-none sm:shadow-2xl overflow-hidden border-0 sm:border border-gray-100 flex flex-col md:flex-row z-10 transition-transform sm:hover:scale-[1.005] duration-300">

                {/* Feature Image Section */}
                <div className="w-full md:w-1/2 bg-white flex-1 min-h-0 relative order-1 md:order-1 flex items-center justify-center">
                    <img
                        src={featureImage}
                        alt="Merchant Capabilities"
                        className="w-full h-full object-cover object-top md:object-cover sm:rounded-t-3xl md:rounded-t-none md:rounded-l-3xl"
                    />
                    {/* Gradient Overlay for Mobile */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent md:hidden pointer-events-none"></div>
                </div>

                {/* Content Area */}
                <div className="px-5 py-5 sm:p-12 md:p-16 lg:p-20 flex flex-col gap-4 justify-center items-center md:items-start w-full md:w-1/2 bg-white shrink-0 order-2 z-20">
                    <div className="space-y-2 max-w-md text-center md:text-left">
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            Expand Your <br className="hidden md:block" /> Business with <span className="text-kbz-blue">KBZPay</span> Mini Apps
                        </h1>
                    </div>

                    <div className="w-full max-w-xs sm:max-w-md mt-1">
                        <button
                            onClick={onGetStarted}
                            className="w-full md:w-auto px-6 py-3.5 sm:py-5 bg-kbz-blue hover:bg-kbz-blue-hover text-white font-bold text-base md:text-lg rounded-2xl transition-all duration-300 shadow-xl hover:shadow-kbz-blue/30 active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            Get Started Now
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
