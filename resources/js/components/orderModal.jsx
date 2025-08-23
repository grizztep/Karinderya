import React, { useState, useEffect } from "react";
import axios from "axios";

// Order Modal Component
const OrderModal = ({ user, onClose, defaultItem }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [riceQuantity, setRiceQuantity] = useState(0);
  const [availableDishes, setAvailableDishes] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({
    customer_name: user?.name || "",
    customer_address: user?.address || "",
    notes: "",
    payment: "COD",
  });
  const [useDefaultName, setUseDefaultName] = useState(true);
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);

  useEffect(() => {
    // Fetch available dishes
    const fetchDishes = async () => {
      try {
        const res = await axios.get("/dishes");
        // Filter out rice from available dishes
        const dishesWithoutRice = res.data.filter(dish => 
          dish.name.toLowerCase() !== 'rice' && dish.available
        );
        setAvailableDishes(dishesWithoutRice);
      } catch (error) {
        console.error("Error fetching dishes:", error);
      }
    };
    fetchDishes();

    // Add default item if provided
    if (defaultItem) {
      setOrderItems([{
        dish_id: defaultItem.id,
        name: defaultItem.name,
        price: defaultItem.price,
        quantity: 1
      }]);
    }
  }, [defaultItem]);

  const addDishToOrder = (dish) => {
    const existingItem = orderItems.find(item => item.dish_id === dish.id);
    if (existingItem) {
      // Increase quantity if dish already exists
      setOrderItems(prev => prev.map(item => 
        item.dish_id === dish.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new dish
      setOrderItems(prev => [...prev, {
        dish_id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: 1
      }]);
    }
  };

  const updateItemQuantity = (dishId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(dishId);
    } else {
      setOrderItems(prev => prev.map(item => 
        item.dish_id === dishId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeItemFromOrder = (dishId) => {
    setOrderItems(prev => prev.filter(item => item.dish_id !== dishId));
  };

  const calculateSubtotal = () => {
    const dishesTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const riceTotal = riceQuantity * 15;
    return dishesTotal + riceTotal;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + 20; // Add delivery fee
  };

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      alert("Please add at least one dish to your order.");
      return;
    }

    try {
      // Generate a unique order identifier to group related items
      const orderGroupId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Prepare all items for the order
      const allOrderItems = [...orderItems];
      
      // Add rice to the order items if ordered
      if (riceQuantity > 0) {
        const dishesResponse = await axios.get("/dishes");
        const riceDish = dishesResponse.data.find(dish => dish.name.toLowerCase() === 'rice');
        
        if (riceDish) {
          allOrderItems.push({
            dish_id: riceDish.id,
            name: 'Rice',
            price: 15,
            quantity: riceQuantity
          });
        }
      }

      // Submit each item as part of the same order group
      const orderPromises = allOrderItems.map((item, index) => {
        return axios.post("/orders", {
          user_id: user?.id,
          dish_id: item.dish_id,
          customer_name: customerDetails.customer_name,
          customer_address: customerDetails.customer_address,
          quantity: item.quantity,
          notes: index === 0 
            ? `${customerDetails.notes} [Order Group: ${orderGroupId}] [Items: ${allOrderItems.length}] [Total: ₱${calculateTotal()}]` 
            : `${customerDetails.notes} [Order Group: ${orderGroupId}]`,
          payment: customerDetails.payment,
          item_subtotal: item.price * item.quantity, // Individual item cost
          delivery_fee: index === 0 ? 20 : 0, // Apply delivery fee only to first item
          order_group_id: orderGroupId // Group identifier
        });
      });

      await Promise.all(orderPromises);

      // Create order summary
      let orderSummary = "Order placed successfully!\n\nItems:\n";
      orderItems.forEach(item => {
        orderSummary += `${item.quantity}x ${item.name} - ₱${item.price * item.quantity}\n`;
      });
      if (riceQuantity > 0) {
        orderSummary += `${riceQuantity}x Rice - ₱${riceQuantity * 15}\n`;
      }
      orderSummary += `\nSubtotal: ₱${calculateSubtotal()}`;
      orderSummary += `\nDelivery Fee: ₱20`;
      orderSummary += `\nPayment: ${customerDetails.payment}`;
      orderSummary += `\nTotal: ₱${calculateTotal()}`;

      alert(orderSummary);
      onClose();
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="space-y-4 bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-auto my-8">
        {/* Greeting */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-800">
            Hello, {user?.name} 👋
          </h2>
          <p className="text-green-700 text-sm">
            Build your order by adding dishes below.
          </p>
        </div>

        {/* Current Order Items */}
        {orderItems.length > 0 && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Your Order:</h3>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.dish_id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">₱{item.price} each</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateItemQuantity(item.dish_id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(item.dish_id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center text-sm font-bold"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItemFromOrder(item.dish_id)}
                      className="ml-2 text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add More Dishes */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-3">Add More Dishes:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {availableDishes.map((dish) => (
              <button
                key={dish.id}
                onClick={() => addDishToOrder(dish)}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 text-left"
              >
                <div>
                  <div className="font-medium">{dish.name}</div>
                  <div className="text-sm text-gray-500">₱{dish.price}</div>
                </div>
                <div className="text-green-600 font-bold text-xl">+</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rice Add-on */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            🍚 Add Rice?
          </h3>
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600">Quantity:</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRiceQuantity(Math.max(0, riceQuantity - 1))}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{riceQuantity}</span>
              <button
                onClick={() => setRiceQuantity(riceQuantity + 1)}
                className="w-8 h-8 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center text-sm font-bold"
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-500">₱15 each</span>
          </div>
          {riceQuantity > 0 && (
            <p className="text-sm text-green-600 mt-2">
              Rice subtotal: ₱{riceQuantity * 15}
            </p>
          )}
        </div>

        {/* Customer Details */}
        <div className="space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name
            </label>
            <div className="flex items-center space-x-3 mb-2">
              <input
                type="radio"
                id="defaultName"
                name="customerName"
                checked={useDefaultName}
                onChange={() => {
                  setUseDefaultName(true);
                  setCustomerDetails(prev => ({ ...prev, customer_name: user?.name || "" }));
                }}
              />
              <label htmlFor="defaultName" className="text-sm text-gray-700">
                Use my account name ({user?.name || "Not set"})
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="newName"
                name="customerName"
                checked={!useDefaultName}
                onChange={() => {
                  setUseDefaultName(false);
                  setCustomerDetails(prev => ({ ...prev, customer_name: "" }));
                }}
              />
              <label htmlFor="newName" className="text-sm text-gray-700">
                Enter a different name
              </label>
            </div>
            {!useDefaultName && (
              <input
                type="text"
                value={customerDetails.customer_name}
                onChange={(e) =>
                  setCustomerDetails(prev => ({ ...prev, customer_name: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address
            </label>
            <div className="flex items-center space-x-3 mb-2">
              <input
                type="radio"
                id="defaultAddress"
                name="customerAddress"
                checked={useDefaultAddress}
                onChange={() => {
                  setUseDefaultAddress(true);
                  setCustomerDetails(prev => ({ ...prev, customer_address: user?.address || "" }));
                }}
              />
              <label htmlFor="defaultAddress" className="text-sm text-gray-700">
                Use my current address ({user?.address || "Not set"})
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="newAddress"
                name="customerAddress"
                checked={!useDefaultAddress}
                onChange={() => {
                  setUseDefaultAddress(false);
                  setCustomerDetails(prev => ({ ...prev, customer_address: "" }));
                }}
              />
              <label htmlFor="newAddress" className="text-sm text-gray-700">
                Enter a different address
              </label>
            </div>
            {!useDefaultAddress && (
              <textarea
                value={customerDetails.customer_address}
                onChange={(e) =>
                  setCustomerDetails(prev => ({ ...prev, customer_address: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="2"
                required
              />
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={customerDetails.payment}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, payment: e.target.value }))}
            >
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="GCash" disabled>GCash (available soon)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Instructions
            </label>
            <textarea
              value={customerDetails.notes}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 border rounded-lg p-3">
          <h3 className="font-medium mb-2">Order Summary:</h3>
          {orderItems.map((item) => (
            <div key={item.dish_id} className="flex justify-between text-sm">
              <span>{item.name} ({item.quantity}x ₱{item.price}):</span>
              <span>₱{item.quantity * item.price}</span>
            </div>
          ))}
          {riceQuantity > 0 && (
            <div className="flex justify-between text-sm">
              <span>Rice ({riceQuantity}x ₱15):</span>
              <span>₱{riceQuantity * 15}</span>
            </div>
          )}
          <div className="flex justify-between text-sm border-t pt-2 mt-2">
            <span>Subtotal:</span>
            <span>₱{calculateSubtotal()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee:</span>
            <span>₱20</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2 mt-2">
            <span>Total:</span>
            <span>₱{calculateTotal()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={orderItems.length === 0}
            className={`px-4 py-2 rounded-lg text-white font-semibold ${
              orderItems.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Menu Component
const Menu = ({ user }) => {
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/dishes");
        // Filter out rice from the menu display
        const dishesWithoutRice = res.data.filter(dish => 
          dish.name.toLowerCase() !== 'rice'
        );
        setDishes(dishesWithoutRice);
        setError(null);
      } catch (error) {
        console.error("Error fetching dishes:", error);
        setError("Failed to load menu items. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDishes();
  }, []);

  const handleOrderNow = (dish) => {
    if (!dish.available) {
      alert(`${dish.name} is sold out!`);
      return;
    }
    setSelectedDish(dish);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDish(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Menu</h1>
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading menu items...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Menu</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Menu</h1>

      {dishes.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No menu items available at the moment.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-800">{dish.name}</h3>
                <p className="text-gray-600 mb-4">₱{dish.price}</p>
              </div>

              <button
                onClick={() => handleOrderNow(dish)}
                className={`w-full px-4 py-2 rounded-lg text-white font-semibold transition-colors
                  ${
                    dish.available
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                disabled={!dish.available}
              >
                {dish.available ? "Order Now" : "Sold Out"}
              </button>
            </div>
          ))}

          {/* Extra "Coming Soon" card */}
          <div className="border rounded-lg p-4 shadow-sm bg-gray-100 flex flex-col justify-center items-center text-center">
            <h3 className="font-semibold text-lg text-gray-700 mb-2">
              New Dishes Coming Soon
            </h3>
            <p className="text-gray-500 text-sm">Stay tuned for our latest menu updates!</p>
          </div>
        </div>
      )}

      {showModal && (
        <OrderModal
          user={user}
          onClose={handleCloseModal}
          defaultItem={selectedDish}
        />
      )}
    </div>
  );
};

export default Menu;