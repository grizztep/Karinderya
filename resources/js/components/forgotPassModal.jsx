import React, { useState } from "react";

const ForgotPassModal = ({ onClose, onBackToLogin }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch("/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
                },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("✅ Password reset link has been sent to your email.");
                setEmail("");
            } else {
                setError(data.message || "Failed to send reset link.");
            }
        } catch (err) {
            setError("⚠️ Network error, please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter your email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                        placeholder="you@example.com"
                        required
                    />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {message && <p className="text-sm text-green-600">{message}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            <div className="text-center">
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                    ← Back to Login
                </button>
            </div>
        </div>
    );
};

export default ForgotPassModal;
