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
        <div className="flex flex-col items-center min-h-screen bg-kbz-gray-bg py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="bg-kbz-blue px-6 py-5 flex items-center justify-between">
                    <h2 className="text-white font-bold text-lg">Review Information</h2>
                    <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium">Step 2 of 2</span>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                    <p className="text-sm text-gray-600 font-medium">Please verify your details before submitting to KBZPay.</p>

                    <div className="bg-white border text-left border-gray-200 rounded-2xl p-4 shadow-inner">
                        <h3 className="font-bold text-kbz-blue mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            Business application
                        </h3>

                        <div className="space-y-1">
                            <DataRow label="Business Name" value={formData.businessName} />
                            <DataRow label="Business Type" value={formData.businessType} />
                            <DataRow label="Contact Person Name" value={formData.ownerName} />
                            <DataRow label="Phone Number" value={formData.phoneNumber} />
                            <DataRow label="Email Address" value={formData.email} />
                            <DataRow label="Business Address" value={formData.address} />
                            <DataRow label="KYC Info" value={formData.kycData} />
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 text-left">
                            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-2 px-2">Attached Documents</span>
                            <div className="px-2 space-y-2">
                                {formData.businessLicense && (
                                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                        <span className="truncate font-medium flex-1">License: {formData.businessLicense.name}</span>
                                    </div>
                                )}
                                {formData.nrcFront && (
                                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                        <span className="truncate font-medium flex-1">ID: {formData.nrcFront.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="w-1/3 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
                        >
                            Edit Details
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-2/3 py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 active:scale-[0.98] flex justify-center items-center disabled:opacity-70 disabled:active:scale-100"
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Confirm & Submit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewConfirm;
