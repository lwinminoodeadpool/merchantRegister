import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

const sortMerchants = (merchantsArray) => {
    const getStatusWeight = (status) => {
        if (status === 'PENDING_REVIEW') return 1;
        if (status === 'APPROVED' || status === 'DONE') return 2;
        if (status === 'REJECTED') return 3;
        return 4;
    };
    return [...merchantsArray].sort((a, b) => {
        const weightA = getStatusWeight(a.status);
        const weightB = getStatusWeight(b.status);
        if (weightA !== weightB) return weightA - weightB;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
};

const DashboardScreen = ({ authToken, userRole, userId, onLogout }) => {
    const [activeTab, setActiveTab] = useState('applications');
    const [merchants, setMerchants] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');

    // New user form state
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('user');

    useEffect(() => {
        fetchMerchants();
        if (userRole === 'admin') {
            fetchUsers();
        }
    }, [userRole]);

    const getApiUrl = (resource) => {
        const base = import.meta.env.VITE_ADMIN_API_URL || 'https://nsncefk1ul.execute-api.eu-north-1.amazonaws.com/AdminPortalApi';
        return `${base}?resource=${resource}`;
    };

    const fetchMerchants = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(getApiUrl('merchants'), {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) return onLogout();
                throw new Error(`API Error: ${response.status}`);
            }

            const json = await response.json();
            setMerchants(sortMerchants(json.data || []));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(getApiUrl('users'), {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const json = await response.json();
                setUsers(json.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const updateMerchantStatus = async (id, newStatus) => {
        try {
            const response = await fetch(getApiUrl('merchants'), {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, actionType: 'status', status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            const updatedMerchants = merchants.map(m => m._id === id ? { ...m, status: newStatus } : m);
            setMerchants(sortMerchants(updatedMerchants));
        } catch (err) {
            alert(err.message);
        }
    };

    const assignMerchant = async (id, assignedUserId) => {
        try {
            const response = await fetch(getApiUrl('merchants'), {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, actionType: 'assign', assignedTo: assignedUserId })
            });

            if (!response.ok) throw new Error('Failed to assign');

            const updatedMerchants = merchants.map(m => m._id === id ? { ...m, assignedTo: assignedUserId } : m);
            setMerchants(sortMerchants(updatedMerchants));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(getApiUrl('users'), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUsername, password: newPassword, role: newUserRole })
            });
            
            if (!response.ok) {
                const errJson = await response.json();
                throw new Error(errJson.message || 'Failed to create user');
            }

            alert('User created successfully');
            setNewUsername('');
            setNewPassword('');
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const response = await fetch(`${getApiUrl('users')}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ actionType: 'delete', id: id })
            });
            if (!response.ok) {
                const errJson = await response.json();
                throw new Error(errJson.message || 'Failed to delete user');
            }
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleExportExcel = () => {
        if (!merchants || merchants.length === 0) {
            alert('No data to export');
            return;
        }
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
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Merchants');
        XLSX.writeFile(workbook, `merchant_applications_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'PENDING_REVIEW': return <span className="badge badge-warning badge-sm">Pending</span>;
            case 'DONE': return <span className="badge badge-success badge-sm">Done</span>;
            case 'APPROVED': return <span className="badge badge-info badge-sm">Approved</span>;
            case 'REJECTED': return <span className="badge badge-error badge-sm">Rejected</span>;
            default: return <span className="badge badge-ghost badge-sm">{status}</span>;
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
                    <h1 className="text-2xl font-black text-white glow-text tracking-wide">Partner Hub</h1>
                    {userRole === 'admin' && (
                        <div className="hidden md:flex ml-8 gap-2 bg-black/20 p-1 rounded-xl">
                            <button onClick={() => setActiveTab('applications')} className={`btn btn-sm border-none shadow-none hover:bg-white/10 ${activeTab === 'applications' ? 'bg-primary text-white' : 'bg-transparent text-gray-400'}`}>Applications</button>
                            <button onClick={() => setActiveTab('users')} className={`btn btn-sm border-none shadow-none hover:bg-white/10 ${activeTab === 'users' ? 'bg-primary text-white' : 'bg-transparent text-gray-400'}`}>Users</button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-300 hidden sm:block">Role: <span className="text-white capitalize">{userRole}</span></span>
                    <button onClick={onLogout} className="btn btn-outline btn-sm btn-error rounded-xl hover:shadow-lg transition-all">Log Out</button>
                </div>
            </header>

            {userRole === 'admin' && (
                <div className="md:hidden px-4 mb-4 flex gap-2">
                     <button onClick={() => setActiveTab('applications')} className={`flex-1 btn btn-sm ${activeTab === 'applications' ? 'btn-primary' : 'bg-black/20 text-gray-400'}`}>Apps</button>
                     <button onClick={() => setActiveTab('users')} className={`flex-1 btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'bg-black/20 text-gray-400'}`}>Users</button>
                </div>
            )}

            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto flex flex-col">
                {error && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="alert alert-error mb-6 rounded-2xl shadow-lg border border-error/20 bg-error/10 text-error-content">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{error}</span>
                    </motion.div>
                )}

                {activeTab === 'applications' && (
                    <div className="glass-panel flex-1 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative border-t border-l border-white/5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl pointer-events-none"></div>

                        <div className="px-6 py-5 border-b border-white/10 flex flex-wrap justify-between items-center gap-4 relative z-10 bg-black/20">
                            <h2 className="text-xl font-bold text-white tracking-wide">
                                {userRole === 'admin' ? 'All Applications' : 'My Assigned Applications'}
                            </h2>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <select 
                                    className="select select-sm select-bordered rounded-xl max-w-xs bg-base-200/50 text-white"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="ALL" className="bg-gray-800 text-white">All Status</option>
                                    <option value="PENDING_REVIEW" className="bg-gray-800 text-white">Pending</option>
                                    <option value="COMPLETED" className="bg-gray-800 text-white">Completed/Approved</option>
                                    <option value="REJECTED" className="bg-gray-800 text-white">Rejected</option>
                                </select>
                                <button
                                    onClick={handleExportExcel}
                                    disabled={isLoading || merchants.length === 0}
                                    className="btn btn-sm btn-success btn-outline rounded-xl"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
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
                            {(() => {
                                const filteredMerchants = merchants.filter(merchant => {
                                    if (filterStatus === 'ALL') return true;
                                    if (filterStatus === 'COMPLETED') return merchant.status === 'DONE' || merchant.status === 'APPROVED';
                                    return merchant.status === filterStatus;
                                });

                                return isLoading && merchants.length === 0 ? (
                                    <div className="flex justify-center items-center h-64">
                                        <span className="loading loading-ring loading-lg text-primary"></span>
                                    </div>
                                ) : filteredMerchants.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col justify-center items-center h-64 text-gray-400">
                                        <svg className="w-16 h-16 text-gray-600 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                        <p className="font-semibold text-lg">No merchant applications found.</p>
                                    </motion.div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                                        <AnimatePresence>
                                            {filteredMerchants.map((merchant, index) => (
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
                                                    <div className="mb-3 flex justify-between items-center">
                                                        <span className="badge badge-outline badge-sm opacity-70 border-white/20 text-gray-300">{merchant.businessType}</span>
                                                        {userRole === 'admin' && (
                                                            <select 
                                                                className="select select-xs select-bordered bg-gray-800 text-white w-32"
                                                                value={merchant.assignedTo || ''}
                                                                onChange={(e) => assignMerchant(merchant._id, e.target.value)}
                                                            >
                                                                <option value="" disabled className="bg-gray-800 text-gray-400">Unassigned</option>
                                                                {users.filter(u => u.role === 'user').map(u => (
                                                                    <option key={u._id} value={u._id} className="bg-gray-800 text-white">{u.username}</option>
                                                                ))}
                                                            </select>
                                                        )}
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
                                                </div>
                                            </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && userRole === 'admin' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                        <div className="lg:col-span-1">
                            <div className="glass-panel p-6 rounded-3xl shadow-xl border-t border-l border-white/5">
                                <h3 className="text-lg font-bold text-white mb-4">Create New User</h3>
                                <form onSubmit={handleCreateUser} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1">Username</label>
                                        <input type="text" required value={newUsername} onChange={e => setNewUsername(e.target.value)} className="input input-sm input-bordered w-full bg-base-200/50 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
                                        <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input input-sm input-bordered w-full bg-base-200/50 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1">Role</label>
                                        <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="select select-sm select-bordered w-full bg-base-200/50 text-white">
                                            <option value="user" className="bg-gray-800">Regular User</option>
                                            <option value="admin" className="bg-gray-800">Admin</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-sm btn-primary w-full mt-2">Create User</button>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="glass-panel p-6 rounded-3xl shadow-xl border-t border-l border-white/5 overflow-x-auto">
                                <h3 className="text-lg font-bold text-white mb-4">User Accounts</h3>
                                <table className="table table-sm w-full">
                                    <thead>
                                        <tr className="text-gray-400 border-white/10">
                                            <th>Username</th>
                                            <th>Role</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id} className="border-white/5 hover:bg-white/5">
                                                <td className="text-white font-medium">{u.username}</td>
                                                <td><span className={`badge badge-sm ${u.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>{u.role}</span></td>
                                                <td className="text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    {u._id !== userId && (
                                                        <button onClick={() => handleDeleteUser(u._id)} className="btn btn-xs btn-error btn-outline">Delete</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr><td colSpan="4" className="text-center text-gray-500 py-4">No users found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </motion.div>
    );
};

export default DashboardScreen;
