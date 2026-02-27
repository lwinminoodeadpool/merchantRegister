import React, { useState } from 'react';

const RegistrationForm = ({ formData, setFormData, onNext, onCancel }) => {
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.businessName.trim()) newErrors.businessName = 'Business Name is required';
        if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner Name is required';
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone Number is required';
        } else if (!/^\d+$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Numbers only';
        } else if (formData.phoneNumber.length !== 9 && formData.phoneNumber.length !== 11) {
            newErrors.phoneNumber = 'Must be 9 or 11 digits';
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Valid Email is required';
        }
        if (!formData.address?.trim()) {
            newErrors.address = 'Business Address is required';
        }
        // Business License is now optional

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (validate()) {
            onNext();
        }
    };

    const handleFileChange = (e, field) => {
        if (e.target.files.length > 0) {
            setFormData({ ...formData, [field]: e.target.files[0] });
        }
    };

    const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kbz-blue/30 focus:border-kbz-blue outline-none transition-all placeholder:text-gray-400 text-sm";
    const labelClass = "block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide";

    return (
        <div className="flex flex-col items-center min-h-screen bg-kbz-gray-bg py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="bg-kbz-blue px-6 py-5 flex items-center justify-between">
                    <h2 className="text-white font-bold text-lg">Merchant Registration</h2>
                    <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium">Step 1 of 2</span>
                </div>

                <form onSubmit={handleNext} className="p-6 md:p-8 space-y-8">

                    {/* Business Details Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-kbz-blue flex items-center justify-center font-bold text-xs">1</div>
                            <h3 className="font-semibold text-gray-800">Business Details</h3>
                        </div>

                        <div>
                            <label className={labelClass}>Business Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. Acme Corp"
                                className={inputClass}
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            />
                            {errors.businessName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.businessName}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Business Type <span className="text-red-500">*</span></label>
                            <select
                                className={inputClass}
                                value={formData.businessType}
                                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                            >
                                <option value="Shopping">Shopping</option>
                                <option value="Travel">Travel</option>
                                <option value="Food">Food</option>
                                <option value="Astrology">Astrology</option>
                                <option value="Leisure">Leisure</option>
                                <option value="Delivery">Delivery</option>
                                <option value="General">General</option>
                                <option value="Retail">Retail</option>
                            </select>
                        </div>
                    </div>

                    {/* Contact Details Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-kbz-blue flex items-center justify-center font-bold text-xs">2</div>
                            <h3 className="font-semibold text-gray-800">Contact Details</h3>
                        </div>

                        <div>
                            <label className={labelClass}>Contact Person Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Maung Maung"
                                className={inputClass}
                                value={formData.ownerName}
                                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                            />
                            {errors.ownerName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.ownerName}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    placeholder="09..."
                                    className={inputClass}
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })} // Numeric strictly
                                    maxLength={11}
                                />
                                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phoneNumber}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    placeholder="test@example.com"
                                    className={inputClass}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Business Address <span className="text-red-500">*</span></label>
                            <textarea
                                rows={2}
                                placeholder="No. 123, Main Road, Yangon..."
                                className={`${inputClass} resize-none`}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                            {errors.address && <p className="text-red-500 text-xs mt-1 font-medium">{errors.address}</p>}
                        </div>
                    </div>

                    {/* Documents & KYC Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-kbz-blue flex items-center justify-center font-bold text-xs">3</div>
                            <h3 className="font-semibold text-gray-800">KYC & Documents</h3>
                        </div>

                        <div>
                            <label className={labelClass}>Business License Document</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl hover:border-kbz-blue transition-colors bg-gray-50">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-10 w-10 text-gray-300" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="license-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-kbz-blue hover:text-kbz-blue-hover focus-within:outline-none">
                                            <span>Upload a file</span>
                                            <input id="license-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'businessLicense')} accept="image/*,.pdf" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">{formData.businessLicense ? formData.businessLicense.name : 'PNG, JPG, PDF up to 10MB'}</p>
                                </div>
                            </div>
                            {errors.businessLicense && <p className="text-red-500 text-xs mt-1 font-medium text-center">{errors.businessLicense}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>NRC or Director ID (Optional)</label>
                            <input
                                type="file"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-kbz-blue hover:file:bg-blue-100 transition-colors"
                                onChange={(e) => handleFileChange(e, 'nrcFront')}
                                accept="image/*,.pdf"
                            />
                            {formData.nrcFront && <p className="text-xs text-green-600 mt-2 ml-2 font-medium">✓ {formData.nrcFront.name} attached</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Additional Details (Optional)</label>
                            <textarea
                                rows={2}
                                placeholder="Any additional address or registration details..."
                                className={`${inputClass} resize-none`}
                                value={formData.kycData}
                                onChange={(e) => setFormData({ ...formData, kycData: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t border-gray-100 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-1/3 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="w-2/3 py-3 px-4 bg-kbz-blue hover:bg-kbz-blue-hover text-white font-semibold rounded-xl shadow-md transition-all duration-200 active:scale-[0.98]"
                        >
                            Review Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;
