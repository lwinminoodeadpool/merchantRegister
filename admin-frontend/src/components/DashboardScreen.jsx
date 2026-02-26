import React, { useState, useEffect } from 'react';

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
            // Replace with actual deployed API Gateway stage URL
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

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'PENDING_REVIEW':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">Pending</span>;
            case 'DONE':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200 shadow-sm">Done</span>;
            case 'APPROVED':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">Approved</span>;
            case 'REJECTED':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200 shadow-sm">Rejected</span>;
            default:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">{status}</span>;
        }
    };

    const StatusDropdown = ({ merchant }) => {
        const [isOpen, setIsOpen] = useState(false);

        const handleSelect = (newStatus) => {
            updateMerchantStatus(merchant._id, newStatus);
            setIsOpen(false);
        };

        return (
            <div className="relative inline-block text-left">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 hover:bg-gray-50 p-1 -ml-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-kbz-blue focus:ring-opacity-50"
                >
                    <StatusBadge status={merchant.status} />
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                        <div className="origin-top-left absolute left-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 overflow-hidden divide-y divide-gray-100">
                            <div className="py-1">
                                <button onClick={() => handleSelect('PENDING_REVIEW')} className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-900 w-full text-left transition-colors">Pending</button>
                                <button onClick={() => handleSelect('DONE')} className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-900 w-full text-left transition-colors">Mark as Done</button>
                                <button onClick={() => handleSelect('APPROVED')} className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 w-full text-left transition-colors">Approve</button>
                                <button onClick={() => handleSelect('REJECTED')} className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 w-full text-left transition-colors">Reject</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-kbz-gray-bg flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-kbz-blue shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-white">Merchant Application Portal</h1>
                        </div>
                        <button
                            onClick={onLogout}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">Error loading merchants: {error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
                    <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                        <button
                            onClick={fetchMerchants}
                            disabled={isLoading}
                            className="text-sm text-kbz-blue font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 border border-blue-100"
                        >
                            {isLoading ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                    </div>

                    <div className="overflow-x-auto flex-1 h-full">
                        {isLoading && merchants.length === 0 ? (
                            <div className="flex justify-center items-center h-64">
                                <svg className="animate-spin h-8 w-8 text-kbz-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : merchants.length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="font-medium">No merchant applications found.</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 bg-opacity-75 sticky top-0 z-10 backdrop-blur-sm">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Info</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Details</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submission Date</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attached Documents</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {merchants.map((merchant) => (
                                        <tr key={merchant._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{merchant.businessName}</div>
                                                        <div className="text-sm text-gray-500 mt-0.5">{merchant.businessType}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{merchant.contactDetails?.ownerName}</div>
                                                <div className="text-sm text-gray-500 mt-0.5">{merchant.contactDetails?.phoneNumber}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{merchant.contactDetails?.email}</div>
                                                {merchant.contactDetails?.address && (
                                                    <div className="text-xs text-gray-400 mt-0.5 whitespace-pre-wrap">{merchant.contactDetails.address}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusDropdown merchant={merchant} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(merchant.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {merchant.documents && merchant.documents.length > 0 ? (
                                                    <div className="flex flex-col gap-2">
                                                        {merchant.documents.map((doc, i) => (
                                                            <a
                                                                key={i}
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-kbz-blue hover:text-kbz-blue-hover hover:underline flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-100 w-max"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                                <span>{doc.fieldName === 'businessLicense' ? 'License' : doc.fieldName === 'nrcFront' ? 'ID Front' : doc.fieldName}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">No documents attached</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main >
        </div >
    );
};

export default DashboardScreen;
