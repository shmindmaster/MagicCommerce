"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '../context/user';

export default function AuthPage() {
    const { login } = useUser();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        picture: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!formData.email) {
            setError('Email is required');
            setIsLoading(false);
            return;
        }

        try {
            const result = await login(formData.email, ''); // Using empty password for now
            if (result.success) {
                router.push('/');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (error) {
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div id="AuthPage" className="w-full min-h-screen bg-white">
            <div className="w-full flex items-center justify-center p-5 border-b border-gray-300">
                <Link href="/" className="min-w-[170px]">
                    <img width="170" src="/images/eCom.png" alt="Logo"/>
                </Link>
            </div>

            <div className="w-full flex items-center justify-center p-5 border-b border-gray-300">
                <h1 className="text-xl font-semibold">Login / Register</h1>
            </div>

            <div className="max-w-[400px] mx-auto px-2 py-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            placeholder="Enter your name (optional)"
                        />
                    </div>

                    <div>
                        <label htmlFor="picture" className="block text-sm font-medium text-gray-700 mb-1">
                            Picture URL
                        </label>
                        <input
                            type="url"
                            id="picture"
                            name="picture"
                            value={formData.picture}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            placeholder="Enter picture URL (optional)"
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Loading...' : 'Login / Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}