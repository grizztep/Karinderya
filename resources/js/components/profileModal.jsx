import React, { useState } from "react";

const ProfileModal = ({ user, onClose, isEditing, setIsEditing }) => {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        address: user?.address || "",
        contact_number: user?.contact_number || ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = (e) => {
        e.preventDefault();

        fetch("/update-profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content"),
            },
            body: JSON.stringify(formData),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Profile updated successfully!");
                window.location.reload();
            } else {
                alert("Failed to update profile");
            }
        })
        .catch(() => alert("An error occurred while updating profile"));
    };

    return (
        <div className="space-y-4">
            {!isEditing ? (
                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-800">{user.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">{user.email}</p>
                    </div>
                    {user.address && (
                        <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium text-gray-800">{user.address}</p>
                        </div>
                    )}
                    {user.contact_number && (
                        <div>
                            <p className="text-sm text-gray-500">Contact Number</p>
                            <p className="font-medium text-gray-800">{user.contact_number}</p>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input
                            type="text"
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProfileModal;
