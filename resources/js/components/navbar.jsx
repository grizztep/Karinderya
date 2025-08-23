import React, { useState } from 'react';
import Modal from './modal';
import Login from './login';
import Signup from './signup';
import OrderModal from './orderModal';
import ProfileModal from './profileModal';
import TransactionModal from './transactionModal';
import ForgotPassModal from './forgotPassModal';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const Navbar = ({ user }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const openModal = (type) => setModalType(type);
    const closeModal = () => setModalType(null);

    const switchToLogin = () => setModalType('login');
    const switchToSignup = () => setModalType('signup');

    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const handleLogout = () => {
        fetch('/logout', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute('content'),
            },
        }).then(() => (window.location = '/'));
    };

    const renderModalContent = () => {
        switch (modalType) {
            case 'forgot':
                return (
                    <ForgotPassModal 
                        onClose={closeModal} 
                        onBackToLogin={() => setModalType("login")} 
                    />
                );

            case 'login':
                return (
                    <Login 
                        onSwitchToSignup={switchToSignup}
                        onSwitchToForgot={() => setModalType("forgot")}
                        onClose={closeModal}
                    />
                );

            case 'signup':
                return <Signup onSwitchToLogin={switchToLogin} onClose={closeModal} />;

            case 'transactions':
                return <TransactionModal onClose={closeModal} />;

            case 'profile':
                return (
                    <ProfileModal
                        user={user}
                        onClose={closeModal}
                        isEditing={isEditingProfile}
                        setIsEditing={setIsEditingProfile}
                    />
                );

            case 'order':
                if (user) {
                    // Show your order modal for logged-in users
                    return <OrderModal onClose={closeModal} user={user} />;
                } else {
                    // Guest prompt
                    return (
                        <div className="text-center space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="text-green-800 font-semibold mb-2">Ready to Order?</h4>
                                <p className="text-green-700 text-sm">
                                    Please sign in to your account to start placing your order and enjoy our delicious dishes!
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={switchToLogin} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
                                    Sign In
                                </button>
                                <button onClick={switchToSignup} className="flex-1 border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-medium">
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    );
                }

            default:
                return null;
        }
    };

    const getModalTitle = () => {
        switch (modalType) {
            case 'login': return 'Welcome!';
            case 'signup': return 'Join Us Today';
            case 'order': return 'Order Now';
            case 'forgot': return 'Forgot Password';
            case 'profile': return isEditingProfile ? 'Edit Profile' : 'Profile Information';
            default: return '';
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
                            <div className="ml-10 flex items-center gap-4">
                                {!user ? (
                                    // Guest view
                                    <button
                                        onClick={() => openModal('order')}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                                    >
                                        <ShoppingCartIcon className="w-5 h-5" />
                                        Order Now
                                    </button>
                                ) : (
                                    // Logged-in view: Order Now + Dropdown
                                    <>
                                        <button
                                            onClick={() => openModal('order')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                                        >
                                            <ShoppingCartIcon className="w-5 h-5" />
                                            Order Now
                                        </button>

                                        <div className="relative">
                                            <button
                                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                                className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full hover:bg-green-200 transition-colors duration-200"
                                            >
                                                <span className="font-medium">{user.name}</span>
                                                <svg
                                                    className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {dropdownOpen && (
                                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden">
                                                    <div className="px-4 py-3 border-b border-gray-100">
                                                        <p className="text-sm text-gray-500">Signed in as</p>
                                                        <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                                                    </div>
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => setModalType('profile')}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-150"
                                                        >
                                                            Profile
                                                        </button>
                                                        <button
                                                            onClick={() => setModalType('transactions')}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-150"
                                                        >
                                                            Transaction History
                                                        </button>
                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                                                        >
                                                            Logout
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-700 hover:text-green-600 p-2"
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
                    {/* Mobile Menu */}
                    {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 bg-white border-t space-y-1">
                        {!user ? (
                            // Guest view
                            <button
                            onClick={() => {
                                openModal('order');
                                setIsMenuOpen(false);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white w-full px-3 py-2 rounded-md flex items-center justify-center gap-2"
                            >
                            <ShoppingCartIcon className="w-5 h-5" />
                            Order Now
                            </button>
                        ) : (
                            // Logged-in view
                            <>
                            <button
                                onClick={() => {
                                openModal('order');
                                setIsMenuOpen(false);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white w-full px-3 py-2 rounded-md flex items-center justify-center gap-2"
                            >
                                <ShoppingCartIcon className="w-5 h-5" />
                                Order Now
                            </button>

                            <button
                                onClick={() => {
                                setModalType('profile');
                                setIsMenuOpen(false);
                                }}
                                className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                            >
                                Profile
                            </button>

                            <button
                                onClick={() => {
                                setModalType('transactions');
                                setIsMenuOpen(false);
                                }}
                                className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                            >
                                Transaction History
                            </button>

                            <button
                                onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                                }}
                                className="block w-full text-left px-3 py-2 hover:bg-red-50 hover:text-red-600"
                            >
                                Logout
                            </button>
                            </>
                        )}
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
