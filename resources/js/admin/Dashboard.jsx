import React, { useState, useEffect } from 'react';

function Dashboard({ onNavigate }) {
    const [stats, setStats] = useState({
        total_sales: '0.00',
        total_orders: 0,
        total_users: 0,
        total_reservations: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch('/admin/dashboard/stats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute('content'),
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                }
            } else {
                console.error('Failed to fetch dashboard stats');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sales Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Sales</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {loading ? 'Loading...' : `₱${stats.total_sales}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">This month</p>
                        </div>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {loading ? 'Loading...' : stats.total_orders}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Today</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate(2)}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        View all orders →
                    </button>
                </div>

                {/* Users Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {loading ? 'Loading...' : stats.total_users}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Registered</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate(5)}
                        className="mt-4 text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                        Manage users →
                    </button>
                </div>

                {/* Reservations Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Reservations</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {loading ? 'Loading...' : stats.total_reservations}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Today</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate(4)}
                        className="mt-4 text-sm text-orange-600 hover:text-orange-800 font-medium"
                    >
                        View reservations →
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button 
                        onClick={() => onNavigate(3)}
                        className="bg-green-600 text-white px-4 py-3 rounded-lg shadow hover:bg-green-700 transition-colors"
                    >
                        Add Menu Item
                    </button>
                    <button 
                        onClick={() => onNavigate(2)}
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors"
                    >
                        View Orders
                    </button>
                    <button 
                        onClick={() => onNavigate(5)}
                        className="bg-orange-600 text-white px-4 py-3 rounded-lg shadow hover:bg-orange-700 transition-colors"
                    >
                        Manage Tables
                    </button>
                    <button 
                        onClick={() => onNavigate(4)}
                        className="bg-purple-600 text-white px-4 py-3 rounded-lg shadow hover:bg-purple-700 transition-colors"
                    >
                        Check Inventory
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;