import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Search, Filter, Eye, Check, X, Trash2, AlertCircle } from 'lucide-react';

function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        date: '',
        search: ''
    });
    const [stats, setStats] = useState({});
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchReservations();
        fetchStatistics();
    }, [filters]);

    const fetchReservations = async (page = 1) => {
        setLoading(true);
        try {
            // Remove empty filter values
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== '')
            );

            const queryParams = new URLSearchParams({
                ...cleanFilters,
                page: page.toString()
            });

            const response = await fetch(`/admin/reservations?${queryParams}`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Reservations response:', data); // Debug log

            if (response.ok && data.success) {
                setReservations(data.data.data || []);
                setPagination({
                    current_page: data.data.current_page || 1,
                    last_page: data.data.last_page || 1,
                    total: data.data.total || 0
                });
            } else {
                console.error('Error response:', data);
                alert(data.message || 'Error fetching reservations');
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            alert('Error fetching reservations. Please check the console for details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch('/admin/reservations-statistics', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Statistics response:', data); // Debug log

            if (response.ok && data.success) {
                setStats(data.data || {});
            } else {
                console.error('Statistics error:', data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const updateReservationStatus = async (id, status) => {
        try {
            const response = await fetch(`/admin/reservations/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();
            console.log('Update status response:', data); // Debug log

            if (response.ok && data.success) {
                await fetchReservations();
                await fetchStatistics();
                setShowModal(false);
                alert(data.message || 'Reservation status updated successfully');
            } else {
                console.error('Error response:', data);
                alert(data.message || 'Error updating reservation status');
            }
        } catch (error) {
            console.error('Error updating reservation status:', error);
            alert('Error updating reservation status. Please check the console for details.');
        }
    };

    const deleteReservation = async (id) => {
        if (!confirm('Are you sure you want to delete this reservation?')) return;

        try {
            const response = await fetch(`/admin/reservations/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Delete response:', data); // Debug log

            if (response.ok && data.success) {
                await fetchReservations();
                await fetchStatistics();
                alert(data.message || 'Reservation deleted successfully');
            } else {
                console.error('Delete error:', data);
                alert(data.message || 'Error deleting reservation');
            }
        } catch (error) {
            console.error('Error deleting reservation:', error);
            alert('Error deleting reservation. Please check the console for details.');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
            confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Check }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="w-3 h-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (time) => {
        return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total_reservations || 0}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Today's Reservations</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.today_reservations || 0}</p>
                        </div>
                        <Clock className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending_reservations || 0}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Upcoming</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.upcoming_reservations || 0}</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by customer name or email..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>

                        <input
                            type="date"
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={filters.date}
                            onChange={(e) => setFilters({...filters, date: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Reservations Management</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading reservations...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reservations.map((reservation) => (
                                    <tr key={reservation.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{reservation.user_name}</div>
                                                <div className="text-sm text-gray-500">{reservation.user_email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {reservation.table ? (
                                                <div>
                                                    <div>{reservation.table.name || `Table #${reservation.table.table_number || reservation.table_id}`}</div>
                                                    {reservation.table.seats && (
                                                        <div className="text-xs text-gray-500">{reservation.table.seats} seats</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-red-500">Table ID: {reservation.table_id}</div>
                                                    <div className="text-xs text-red-400">Table not found</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>{formatDate(reservation.reservation_date)}</div>
                                            <div className="text-gray-500">{formatTime(reservation.reservation_time)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {reservation.guest_count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(reservation.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedReservation(reservation);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                
                                                {reservation.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Confirm"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Cancel"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}

                                                {(reservation.status === 'pending' || reservation.status === 'cancelled') && (
                                                    <button
                                                        onClick={() => deleteReservation(reservation.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {reservations.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No reservations found.
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {((pagination.current_page - 1) * 15) + 1} to {Math.min(pagination.current_page * 15, pagination.total)} of {pagination.total} results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchReservations(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1">
                                Page {pagination.current_page} of {pagination.last_page}
                            </span>
                            <button
                                onClick={() => fetchReservations(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Reservation Details Modal */}
            {showModal && selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Reservation Details</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Customer</label>
                                <p className="text-sm text-gray-900">{selectedReservation.user_name}</p>
                                <p className="text-sm text-gray-500">{selectedReservation.user_email}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Table</label>
                                {selectedReservation.table ? (
                                    <div>
                                        <p className="text-sm text-gray-900">
                                            {selectedReservation.table.name || `Table #${selectedReservation.table.table_number || selectedReservation.table_id}`}
                                        </p>
                                        {selectedReservation.table.seats && (
                                            <p className="text-xs text-gray-500">{selectedReservation.table.seats} seats</p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm text-red-500">Table ID: {selectedReservation.table_id}</p>
                                        <p className="text-xs text-red-400">Table not found in database</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-600">Date</label>
                                    <p className="text-sm text-gray-900">{formatDate(selectedReservation.reservation_date)}</p>
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-600">Time</label>
                                    <p className="text-sm text-gray-900">{formatTime(selectedReservation.reservation_time)}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Number of Guests</label>
                                <p className="text-sm text-gray-900">{selectedReservation.guest_count}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Status</label>
                                <div className="mt-1">
                                    {getStatusBadge(selectedReservation.status)}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Reserved At</label>
                                <p className="text-sm text-gray-900">{new Date(selectedReservation.reserved_at).toLocaleString()}</p>
                            </div>
                        </div>

                        {selectedReservation.status === 'pending' && (
                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={() => updateReservationStatus(selectedReservation.id, 'confirmed')}
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Confirm
                                </button>
                                <button
                                    onClick={() => updateReservationStatus(selectedReservation.id, 'cancelled')}
                                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reservations;