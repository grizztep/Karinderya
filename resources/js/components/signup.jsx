import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Signup = ({ onSwitchToLogin, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        contactNumber: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        
        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (!formData.address.trim()) {
            newErrors.address = 'Full address is required';
        }
        
        if (!formData.contactNumber) {
            newErrors.contactNumber = 'Contact number is required';
        } else if (!/^(\+63|0)?[9]\d{9}$/.test(formData.contactNumber.replace(/\s/g, ''))) {
            newErrors.contactNumber = 'Please enter a valid Philippine mobile number';
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
            
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken })
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    address: formData.address.trim(),
                    contactNumber: formData.contactNumber.replace(/\s/g, '') // Remove spaces
                })
            });

            const data = await response.json();
            console.log('Response:', data);

            if (response.ok) {
                alert("Account created successfully! Welcome aboard!");
                // Clear form
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    address: '',
                    contactNumber: ''
                });
                onClose && onClose();
            } else {
                // Handle validation errors
                if (response.status === 422 && data.errors) {
                    setErrors(data.errors);
                } else {
                    alert(data.message || "Registration failed. Please try again.");
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert("Network error occurred. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, text: '' };
        
        let strength = 0;
        const checks = [
            password.length >= 8,
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /\d/.test(password),
            /[!@#$%^&*]/.test(password)
        ];
        
        strength = checks.filter(Boolean).length;
        
        const strengthTexts = {
            0: '',
            1: 'Very Weak',
            2: 'Weak',
            3: 'Fair',
            4: 'Good',
            5: 'Strong'
        };
        
        const strengthColors = {
            0: '',
            1: 'text-red-500',
            2: 'text-red-400',
            3: 'text-yellow-500',
            4: 'text-blue-500',
            5: 'text-green-500'
        };
        
        return {
            strength,
            text: strengthTexts[strength],
            color: strengthColors[strength],
            percentage: (strength / 5) * 100
        };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="space-y-6">
            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                    />
                    {errors.name && (
                        <div className="mt-1">
                            {Array.isArray(errors.name) 
                                ? errors.name.map((error, idx) => (
                                    <p key={idx} className="text-sm text-red-600">{error}</p>
                                  ))
                                : <p className="text-sm text-red-600">{errors.name}</p>
                            }
                        </div>
                    )}
                </div>

                {/* Email */}
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

                {/* Password */}
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
                            placeholder="Create a password"
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
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <div className="mt-2">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            passwordStrength.strength <= 2 ? 'bg-red-500' :
                                            passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                                            passwordStrength.strength === 4 ? 'bg-blue-500' : 'bg-green-500'
                                        }`}
                                        style={{ width: `${passwordStrength.percentage}%` }}
                                    ></div>
                                </div>
                                <span className={`text-sm font-medium ${passwordStrength.color}`}>
                                    {passwordStrength.text}
                                </span>
                            </div>
                        </div>
                    )}
                    
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

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
                                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? (
                                <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                                <EyeIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <div className="flex items-center gap-2 mt-1">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Passwords match</span>
                        </div>
                    )}
                    {errors.confirmPassword && (
                        <div className="mt-1">
                            {Array.isArray(errors.confirmPassword) 
                                ? errors.confirmPassword.map((error, idx) => (
                                    <p key={idx} className="text-sm text-red-600">{error}</p>
                                  ))
                                : <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                            }
                        </div>
                    )}
                </div>

                {/* Full Address */}
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Address
                    </label>
                    <textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none ${
                            errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your complete address"
                    />
                    {errors.address && (
                        <div className="mt-1">
                            {Array.isArray(errors.address) 
                                ? errors.address.map((error, idx) => (
                                    <p key={idx} className="text-sm text-red-600">{error}</p>
                                  ))
                                : <p className="text-sm text-red-600">{errors.address}</p>
                            }
                        </div>
                    )}
                </div>

                {/* Contact Number */}
                <div>
                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number
                    </label>
                    <input
                        type="tel"
                        id="contactNumber"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
                            errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="09XX XXX XXXX"
                    />
                    {errors.contactNumber && (
                        <div className="mt-1">
                            {Array.isArray(errors.contactNumber) 
                                ? errors.contactNumber.map((error, idx) => (
                                    <p key={idx} className="text-sm text-red-600">{error}</p>
                                  ))
                                : <p className="text-sm text-red-600">{errors.contactNumber}</p>
                            }
                        </div>
                    )}
                </div>

                {/* Terms and Privacy */}
                <div className="flex items-start">
                    <input
                        type="checkbox"
                        id="terms"
                        required
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="terms" className="ml-3 block text-sm text-gray-700">
                        I agree to the{' '}
                        <button type="button" className="text-green-600 hover:text-green-700 font-medium">
                            Terms of Service
                        </button>{' '}
                        and{' '}
                        <button type="button" className="text-green-600 hover:text-green-700 font-medium">
                            Privacy Policy
                        </button>
                    </label>
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
                            Creating account...
                        </>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>

            {/* Login Link */}
            <div className="text-center">
                <p className="text-gray-600">
                    Already have an account?{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="text-green-600 hover:text-green-700 font-medium"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Signup;