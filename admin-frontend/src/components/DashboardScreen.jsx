import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardScreen = ({ authToken, onLogout }) => {
    const [merchants, setMerchants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMerchants();
    }, []);

    const fetchMerchants = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const API_URL = import.meta.env.VITE_ADMIN_API_URL || 'https://nsncefk1ul.execute-api.eu-north-1.amazonaws.com/AdminPortalApi';

            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    onLogout(); // Token expired or invalid
                    return;
                }
                let errorMsg = `API Error: ${response.status}`;
                try {
                    const errorJson = await response.json();
                    if (errorJson.error) errorMsg += ` - ${errorJson.error}`;
                    if (errorJson.message) errorMsg += ` (${errorJson.message})`;
                } catch (e) { }

                throw new Error(errorMsg);
            }

            const json = await response.json();
            setMerchants(json.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateMerchantStatus = async (id, newStatus) => {
        try {
            const API_URL = import.meta.env.VITE_ADMIN_API_URL || 'https://nsncefk1ul.execute-api.eu-north-1.amazonaws.com/AdminPortalApi';
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            // Update local state without refreshing entire list
            setMerchants(merchants.map(m => m._id === id ? { ...m, status: newStatus } : m));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleExportExcel = () => {
        if (!merchants || merchants.length === 0) {
            alert('No data to export');
            return;
        }

        // Prepare data for Excel
        const dataToExport = merchants.map((m, index) => ({
            'No.': index + 1,
            'Business Name': m.businessName,
            'Type': m.businessType,
            'Description': m.description || '',
            'Owner Name': m.contactDetails?.ownerName || '',
            'Phone': m.contactDetails?.phoneNumber || '',
            'Email': m.contactDetails?.email || '',
            'Address': m.contactDetails?.address || '',
            'Status': m.status,
            'Submission Date': new Date(m.createdAt).toLocaleString(),
            'Documents': m.documents?.map(doc => {
                const name = doc.fieldName === 'businessLicense' ? 'License' : doc.fieldName === 'nrcFront' ? 'ID Front' : doc.fieldName;
                return name + ': ' + doc.url;
            }).join(' | ') || 'None'
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Merchants');

        // Set column widths
        const wscols = [
            { wch: 5 },  // No.
            { wch: 25 }, // Business Name
            { wch: 20 }, // Type
            { wch: 30 }, // Description
            { wch: 20 }, // Owner Name
            { wch: 15 }, // Phone
            { wch: 25 }, // Email
            { wch: 40 }, // Address
            { wch: 15 }, // Status
            { wch: 20 }, // Submission Date
            { wch: 60 }  // Documents
        ];
        worksheet['!cols'] = wscols;

        // Export file
        XLSX.writeFile(workbook, `merchant_applications_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'PENDING_REVIEW':
                return <span className="badge badge-warning badge-sm">Pending</span>;
            case 'DONE':
                return <span className="badge badge-success badge-sm">Done</span>;
            case 'APPROVED':
                return <span className="badge badge-info badge-sm">Approved</span>;
            case 'REJECTED':
                return <span className="badge badge-error badge-sm">Rejected</span>;
            default:
                return <span className="badge badge-ghost badge-sm">{status}</span>;
        }
    };

    const StatusDropdown = ({ merchant }) => {
        return (
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-xs m-1 gap-2 flex items-center">
                    <StatusBadge status={merchant.status} />
                    <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-300 rounded-box w-40 text-sm border border-base-100">
                    <li><button onClick={() => updateMerchantStatus(merchant._id, 'PENDING_REVIEW')} className="hover:text-warning transition-colors">Pending</button></li>
                    <li><button onClick={() => updateMerchantStatus(merchant._id, 'DONE')} className="hover:text-success transition-colors">Mark as Done</button></li>
                    <li><button onClick={() => updateMerchantStatus(merchant._id, 'APPROVED')} className="hover:text-info transition-colors">Approve</button></li>
                    <li><button onClick={() => updateMerchantStatus(merchant._id, 'REJECTED')} className="hover:text-error transition-colors">Reject</button></li>
                </ul>
            </div>
        );
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-vibrant-gradient flex flex-col"
            data-theme="dark"
        >
            <header className="glass-panel mx-4 mt-4 rounded-2xl flex items-center justify-between px-6 py-4 shadow-xl mb-6">
                <div className="flex items-center gap-4">
                    <motion.div 
                        initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </motion.div>
                    <h1 className="text-2xl font-black text-white glow-text tracking-wide">Admin Portal</h1>
                </div>
                <button
                    onClick={onLogout}
                    className="btn btn-outline btn-sm btn-error rounded-xl hover:shadow-lg transition-all"
                >
                    Log Out
                </button>
            </header>

            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto flex flex-col">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="alert alert-error mb-6 rounded-2xl shadow-lg border border-error/20 bg-error/10 text-error-content"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Error loading merchants: {error}</span>
                    </motion.div>
                )}

                <div className="glass-panel flex-1 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative border-t border-l border-white/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl pointer-events-none"></div>

                    <div className="px-6 py-5 border-b border-white/10 flex flex-wrap justify-between items-center gap-4 relative z-10 bg-black/20">
                        <h2 className="text-xl font-bold text-white tracking-wide">Recent Applications</h2>
                        <div className="flex gap-3">
                            <button
                                onClick={handleExportExcel}
                                disabled={isLoading || merchants.length === 0}
                                className="btn btn-sm btn-success btn-outline rounded-xl"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export
                            </button>
                            <button
                                onClick={fetchMerchants}
                                disabled={isLoading}
                                className="btn btn-sm btn-primary rounded-xl btn-vibrant"
                            >
                                {isLoading ? <span className="loading loading-spinner loading-xs"></span> : 'Refresh'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto relative z-10 p-2">
                        {isLoading && merchants.length === 0 ? (
                            <div className="flex justify-center items-center h-64">
                                <span className="loading loading-ring loading-lg text-primary"></span>
                            </div>
                        ) : merchants.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="flex flex-col justify-center items-center h-64 text-gray-400"
                            >
                                <svg className="w-16 h-16 text-gray-600 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="font-semibold text-lg">No merchant applications found.</p>
                                <p className="text-sm opacity-70">New applications will appear here.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                                <AnimatePresence>
                                    {merchants.map((merchant, index) => (
                                        <motion.div 
                                            key={merchant._id} 
                                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="card bg-base-200/40 backdrop-blur-md shadow-xl border border-white/5 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-primary/10 overflow-hidden"
                                        >
                                            <div className="card-body p-5">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h2 className="card-title text-white text-lg font-bold truncate pr-2 w-full">
                                                        {merchant.businessName}
                                                    </h2>
                                                    <div className="shrink-0">
                                                        <StatusDropdown merchant={merchant} />
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <span className="badge badge-outline badge-sm opacity-70 border-white/20 text-gray-300">{merchant.businessType}</span>
                                                </div>
                                                
                                                <p className="text-sm text-gray-400 line-clamp-2 mb-4 min-h-[40px]">
                                                    {merchant.description || <span className="italic opacity-50">No description provided</span>}
                                                </p>

                                                <div className="divider my-1 opacity-20"></div>

                                                <div className="text-xs space-y-2 text-gray-300">
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                        <span className="truncate">{merchant.contactDetails?.ownerName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                        <span>{merchant.contactDetails?.phoneNumber}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                        <span className="truncate">{merchant.contactDetails?.email}</span>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                        <span className="line-clamp-2">{merchant.contactDetails?.address || <span className="italic opacity-50">No address provided</span>}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-gray-400">
                                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        <span>Submitted: {new Date(merchant.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-5 pt-4 border-t border-white/5">
                                                    <p className="text-xs font-semibold text-gray-500 mb-2.5 tracking-wider uppercase">Documents</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {merchant.documents && merchant.documents.length > 0 ? (
                                                            merchant.documents.map((doc, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={doc.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="badge badge-primary badge-outline badge-sm hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                                                >
                                                                    {doc.fieldName === 'businessLicense' ? 'License' : doc.fieldName === 'nrcFront' ? 'ID Front' : doc.fieldName}
                                                                </a>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-600 italic text-xs">No documents attached</span>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </motion.div>
    );
};

export default DashboardScreen;
