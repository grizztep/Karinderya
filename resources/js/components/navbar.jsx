import React, { useState } from 'react';
import Modal from './modal';
import Login from './login';
import Signup from './signup';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [modalType, setModalType] = useState(null);

    const openModal = (type) => setModalType(type);
    const closeModal = () => setModalType(null);

    const switchToLogin = () => setModalType('login');
    const switchToSignup = () => setModalType('signup');

    const renderModalContent = () => {
        switch (modalType) {
            case 'login':
                return (
                    <Login 
                        onSwitchToSignup={switchToSignup}
                        onClose={closeModal}
                    />
                );
            case 'signup':
                return (
                    <Signup 
                        onSwitchToLogin={switchToLogin}
                        onClose={closeModal}
                    />
                );
            case 'order':
                return (
                    <div className="text-center space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="text-green-800 font-semibold mb-2">Ready to Order?</h4>
                            <p className="text-green-700 text-sm">
                                Please sign in to your account to start placing your order and enjoy our delicious dishes!
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={switchToLogin}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={switchToSignup}
                                className="flex-1 border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getModalTitle = () => {
        switch (modalType) {
            case 'login':
                return 'Welcome Back';
            case 'signup':
                return 'Join Us Today';
            case 'order':
                return 'Order Now';
            default:
                return '';
        }
    };

    return (
        <>
            <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <h1 className="text-3xl font-bold text-green-600">Evelyn's Karinderya</h1>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <button
                                    onClick={() => openModal('order')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                                >
                                    <ShoppingCartIcon className="w-5 h-5" />
                                    Order Now
                                </button>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-700 hover:text-green-600 p-2 transition-colors duration-200"
                            >
                                {isMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden">
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                                <button
                                    onClick={() => {
                                        openModal('order');
                                        setIsMenuOpen(false);
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white w-full px-3 py-2 rounded-md text-base font-medium mt-2 transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCartIcon className="w-5 h-5" />
                                    Order Now
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Modal */}
            <Modal
                isOpen={modalType !== null}
                onClose={closeModal}
                title={getModalTitle()}
                size={modalType === 'order' ? 'md' : 'lg'}
            >
                {renderModalContent()}
            </Modal>
        </>
    );
};

export default Navbar;