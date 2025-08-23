import React from 'react';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

const Footer = () => (
    <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                    <h3 className="text-2xl font-bold text-green-400 mb-4">Evelyn's Karinderya</h3>
                    <p className="text-gray-300 mb-6 max-w-md">
                        Serving delicious home-style meals for years — bringing comfort, flavor, and a taste of tradition to every plate.
                    </p>

                    <div className="flex space-x-4">
                        <a 
                            href="#" 
                            className="bg-gray-800 hover:bg-green-600 p-3 rounded-full transition-colors transform hover:scale-110"
                            aria-label="Instagram"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348 0-1.297 1.051-2.348 2.348-2.348 1.297 0 2.348 1.051 2.348 2.348 0 1.297-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348 0-1.297 1.051-2.348 2.348-2.348 1.297 0 2.348 1.051 2.348 2.348 0 1.297-1.051 2.348-2.348 2.348z"/>
                            </svg>
                        </a>
                        <a 
                            href="#" 
                            className="bg-gray-800 hover:bg-green-600 p-3 rounded-full transition-colors transform hover:scale-110"
                            aria-label="Facebook"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        <a 
                            href="#" 
                            className="bg-gray-800 hover:bg-green-600 p-3 rounded-full transition-colors transform hover:scale-110"
                            aria-label="Phone"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
                    <div className="space-y-3 text-gray-300">
                        <div className="flex items-center gap-3">
                            <EnvelopeIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span>evelynskarinderya@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <PhoneIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span>09381140935</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPinIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span>Brgy. San Roque, Victoria, Laguna</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-600">
                <p>&copy; 2025 Evelyn's Karinderya. All rights reserved.</p>
            </div>
        </div>
    </footer>
);

export default Footer;