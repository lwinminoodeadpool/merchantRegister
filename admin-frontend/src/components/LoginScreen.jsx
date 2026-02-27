import React, { useState } from 'react';
import logo from '../assets/kbzpay-logo.png';

const LoginScreen = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Replace with actual deployed API Gateway stage URL
            const API_URL = import.meta.env.VITE_ADMIN_API_URL || 'https://nsncefk1ul.execute-api.eu-north-1.amazonaws.com/AdminPortalApi';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                onLogin(data.token);
            } else {
                setError(data.message || 'Login failed. Please check credentials.');
            }
        } catch (err) {
            setError('Network error. Could not reach authentication server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-kbz-gray-bg">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <div className="mx-auto h-20 w-20 flex items-center justify-center overflow-hidden">
                        <img src={logo} alt="KBZPay Logo" className="h-full w-full object-contain" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-kbz-blue tracking-tight">
                        Admin Portal
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500 font-medium">
                        Sign in to manage merchant applications
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-kbz-blue focus:border-transparent transition-all"
                                placeholder="Enter admin username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-kbz-blue focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-kbz-blue hover:bg-kbz-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kbz-blue transition-all disabled:opacity-70 shadow-md hover:shadow-lg active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : "Sign In"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="fixed bottom-6 text-center w-full">
                <p className="text-xs text-gray-400 font-medium">Secured by KBZPay Mini App</p>
            </div>
        </div>
    );
};

export default LoginScreen;
