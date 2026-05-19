"use client";

import { useState } from "react";
import axios from "axios";

export default function AdminPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const addFeed = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/feed",
        {
          message,
        }
      );

      setSuccess("Feed added successfully!");

      setMessage("");

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Admin Panel
        </h1>

        <p className="text-gray-500 mb-8">
          Add realtime coaching feed updates
        </p>

        <textarea
          rows="5"
          placeholder="Enter feed message..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          className="w-full border border-gray-300 rounded-2xl p-5 text-lg focus:outline-none focus:ring-2 focus:ring-black"
        />

        <button
          onClick={addFeed}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-2xl text-lg font-semibold mt-6 hover:bg-gray-800 transition"
        >
          {loading ? "Adding Feed..." : "Add Feed"}
        </button>

        {success && (
          <div className="mt-5 bg-green-100 text-green-700 p-4 rounded-xl">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}