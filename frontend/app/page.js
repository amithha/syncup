"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";

const socket = io("http://localhost:5000");

export default function Home() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeeds();

    socket.off("new-feed").on("new-feed", (newFeed) => {
      setFeeds((prev) => [newFeed, ...prev]);
    });

    socket.off("delete-feed").on("delete-feed", (id) => {
      setFeeds((prev) =>
        prev.filter((feed) => feed._id !== id)
      );
    });

    return () => {
      socket.off("new-feed");
      socket.off("delete-feed");
    };
  }, []);

  const fetchFeeds = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/feed"
      );

      setFeeds(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteFeed = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/feed/${id}`
      );

      setFeeds((prev) =>
        prev.filter((feed) => feed._id !== id)
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-8">
      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h1 className="text-5xl font-bold text-gray-800">
            SyncUp Feed
          </h1>

          <p className="text-gray-500 mt-3 text-lg">
            Realtime coaching updates powered by
            Socket.IO and Redis
          </p>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 mt-6 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            <PlusCircle size={20} />
            Add Feed
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-xl font-semibold">
            Loading feeds...
          </div>
        ) : feeds.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow">
            <h2 className="text-2xl font-semibold text-gray-700">
              No feeds available
            </h2>

            <p className="text-gray-500 mt-2">
              Add feeds from admin panel
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {feeds.map((feed) => (
              <div
                key={feed._id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:scale-[1.01] transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xl text-gray-800 font-medium">
                      {feed.message}
                    </p>

                    <p className="text-sm text-gray-400 mt-3">
                      {new Date(
                        feed.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteFeed(feed._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}