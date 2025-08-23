import React, { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState({});
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredOrders, setFilteredOrders] = useState({});
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    axios.get("/admin/orders")
      .then((response) => {
        if (response.data.success) {
          setOrders(response.data.data);
          setFilteredOrders(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Real-time filter
  useEffect(() => {
    const newFiltered = {};
    let totalSales = 0;

    Object.entries(orders).forEach(([groupId, groupOrders]) => {
      const filteredGroup = groupOrders.filter(order => {
        const matchesText = search
          ? Object.values(order).some(value =>
              value && value.toString().toLowerCase().includes(search.toLowerCase())
            )
          : true;

        const matchesFromDate = fromDate
          ? new Date(order.created_at) >= new Date(fromDate)
          : true;

        const matchesToDate = toDate
          ? new Date(order.created_at) <= new Date(toDate)
          : true;

        return matchesText && matchesFromDate && matchesToDate;
      });

      if (filteredGroup.length > 0) {
        newFiltered[groupId] = filteredGroup;
      }

      // Compute grand total for completed orders
      totalSales += groupOrders
        .filter(o => o.status === "Completed")
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    });

    setFilteredOrders(newFiltered);
    setGrandTotal(totalSales);
  }, [search, fromDate, toDate, orders]);

  const updateStatus = (id, status) => {
    axios.put(`/admin/orders/${id}/status`, { status })
      .then((response) => {
        if (response.data.success) {
          setOrders((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((groupId) => {
              updated[groupId] = updated[groupId].map((order) =>
                order.id === id ? { ...order, status } : order
              );
            });
            return updated;
          });
        }
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Processing":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
  };

  const showGroupDetails = (groupId, groupOrders) => {
    setSelectedGroupDetails({ groupId, orders: groupOrders });
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedGroupDetails(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Filters Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Orders
              </label>
              <input
                type="text"
                placeholder="Search by customer, email, or any text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Total Sales</h3>
              <p className="text-sm opacity-80">Completed Orders Only</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">₱{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {Object.keys(filteredOrders).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dish</th>
                    <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(filteredOrders).map(([groupId, groupOrders]) => {
                    const groupTotal = groupOrders.reduce(
                      (sum, o) => sum + parseFloat(o.total_amount),
                      0
                    );

                    return (
                      <React.Fragment key={groupId}>
                        <tr className="bg-blue-50 border-t-2 border-blue-200">
                          <td colSpan="10" className="px-3 py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-blue-100 rounded">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"></path>
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">Group: {groupId}</h4>
                                  <p className="text-xs text-gray-600">{groupOrders.length} item{groupOrders.length !== 1 ? 's' : ''}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <p className="font-bold text-sm text-gray-900">₱{groupTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                </div>
                                <button
                                  onClick={() => showGroupDetails(groupId, groupOrders)}
                                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  Details
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {groupOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors text-sm">
                            <td className="px-3 py-2 text-xs text-gray-900 truncate" title={new Date(order.created_at).toLocaleDateString()}>
                              {new Date(order.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                            </td>
                            <td className="px-3 py-2 text-xs font-mono text-gray-900 truncate">
                              #{order.id}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-900 truncate" title={order.dish_name || order.dish?.name || 'Unknown Dish'}>
                              <div className="font-medium">
                                {(order.dish_name || order.dish?.name || 'Unknown')?.substring(0, 20)}
                                {(order.dish_name || order.dish?.name || '')?.length > 20 ? '...' : ''}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-xs text-center text-gray-900">
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-medium">
                                {order.quantity}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-900 truncate" title={order.customer_name || order.user_name}>
                              {(order.customer_name || order.user_name)?.substring(0, 12)}
                              {(order.customer_name || order.user_name)?.length > 12 ? '...' : ''}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600 truncate" title={order.user_email}>
                              {order.user_email?.substring(0, 18)}
                              {order.user_email?.length > 18 ? '...' : ''}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600 truncate" title={order.contact_number}>
                              {order.contact_number}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600 truncate" title={order.address}>
                              {order.address?.substring(0, 20)}
                              {order.address?.length > 20 ? '...' : ''}
                            </td>
                            <td className="px-3 py-2">
                              <span className={getStatusBadge(order.status).replace('px-3 py-1', 'px-2 py-1 text-xs')}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 space-x-1">
                              {order.status === "Pending" && (
                                <div className="flex flex-col space-y-1">
                                  <button
                                    onClick={() => updateStatus(order.id, "Completed")}
                                    className="inline-flex items-center justify-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors focus:outline-none focus:ring-1 focus:ring-green-500"
                                    title="Mark as Completed"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Done
                                  </button>
                                  <button
                                    onClick={() => updateStatus(order.id, "Cancelled")}
                                    className="inline-flex items-center justify-center px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"
                                    title="Cancel Order"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    Cancel
                                  </button>
                                </div>
                              )}
                              {order.status === "Processing" && (
                                <button
                                  onClick={() => updateStatus(order.id, "Completed")}
                                  className="inline-flex items-center justify-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors focus:outline-none focus:ring-1 focus:ring-green-500"
                                  title="Mark as Completed"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  Done
                                </button>
                              )}
                              {(order.status === "Completed" || order.status === "Cancelled") && (
                                <span className="text-gray-400 text-xs">No actions</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Group Details Modal */}
        {showDetailsModal && selectedGroupDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order Group Details</h2>
                  <p className="text-gray-600">Group ID: {selectedGroupDetails.groupId}</p>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-4">
                  {selectedGroupDetails.orders.map((order) => (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Order ID</label>
                          <p className="text-sm text-gray-900 font-mono">#{order.id}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date</label>
                          <p className="text-sm text-gray-900">{new Date(order.created_at).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <span className={getStatusBadge(order.status)}>
                            {order.status}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Dish</label>
                          <p className="text-sm text-gray-900">{order.dish_name || order.dish?.name || 'Unknown Dish'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Quantity</label>
                          <p className="text-sm text-gray-900">{order.quantity}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Amount</label>
                          <p className="text-sm text-gray-900 font-semibold">₱{parseFloat(order.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Customer</label>
                          <p className="text-sm text-gray-900">{order.customer_name || order.user_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="text-sm text-gray-600">{order.user_email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Contact</label>
                          <p className="text-sm text-gray-600">{order.contact_number}</p>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Address</label>
                          <p className="text-sm text-gray-600">{order.address}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">Group Summary</h3>
                      <p className="text-sm text-gray-600">{selectedGroupDetails.orders.length} item{selectedGroupDetails.orders.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₱{selectedGroupDetails.orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </p>
                      <p className="text-sm text-gray-600">Total Amount</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;