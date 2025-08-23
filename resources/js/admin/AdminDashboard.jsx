import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './Dashboard';
import Orders from './Orders';
import MenuItems from './MenuItems';
import Reservations from './Reservations';
import Users from './Users';

const menuItems = [
    { id: 1, label: 'Dashboard' },
    { id: 2, label: 'Orders' },
    { id: 3, label: 'Menu Items' },
    { id: 4, label: 'Reservations' },
    { id: 5, label: 'Users' },
];

function AdminDashboard() {
    const [active, setActive] = useState(1);

    const handleLogout = async () => {
        try {
            const res = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute('content'),
                },
                credentials: 'same-origin',
            });

            if (res.ok) {
                window.history.pushState(null, '', '/');
                window.location.replace('/');
            } else {
                console.error('Logout failed');
            }
        } catch (err) {
            console.error('Error logging out:', err);
        }
    };

    const renderContent = () => {
        switch (active) {
            case 1:
                return <Dashboard onNavigate={setActive} />;
            case 2:
                return <Orders />;
            case 3:
                return <MenuItems />;
            case 4:
                return <Reservations />;
            case 5:
                return <Users />;
            default:
                return <Dashboard onNavigate={setActive} />;
        }
    };

    return (
        <div className="flex h-screen bg-white text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-green-600 text-white flex flex-col shadow-lg">
                <div className="p-4 text-xl font-bold border-b border-green-500">
                    Evelyn's Karinderya
                </div>
                <nav className="flex-1 p-2">
                    {menuItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setActive(item.id)}
                            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                                active === item.id
                                    ? 'bg-green-500 shadow-md'
                                    : 'hover:bg-green-700'
                            }`}
                        >
                            <span className="font-medium">{item.label}</span>
                        </div>
                    ))}
                </nav>
                <div
                    onClick={handleLogout}
                    className="p-4 border-t border-green-500 hover:bg-green-700 cursor-pointer transition-colors flex items-center gap-3"
                >
                    <span className="font-medium">Logout</span>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-6 bg-gray-50 min-h-full">
                    <header className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {menuItems.find(m => m.id === active)?.label}
                        </h1>
                        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-medium">
                            Admin Panel
                        </div>
                    </header>

                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

const root = document.getElementById('admin-dashboard-root');
if (root) {
    createRoot(root).render(<AdminDashboard />);
}