import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = ({ onSwitchToSignup, onClose, onLoginSuccess, onSwitchToForgot }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        setErrors({}); // Clear any previous errors

        try {
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken })
                },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password
                })
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (response.ok) {
                // Store user data in localStorage (optional)
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Call success callback if provided
                if (onLoginSuccess) {
                    onLoginSuccess(data.user, data.redirect);
                }
                
                // Redirect based on role
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    // Fallback redirect logic
                    if (data.user.role === 'admin') {
                        window.location.href = '/admin-dashboard';
                    } else {
                        window.location.href = '/user-dashboard';
                    }
                }
                
                // Clear form and close modal
                setFormData({ email: '', password: '' });
                if (onClose) onClose();
                
            } else {
                // Handle validation errors
                if (response.status === 422 && data.errors) {
                    setErrors(data.errors);
                } else {
                    alert(data.message || "Login failed. Please try again.");
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            alert("Network error occurred. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                    />
                    {errors.email && (
                        <div className="mt-1">
                            {Array.isArray(errors.email) 
                                ? errors.email.map((error, idx) => (
                                    <p key={idx} className="text-sm text-red-600">{error}</p>
                                  ))
                                : <p className="text-sm text-red-600">{errors.email}</p>
                            }
                        </div>
                    )}
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
                                errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                                <EyeIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <div className="mt-1">
                            {Array.isArray(errors.password) 
                                ? errors.password.map((error, idx) => (
                                    <p key={idx} className="text-sm text-red-600">{error}</p>
                                  ))
                                : <p className="text-sm text-red-600">{errors.password}</p>
                            }
                        </div>
                    )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember"
                            name="remember"
                            type="checkbox"
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                            Remember me
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (onClose) onClose();
                            if (onSwitchToForgot) onSwitchToForgot();
                        }}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                        Forgot password?
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center">
                <p className="text-gray-600">
                    Don't have an account?{' '}
                    <button
                        onClick={onSwitchToSignup}
                        className="text-green-600 hover:text-green-700 font-medium"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;