import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Check, X } from 'lucide-react';

function MenuItems() {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingDish, setEditingDish] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        available: true
    });
    const [errors, setErrors] = useState({});

    // Fetch dishes
    const fetchDishes = async () => {
        try {
            const response = await fetch('/dishes', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setDishes(data);
            } else {
                console.error('Failed to fetch dishes');
            }
        } catch (error) {
            console.error('Error fetching dishes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDishes();
    }, []);

    // Filter dishes based on search and availability
    const filteredDishes = dishes.filter(dish => {
        const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAvailability = availabilityFilter === 'all' || 
            (availabilityFilter === 'available' && dish.available) ||
            (availabilityFilter === 'unavailable' && !dish.available);
        
        return matchesSearch && matchesAvailability;
    });

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            const url = editingDish ? `/dishes/${editingDish.id}` : '/dishes';
            const method = editingDish ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                await fetchDishes(); // Refresh the list
                resetForm();
                alert(editingDish ? 'Dish updated successfully!' : 'Dish added successfully!');
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    alert(data.message || 'An error occurred');
                }
            }
        } catch (error) {
            console.error('Error saving dish:', error);
            alert('An error occurred while saving the dish');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this dish?')) {
            return;
        }

        try {
            const response = await fetch(`/dishes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                }
            });

            if (response.ok) {
                await fetchDishes(); // Refresh the list
                alert('Dish deleted successfully!');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete dish');
            }
        } catch (error) {
            console.error('Error deleting dish:', error);
            alert('An error occurred while deleting the dish');
        }
    };

    // Toggle availability
    const toggleAvailability = async (dish) => {
        try {
            const response = await fetch(`/dishes/${dish.id}/toggle-availability`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                }
            });

            if (response.ok) {
                await fetchDishes(); // Refresh the list
            } else {
                alert('Failed to update availability');
            }
        } catch (error) {
            console.error('Error toggling availability:', error);
            alert('An error occurred while updating availability');
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({ name: '', price: '', available: true });
        setEditingDish(null);
        setShowAddForm(false);
        setErrors({});
    };

    // Start editing
    const startEdit = (dish) => {
        setFormData({
            name: dish.name,
            price: dish.price.toString(),
            available: dish.available
        });
        setEditingDish(dish);
        setShowAddForm(true);
        setErrors({});
    };

    if (loading) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading menu items...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Dish</span>
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search dishes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        value={availabilityFilter}
                        onChange={(e) => setAvailabilityFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">All Items</option>
                        <option value="available">Available Only</option>
                        <option value="unavailable">Unavailable Only</option>
                    </select>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingDish ? 'Edit Dish' : 'Add New Dish'}
                    </h3>
                    <div onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dish Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter dish name"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (₱) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="0.00"
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.available}
                                    onChange={(e) => setFormData({...formData, available: e.target.checked})}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Available for ordering</span>
                            </label>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                {editingDish ? 'Update Dish' : 'Add Dish'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    Showing {filteredDishes.length} of {dishes.length} dishes
                    {searchTerm && ` for "${searchTerm}"`}
                </p>
            </div>

            {/* Dishes Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dish Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDishes.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    {searchTerm || availabilityFilter !== 'all' 
                                        ? "No dishes found matching your criteria" 
                                        : "No dishes added yet"
                                    }
                                </td>
                            </tr>
                        ) : (
                            filteredDishes.map((dish) => (
                                <tr key={dish.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{dish.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">₱{parseFloat(dish.price).toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleAvailability(dish)}
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                dish.available
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            } transition-colors cursor-pointer`}
                                        >
                                            {dish.available ? <Check size={14} className="mr-1" /> : <X size={14} className="mr-1" />}
                                            {dish.available ? 'Available' : 'Unavailable'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(dish.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => startEdit(dish)}
                                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                                                title="Edit dish"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dish.id)}
                                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                                                title="Delete dish"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-800 text-sm font-medium">Total Dishes</div>
                    <div className="text-green-900 text-2xl font-bold">{dishes.length}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-blue-800 text-sm font-medium">Available</div>
                    <div className="text-blue-900 text-2xl font-bold">
                        {dishes.filter(d => d.available).length}
                    </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800 text-sm font-medium">Unavailable</div>
                    <div className="text-red-900 text-2xl font-bold">
                        {dishes.filter(d => !d.available).length}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MenuItems;