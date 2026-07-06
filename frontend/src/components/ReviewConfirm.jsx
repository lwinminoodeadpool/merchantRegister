import React, { useState } from 'react';

const ReviewConfirm = ({ formData, onBack, onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await onSubmit();
        setIsSubmitting(false);
    };

    const DataRow = ({ label, value }) => (
        <div className="flex flex-col py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-md transition-colors">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{label}</span>
            <span className="text-sm font-medium text-gray-800 break-words">{value || <span className="text-gray-400 italic">Not Provided</span>}</span>
        </div>
    );

    return (
        <div className="flex flex-col items-center min-h-screen bg-kbz-gray-bg sm:py-8 lg:py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl bg-white rounded-none sm:rounded-3xl shadow-none sm:shadow-xl border-x-0 sm:border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="bg-kbz-blue px-5 py-5 sm:px-8 sm:py-6 flex items-center justify-between gap-3">
                    <div className="flex-1">
                        <h2 className="text-white font-extrabold text-lg sm:text-2xl leading-tight">Review Information</h2>
                        <p className="text-blue-100 text-sm mt-1 font-medium hidden sm:block">Double check your details before submission</p>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 rounded-full font-bold border border-white/10 shrink-0 whitespace-nowrap">Step 2 of 2</span>
                </div>

                <div className="p-8 sm:p-10 lg:p-12 space-y-10">
                    <div className="flex items-center gap-3 text-kbz-blue bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        <p className="text-sm font-bold">Please verify your details before submitting to KBZPay.</p>
                    </div>

                    <div className="bg-white border text-left border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                        <h3 className="font-extrabold text-gray-800 mb-8 border-b border-gray-100 pb-4 flex items-center gap-3 text-lg">
                            <div className="w-10 h-10 bg-kbz-blue rounded-xl flex items-center justify-center text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                            </div>
                            Business Application Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                            <DataRow label="Business Name" value={formData.businessName} />
                            <DataRow label="Business Type" value={formData.businessType} />
                            <DataRow label="Contact Person" value={formData.ownerName} />
                            <DataRow label="Phone Number" value={formData.phoneNumber} />
                            <DataRow label="Email Address" value={formData.email} />
                            <div className="md:col-span-2">
                                <DataRow label="Business Address" value={formData.address} />
                            </div>
                            <div className="md:col-span-2">
                                <DataRow label="Description" value={formData.description} />
                            </div>

                        </div>


                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="w-full sm:w-1/3 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all duration-200 disabled:opacity-50"
                        >
                            Edit Details
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full sm:w-2/3 py-4 px-6 bg-kbz-blue hover:bg-kbz-blue-hover text-white font-extrabold rounded-2xl shadow-xl hover:shadow-kbz-blue/30 transition-all duration-200 active:scale-[0.99] flex justify-center items-center disabled:opacity-70 disabled:active:scale-100 gap-3"
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    Confirm & Submit Application
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewConfirm;
