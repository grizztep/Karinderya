import React, { useState, useEffect } from "react";

const TransactionModal = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState("orders");
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter states
    const [orderStatusFilter, setOrderStatusFilter] = useState("all");
    const [orderDateFilter, setOrderDateFilter] = useState("all");
    const [reservationStatusFilter, setReservationStatusFilter] = useState("all");
    const [reservationDateFilter, setReservationDateFilter] = useState("all");

    const handleCancel = async (id, type) => {
        try {
            const url =
                type === "order"
                    ? `/transactions/orders/${id}/cancel`
                    : `/transactions/reservations/${id}/cancel`;

            console.log('Making request to:', url);
            console.log('Order ID being cancelled:', id);
            console.log('Request type:', type);

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content"),
                    "Accept": "application/json",
                },
            });

            console.log('Response status:', res.status);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const textResponse = await res.text();
                console.error('Non-JSON response:', textResponse);
                throw new Error("Server returned non-JSON response");
            }

            const data = await res.json();
            console.log('Response data:', data);

            if (data.success) {
                alert(`${type} cancelled successfully.`);

                // Update UI instantly - Update individual order
                if (type === "order") {
                    setOrders(prev =>
                        prev.map(o =>
                            o.id === id ? { ...o, status: "Cancelled" } : o
                        )
                    );
                } else {
                    setReservations(prev =>
                        prev.map(r =>
                            r.id === id ? { ...r, status: "Cancelled" } : r
                        )
                    );
                }
            } else {
                alert(data.message || 'Cancellation failed');
            }
        } catch (err) {
            console.error('Cancel error:', err);
            alert(`Error: ${err.message}`);
        }
    };

    // Filter functions
    const filterOrders = (orders) => {
        return orders.filter(order => {
            // Status filter
            if (orderStatusFilter !== "all" && order.status !== orderStatusFilter) {
                return false;
            }
            
            // Date filter
            if (orderDateFilter !== "all") {
                const orderDate = new Date(order.date);
                const now = new Date();
                const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
                
                switch (orderDateFilter) {
                    case "today":
                        if (daysDiff !== 0) return false;
                        break;
                    case "week":
                        if (daysDiff > 7) return false;
                        break;
                    case "month":
                        if (daysDiff > 30) return false;
                        break;
                }
            }
            
            return true;
        });
    };

    const filterReservations = (reservations) => {
        return reservations.filter(reservation => {
            // Status filter
            if (reservationStatusFilter !== "all" && reservation.status !== reservationStatusFilter) {
                return false;
            }
            
            // Date filter
            if (reservationDateFilter !== "all") {
                const reservationDate = new Date(reservation.date);
                const now = new Date();
                const daysDiff = Math.floor((now - reservationDate) / (1000 * 60 * 60 * 24));
                
                switch (reservationDateFilter) {
                    case "today":
                        if (daysDiff !== 0) return false;
                        break;
                    case "week":
                        if (daysDiff > 7) return false;
                        break;
                    case "month":
                        if (daysDiff > 30) return false;
                        break;
                }
            }
            
            return true;
        });
    };
    // Group orders by order_group_id for display purposes
    const groupOrdersForDisplay = (orders) => {
        const grouped = {};
        orders.forEach(order => {
            const groupId = order.order_group_id || order.id;
            if (!grouped[groupId]) {
                grouped[groupId] = [];
            }
            grouped[groupId].push(order);
        });
        return grouped;
    };

    // Get filtered data
    const filteredOrders = filterOrders(orders);
    const filteredReservations = filterReservations(reservations);

    // Calculate group total with delivery fee
    const calculateGroupTotal = (groupOrders) => {
        const subtotal = groupOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
        const deliveryFee = 20;
        return subtotal + deliveryFee;
    };

    useEffect(() => {
        fetch("/transactions", { 
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        })
            .then(res => {
                console.log('Transactions response status:', res.status);
                
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Server returned non-JSON response");
                }

                return res.json();
            })
            .then(data => {
                console.log('Transactions data:', data);
                setOrders(data.orders || []);
                setReservations(data.reservations || []);
            })
            .catch(error => {
                console.error('Error fetching transactions:', error);
                setOrders([]);
                setReservations([]);
                alert('Failed to load transactions: ' + error.message);
            })
            .finally(() => setLoading(false));
    }, []);

    const renderOrdersTable = (orders) => {
        if (orders.length === 0) {
            return (
                <div className="p-6 text-center text-gray-500">
                    {orderStatusFilter !== "all" || orderDateFilter !== "all" 
                        ? "No orders found matching your filters." 
                        : "You have no orders yet."
                    }
                </div>
            );
        }

        const groupedOrders = groupOrdersForDisplay(orders);
        const groupColors = [
            'bg-blue-50 border-l-4 border-l-blue-400',
            'bg-green-50 border-l-4 border-l-green-400', 
            'bg-purple-50 border-l-4 border-l-purple-400',
            'bg-orange-50 border-l-4 border-l-orange-400',
            'bg-pink-50 border-l-4 border-l-pink-400'
        ];

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-green-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Order ID</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Item</th>
                            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Price</th>
                            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Group Total</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(groupedOrders).map(([groupId, groupOrders], groupIndex) => {
                            const colorClass = groupColors[groupIndex % groupColors.length];
                            const groupTotal = calculateGroupTotal(groupOrders);
                            
                            return groupOrders.map((order, orderIndex) => (
                                <tr key={order.id} className={`${colorClass}`}>
                                    <td className="px-4 py-2 text-sm text-gray-600">{order.date}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs text-gray-500">#{order.id}</span>
                                            {groupOrders.length > 1 && (
                                                <span className="text-xs text-blue-600 font-medium">
                                                    Group: {groupId}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{order.items}</td>
                                    <td className="px-4 py-2 text-sm text-gray-800 font-medium text-right">
                                        ₱{order.total}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-right">
                                        {orderIndex === 0 ? (
                                            <div className="flex flex-col">
                                                <span className="font-bold text-green-700">₱{groupTotal.toFixed(2)}</span>
                                                <span className="text-xs text-gray-500">
                                                    (incl. ₱20 delivery)
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">↑ Same group</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-center">
                                        <div className="flex flex-col items-center space-y-1">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    order.status === "Completed"
                                                        ? "bg-green-100 text-green-700"
                                                        : order.status === "Pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {order.status}
                                            </span>

                                            {order.status === "Pending" && (
                                                <button
                                                    onClick={() => handleCancel(order.id, "order")}
                                                    className="text-red-600 hover:underline text-xs"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ));
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderReservationsTable = (reservations) => (
        reservations.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-green-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Details</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reservations.map((reservation, idx) => (
                            <tr key={idx}>
                                <td className="px-4 py-2 text-sm text-gray-600">{reservation.date}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">#{reservation.id}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{reservation.items}</td>
                                <td className="px-4 py-2 text-sm text-center">
                                    <div className="flex flex-col items-center space-y-1">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                reservation.status === "Completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : reservation.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {reservation.status}
                                        </span>

                                        {reservation.status === "Pending" && (
                                            <button
                                                onClick={() => handleCancel(reservation.id, "reservation")}
                                                className="text-red-600 hover:underline text-xs"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="p-6 text-center text-gray-500">
                {reservationStatusFilter !== "all" || reservationDateFilter !== "all" 
                    ? "No reservations found matching your filters." 
                    : "You have no reservations yet."
                }
            </div>
        )
    );

    if (loading) {
        return <div className="p-6 text-center">Loading transactions...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("orders")}
                    className={`flex-1 px-4 py-2 text-sm font-medium ${
                        activeTab === "orders"
                            ? "border-b-2 border-green-600 text-green-600"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Orders ({filteredOrders.length})
                </button>
                <button
                    onClick={() => setActiveTab("reservations")}
                    className={`flex-1 px-4 py-2 text-sm font-medium ${
                        activeTab === "reservations"
                            ? "border-b-2 border-green-600 text-green-600"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Reservations ({filteredReservations.length})
                </button>
            </div>

            {/* Filters */}
            {activeTab === "orders" ? (
                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={orderStatusFilter}
                            onChange={(e) => setOrderStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-700 mb-1">Date Range</label>
                        <select
                            value={orderDateFilter}
                            onChange={(e) => setOrderDateFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setOrderStatusFilter("all");
                                setOrderDateFilter("all");
                            }}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={reservationStatusFilter}
                            onChange={(e) => setReservationStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-700 mb-1">Date Range</label>
                        <select
                            value={reservationDateFilter}
                            onChange={(e) => setReservationDateFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setReservationStatusFilter("all");
                                setReservationDateFilter("all");
                            }}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            {activeTab === "orders" 
                ? renderOrdersTable(filteredOrders) 
                : renderReservationsTable(filteredReservations)
            }

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default TransactionModal;