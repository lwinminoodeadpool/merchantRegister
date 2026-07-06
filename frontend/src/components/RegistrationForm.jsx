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

    const inputClass = "w-full h-[52px] px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kbz-blue/30 focus:border-kbz-blue outline-none transition-all placeholder:text-gray-400 text-sm flex items-center";
    const selectClass = `${inputClass} appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19.5%208.25l-7.5%207.5-7.5-7.5%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat`;
    const labelClass = "block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide";
    const textareaClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kbz-blue/30 focus:border-kbz-blue outline-none transition-all placeholder:text-gray-400 text-sm resize-none";

    return (
        <div className="flex flex-col items-center min-h-screen bg-kbz-gray-bg sm:py-8 lg:py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl bg-white rounded-none sm:rounded-3xl shadow-none sm:shadow-xl border-x-0 sm:border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="bg-kbz-blue px-5 py-5 sm:px-8 sm:py-6 flex items-center justify-between gap-3">
                    <div className="flex-1">
                        <h2 className="text-white font-extrabold text-lg sm:text-2xl leading-tight">Merchant Registration</h2>
                        <p className="text-blue-100 text-sm mt-1 font-medium hidden sm:block">Fill in your business details to get started</p>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 rounded-full font-bold border border-white/10 shrink-0 whitespace-nowrap">Step 1 of 2</span>
                </div>

                <form onSubmit={handleNext} className="p-8 sm:p-10 lg:p-12 space-y-12">

                    {/* Business Details Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-kbz-blue flex items-center justify-center font-bold text-sm">1</div>
                            <h3 className="font-bold text-gray-800 text-lg">Business Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            <div className="md:col-span-2 lg:col-span-1">
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

                            <div className="md:col-span-2 lg:col-span-1">
                                <label className={labelClass}>Business Type <span className="text-red-500">*</span></label>
                                <select
                                    className={selectClass}
                                    value={formData.businessType}
                                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                >
                                    <option value="Astrology">Astrology</option>
                                    <option value="Delivery">Delivery</option>
                                    <option value="DevelopmentPartner">Development Partner</option>
                                    <option value="Education">Education</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Food">Food</option>
                                    <option value="Health">Health</option>
                                    <option value="Home">Home</option>
                                    <option value="Jewelry">Jewelry</option>
                                    <option value="Leisure">Leisure</option>
                                    <option value="LifeStyle">LifeStyle</option>
                                    <option value="Other">Other</option>
                                    <option value="Travel">Travel</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contact Details Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-kbz-blue flex items-center justify-center font-bold text-sm">2</div>
                            <h3 className="font-bold text-gray-800 text-lg">Contact Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
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

                            <div>
                                <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    placeholder="09..."
                                    className={inputClass}
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
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

                            <div className="md:col-span-2 lg:col-span-1">
                                <label className={labelClass}>Business Address <span className="text-red-500">*</span></label>
                                <textarea
                                    rows={3}
                                    placeholder="No. 123, Main Road, Yangon..."
                                    className={`${textareaClass} min-h-[80px]`}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1 font-medium">{errors.address}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Description</label>
                                <textarea
                                    rows={5}
                                    placeholder="Please briefly tell us about your business and your preferred KBZPay partnership service."
                                    className={`${textareaClass} min-h-[140px]`}
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>



                    {/* Actions */}
                    <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full sm:w-1/3 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all duration-200"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-2/3 py-4 px-6 bg-kbz-blue hover:bg-kbz-blue-hover text-white font-bold rounded-2xl shadow-lg hover:shadow-kbz-blue/30 transition-all duration-200 active:scale-[0.99]"
                        >
                            Review & Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;
