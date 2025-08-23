import React from 'react';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const Footer = () => (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                
                {/* Brand Section */}
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                            Evelyn's Karinderya
                        </h3>
                    </div>
                    
                    <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                        Serving authentic Filipino comfort food with love and tradition. Every dish tells a story of home, bringing families together one meal at a time.
                    </p>

                    {/* Social Media - Facebook Only */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-400">Follow us on:</span>
                        <a 
                            href="https://facebook.com/evelynskarinderya" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25"
                            aria-label="Visit our Facebook page"
                        >
                            <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Contact Information */}
                <div>
                    <h4 className="text-xl font-semibold mb-6 text-green-400">Get in Touch</h4>
                    <div className="space-y-4">
                        <a 
                            href="mailto:evelynskarinderya@gmail.com"
                            className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors duration-200 group"
                        >
                            <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-green-600 transition-colors duration-200">
                                <EnvelopeIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-sm font-medium">Email Us</span>
                                <span className="text-sm">evelynskarinderya@gmail.com</span>
                            </div>
                        </a>
                        
                        <a 
                            href="tel:+639381140935"
                            className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors duration-200 group"
                        >
                            <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-green-600 transition-colors duration-200">
                                <PhoneIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-sm font-medium">Call Us</span>
                                <span className="text-sm">+63 938 114 0935</span>
                            </div>
                        </a>
                        
                        <div className="flex items-center gap-3 text-gray-300 group">
                            <div className="p-2 bg-gray-800 rounded-lg">
                                <MapPinIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-sm font-medium">Visit Us</span>
                                <span className="text-sm">Brgy. San Roque, Victoria, Laguna</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operating Hours */}
                <div>
                    <h4 className="text-xl font-semibold mb-6 text-green-400">Operating Hours</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-300">
                            <div className="p-2 bg-gray-800 rounded-lg">
                                <ClockIcon className="w-5 h-5" />
                            </div>
                            <div className="text-sm">
                                <div className="font-medium">Monday - Sunday</div>
                                <div className="text-gray-400">6:00 AM - 9:00 PM</div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 rounded-lg p-3 mt-4">
                            <div className="flex items-center gap-2 text-green-400 mb-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">Now Open</span>
                            </div>
                            <p className="text-xs text-gray-300">Fresh meals available daily!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-gray-900 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} Evelyn's Karinderya. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                        <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
                            Terms of Service
                        </a>
                        <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;