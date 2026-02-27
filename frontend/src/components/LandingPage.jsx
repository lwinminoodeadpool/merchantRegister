import React from 'react';
import featureImage from '../assets/New 375x667.jpg';


const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-kbz-gray-bg sm:p-4 text-center relative overflow-hidden">
            {/* Decorative Blur Background Element */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-kbz-blue opacity-5 rounded-full blur-3xl pointer-events-none hidden sm:block"></div>

            <div className="w-full min-h-[100dvh] md:min-h-0 sm:h-auto max-w-sm bg-white sm:rounded-3xl shadow-none sm:shadow-xl overflow-y-auto overflow-x-hidden border-0 sm:border border-gray-100 flex flex-col z-10 transition-transform sm:hover:scale-[1.01] duration-300">

                {/* Feature Image */}
                <div className="w-full bg-white shrink-0">
                    <img
                        src={featureImage}
                        alt="Merchant Capabilities"
                        className="w-full h-auto object-cover sm:rounded-t-3xl"
                    />
                </div>

                {/* Content Area */}
                <div className="p-6 pb-10 sm:p-8 flex flex-col gap-6 items-center shrink-0 bg-white">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Expand Your Business</h1>
                        <p className="text-sm text-gray-500 font-medium">Join KBZPay Mini Apps</p>
                    </div>

                    <button
                        onClick={onGetStarted}
                        className="w-full py-4 px-6 bg-kbz-blue hover:bg-kbz-blue-hover text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                        Get Started
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
