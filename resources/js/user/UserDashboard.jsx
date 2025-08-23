import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Navbar from '../components/navbar';
import Hero from '../components/hero';
import Features from '../components/features';
import Footer from '../components/footer';

function UserDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalType, setModalType] = useState(null);
    const [error, setError] = useState(null);

    console.log('UserDashboard component mounted');

    useEffect(() => {
        console.log('Fetching auth data...');
        
        fetch('/check-auth', { credentials: 'same-origin' })
            .then(res => {
                console.log('Auth response status:', res.status);
                return res.json();
            })
            .then(data => {
                console.log('Auth data:', data);
                if (data.authenticated) {
                    setUser(data.user);
                    console.log('User set:', data.user);
                } else {
                    console.log('Not authenticated, redirecting...');
                    window.location = '/';
                }
            })
            .catch((err) => {
                console.error('Auth check failed:', err);
                setError(err.message);
                // Don't redirect on error, let user see the error
            })
            .finally(() => {
                console.log('Auth check complete');
                setLoading(false);
            });
    }, []);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600">
                    Error: {error}
                    <br />
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    console.log('Rendering dashboard for user:', user);

    return (
        <div className="min-h-screen">
            <Navbar user={user} />
            <Hero 
                user={user} 
                modalType={modalType} 
                setModalType={setModalType} 
            />
            <div className="py-10">
                <h1 className="text-4xl font-bold text-center">
                    Welcome back, {user?.name}!
                </h1>
            </div>
            <Features />
            <Footer />
        </div>
    );
}

// Add error boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600">Something went wrong.</h1>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

console.log('Looking for user-dashboard-root element...');
const root = document.getElementById('user-dashboard-root');

if (root) {
    console.log('Found root element, rendering...');
    createRoot(root).render(
        <ErrorBoundary>
            <UserDashboard />
        </ErrorBoundary>
    );
} else {
    console.error('Could not find user-dashboard-root element!');
}