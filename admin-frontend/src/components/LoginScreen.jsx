import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
            const API_URL = import.meta.env.VITE_ADMIN_API_URL || 'https://nsncefk1ul.execute-api.eu-north-1.amazonaws.com/AdminPortalApi';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                onLogin(data.token, data.role, data.id);
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
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-md w-full z-10"
            >
                <div className="glass-panel p-10">
                    <div className="mb-8">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mx-auto h-20 w-20 flex items-center justify-center overflow-hidden bg-white/5 rounded-2xl border border-white/10 p-3 shadow-inner"
                        >
                            <img src={logo} alt="KBZPay Logo" className="h-full w-full object-contain filter brightness-110" />
                        </motion.div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight glow-text">
                            Admin Portal
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-400 font-medium">
                            Sign in to manage merchant applications
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="custom-input block w-full px-4 py-3 placeholder-gray-500 text-white"
                                    placeholder="Enter admin username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="custom-input block w-full px-4 py-3 placeholder-gray-500 text-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-md shadow-inner"
                            >
                                <p className="text-sm text-red-400 font-medium">{error}</p>
                            </motion.div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-vibrant w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm transition-all"
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
            </motion.div>

            <div className="fixed bottom-6 text-center w-full z-10 pointer-events-none">
                <p className="text-xs text-gray-500 font-medium">Secured by KBZPay Mini App</p>
            </div>
        </div>
    );
};

export default LoginScreen;
