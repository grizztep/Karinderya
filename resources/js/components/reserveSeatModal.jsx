import React, { useState, useEffect } from "react";
import Modal from "./modal";

const ReserveSeatModal = ({ isOpen, onClose, user, openLogin }) => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [guestCount, setGuestCount] = useState(1);
    const [reservationDate, setReservationDate] = useState('');
    const [reservationTime, setReservationTime] = useState('');
    const [tableAvailability, setTableAvailability] = useState({});
    const [loading, setLoading] = useState(false);
    const [tablesLoading, setTablesLoading] = useState(false);
    const [tablesError, setTablesError] = useState(null);

    // Generate available time slots (6 AM to 3 PM)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 6; hour <= 15; hour++) {
            const time12 = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
            const time24 = `${hour.toString().padStart(2, '0')}:00`;
            slots.push({ value: time24, label: time12 });
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Reset form when modal closes
    const resetForm = () => {
        setSelectedTable(null);
        setGuestCount(1);
        setReservationDate('');
        setReservationTime('');
        setTableAvailability({});
        setTablesError(null);
    };

    // Fetch tables function
    const fetchTables = async () => {
        setTablesLoading(true);
        setTablesError(null);
        
        try {
            console.log('Fetching tables...');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch("/tables", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Tables fetched successfully:', data);
            
            // Handle different response formats
            const tablesData = data.tables || data || [];
            setTables(Array.isArray(tablesData) ? tablesData : []);
            
        } catch (error) {
            console.error("Error fetching tables:", error);
            
            if (error.name === 'AbortError') {
                setTablesError('Request timed out. Please try again.');
            } else if (error.name === 'TypeError') {
                setTablesError('Network error. Please check your connection.');
            } else {
                setTablesError(`Failed to load tables: ${error.message}`);
            }
        } finally {
            setTablesLoading(false);
        }
    };

    // Check table availability
    const checkAvailability = async (date, time) => {
        if (!date || !time) return;
        
        try {
            console.log(`Checking availability for ${date} at ${time}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/check-availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                body: JSON.stringify({
                    reservation_date: date,
                    reservation_time: time
                }),
                credentials: 'same-origin',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                setTableAvailability(data.availability || {});
                console.log('Availability updated:', data.availability);
            } else {
                console.warn('Failed to check availability:', response.status);
                setTableAvailability({});
            }
        } catch (error) {
            console.error('Error checking availability:', error);
            // Don't show availability errors to user, just assume all tables are available
            setTableAvailability({});
        }
    };

    // Effect to fetch tables when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchTables();
        } else {
            // Reset when modal closes
            resetForm();
        }
    }, [isOpen]);

    // Effect to check availability when date/time changes
    useEffect(() => {
        if (reservationDate && reservationTime) {
            checkAvailability(reservationDate, reservationTime);
        } else {
            setTableAvailability({});
        }
    }, [reservationDate, reservationTime]);

    const handleReserve = async (e) => {
        e.preventDefault();
        console.log('Reserve button clicked');
        console.log('Current user:', user);

        // Check if user is logged in
        if (!user) {
            console.log('No user found, opening login modal');
            alert("Please log in first to make a reservation.");
            if (openLogin) {
                openLogin();
            }
            return;
        }

        if (!selectedTable) {
            alert("Please select a table.");
            return;
        }

        if (!reservationDate) {
            alert("Please select a reservation date.");
            return;
        }

        if (!reservationTime) {
            alert("Please select a reservation time.");
            return;
        }

        // Validate date is not in the past
        const selectedDate = new Date(reservationDate);
        const now = new Date();
        if (selectedDate < now.setHours(0,0,0,0)) {
            alert("Please select a date that is today or in the future.");
            return;
        }

        // If selected date is today, validate time is not in the past
        if (reservationDate === today) {
            const currentTime = new Date();
            const [selectedHour, selectedMinute] = reservationTime.split(':');
            const selectedDateTime = new Date();
            selectedDateTime.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);
            
            if (selectedDateTime <= currentTime) {
                alert("Please select a time that is at least 1 hour from now.");
                return;
            }
        }

        setLoading(true);
        console.log('Making reservation request...');

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('CSRF Token:', csrfToken);

            const requestData = {
                table_id: selectedTable,
                guest_count: guestCount,
                reservation_date: reservationDate,
                reservation_time: reservationTime,
            };
            console.log('Request data:', requestData);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

            const res = await fetch("/reserve-seat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
                },
                body: JSON.stringify(requestData),
                credentials: 'same-origin',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            console.log('Response status:', res.status);
            const data = await res.json();
            console.log('Response data:', data);

            if (res.ok) {
                const selectedTableData = tables.find(t => t.id === selectedTable);
                const formattedDate = new Date(reservationDate).toLocaleDateString();
                const formattedTime = timeSlots.find(slot => slot.value === reservationTime)?.label || reservationTime;
                
                alert(`Reservation Confirmed!\n\nTable: ${selectedTableData?.name || 'Unknown'}\nDate: ${formattedDate}\nTime: ${formattedTime}\nGuests: ${guestCount}\nStatus: Pending`);
                
                // Reset form
                resetForm();
                onClose();
            } else {
                // Handle different error scenarios
                if (res.status === 401) {
                    alert("Please log in to make a reservation.");
                    if (openLogin) {
                        openLogin();
                    }
                } else if (res.status === 422) {
                    // Validation errors
                    const errorMessages = Object.values(data.errors || {}).flat().join('\n');
                    alert(`Validation Error:\n${errorMessages || data.message}`);
                } else {
                    alert(data.message || "Reservation failed. Please try again.");
                }
            }
        } catch (err) {
            console.error("Reservation error:", err);
            if (err.name === 'AbortError') {
                alert("Request timed out. Please try again.");
            } else {
                alert("Network error occurred. Please check your connection and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reserve a Seat">
            <form onSubmit={handleReserve} className="space-y-8">
                {/* User Status Info */}
                <div className="bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-lg border border-gray-200">
                    {user ? (
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-green-800">Reserving as:</p>
                                <p className="text-sm text-green-600">
                                    <strong>{user.name}</strong> ({user.email})
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-orange-800">Login Required</p>
                                <p className="text-sm text-orange-600">
                                    You need to log in first to make a reservation
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Date and Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reservation Date
                        </label>
                        <input
                            type="date"
                            value={reservationDate}
                            onChange={(e) => setReservationDate(e.target.value)}
                            min={today}
                            className="w-full border-gray-300 rounded-lg p-3 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>

                    {/* Time Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reservation Time
                            <span className="block text-xs text-gray-500 mt-1">Open: 6:00 AM - 3:00 PM</span>
                        </label>
                        <select
                            value={reservationTime}
                            onChange={(e) => setReservationTime(e.target.value)}
                            className="w-full border-gray-300 rounded-lg p-3 focus:ring-green-500 focus:border-green-500"
                            required
                        >
                            <option value="">Select a time</option>
                            {timeSlots.map((slot) => (
                                <option key={slot.value} value={slot.value}>
                                    {slot.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Choose a Table
                        {reservationDate && reservationTime && (
                            <span className="text-xs text-gray-500 block mt-1">
                                Showing availability for {new Date(reservationDate).toLocaleDateString()} at {timeSlots.find(slot => slot.value === reservationTime)?.label}
                            </span>
                        )}
                    </label>
                    
                    {/* Tables Loading/Error States */}
                    {tablesLoading ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                                    <svg className="animate-spin h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                                <p>Loading tables...</p>
                            </div>
                        </div>
                    ) : tablesError ? (
                        <div className="text-center py-8">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-red-100 rounded-full mb-4 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <p className="text-red-600 mb-2">{tablesError}</p>
                                <button
                                    type="button"
                                    onClick={fetchTables}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : tables.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No tables available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {tables.map((table) => {
                                const isAvailable = reservationDate && reservationTime 
                                    ? tableAvailability[table.id] !== false 
                                    : true;
                                const isSelected = selectedTable === table.id;
                                const canSelect = isAvailable && reservationDate && reservationTime;
                                
                                return (
                                    <button
                                        key={table.id}
                                        type="button"
                                        onClick={() => {
                                            if (canSelect) {
                                                setSelectedTable(table.id);
                                                setGuestCount(1);
                                            }
                                        }}
                                        disabled={!canSelect}
                                        className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                                            isSelected && isAvailable
                                                ? "border-green-600 bg-green-50 shadow-md scale-105"
                                                : !isAvailable
                                                ? "border-red-300 bg-red-50 opacity-60 cursor-not-allowed"
                                                : !reservationDate || !reservationTime
                                                ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                                                : "border-gray-300 hover:border-green-400 hover:shadow-sm cursor-pointer"
                                        }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                                                !isAvailable
                                                    ? "bg-red-100"
                                                    : !reservationDate || !reservationTime
                                                    ? "bg-gray-100"
                                                    : "bg-green-100"
                                            }`}>
                                                {!isAvailable ? (
                                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                    </svg>
                                                )}
                                            </div>
                                            <p className="font-semibold text-gray-900">{table.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {table.seats} seats
                                            </p>
                                            <div className="mt-2">
                                                {isSelected && isAvailable ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Selected
                                                    </span>
                                                ) : !isAvailable && reservationDate && reservationTime ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                                        Unavailable
                                                    </span>
                                                ) : !reservationDate || !reservationTime ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        Select date & time first
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                                                        Available
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    
                    {!tablesLoading && !tablesError && tables.length > 0 && (!reservationDate || !reservationTime) && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700 text-center">
                                Please select a date and time first to see table availability
                            </p>
                        </div>
                    )}
                </div>

                {/* Guest Count */}
                {selectedTable && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Guests
                        </label>
                        <select
                            value={guestCount}
                            onChange={(e) => setGuestCount(Number(e.target.value))}
                            className="w-full border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                        >
                            {Array.from({
                                length: tables.find((t) => t.id === selectedTable)?.seats || 1,
                            }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1} {i + 1 === 1 ? 'guest' : 'guests'}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || tablesLoading || !selectedTable}
                        className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400 flex items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            'Confirm Reservation'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ReserveSeatModal;