"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  Camera,
  UserPlus,
  Users,
  Check,
  X,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import useUser from "../../utils/useUser";
import useUpload from "../../utils/useUpload";

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user, loading: userLoading, refetch } = useUser();
  const [friends, setFriends] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [upload, { loading: uploading }] = useUpload();
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (user) {
      fetchFriends();
      updateLastSeen();

      // Update last_seen every minute
      const interval = setInterval(updateLastSeen, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const updateLastSeen = async () => {
    try {
      await fetch("/api/profile", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error updating last_seen:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends");
      if (!response.ok) throw new Error("Failed to fetch friends");

      const { friends: friendsData } = await response.json();
      setFriends(friendsData);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!friendEmail.trim()) return;

    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendEmail }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        alert(error || "Failed to send friend request");
        return;
      }

      setFriendEmail("");
      setShowAddFriend(false);
      fetchFriends();
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error adding friend:", error);
      alert("Failed to send friend request");
    }
  };

  const handleAcceptFriend = async (friendId) => {
    try {
      const response = await fetch("/api/friends", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });

      if (!response.ok) throw new Error("Failed to accept friend");

      fetchFriends();
    } catch (error) {
      console.error("Error accepting friend:", error);
      alert("Failed to accept friend request");
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;

    try {
      const response = await fetch(`/api/friends?friendId=${friendId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove friend");

      fetchFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("Failed to remove friend");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await upload({ file });

      if (result.error) {
        throw new Error(result.error);
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: result.url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile picture");
      }

      // Update local state immediately
      setProfileImage(result.url);

      // Also refetch user data
      await refetch();
      alert("Profile picture updated!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error.message || "Failed to upload image");
    }
  };

  const pendingRequests = friends.filter((f) => f.status === "pending");
  const acceptedFriends = friends.filter((f) => f.status === "accepted");

  // Use profileImage state if set, otherwise fall back to user.image
  const displayImage = profileImage || user?.image;

  if (userLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden text-sm font-['Instrument_Sans']"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <section className="flex-1 flex flex-col min-w-0">
        <header
          className="h-14 px-4 md:px-8 flex items-center justify-between border-b"
          style={{ borderColor: "var(--color-secondary)" }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-2 min-w-[300px]">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/subjects?search=${encodeURIComponent(
                      searchQuery
                    )}`;
                  }
                }}
                className="placeholder-gray-400 text-sm flex-1 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div
            className="w-6 h-6 rounded-full border-4"
            style={{ borderColor: "var(--color-primary)" }}
          ></div>

          <div className="flex items-center gap-4">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <Bell size={20} className="text-gray-600" />
            </button>

            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors">
              <div className="relative">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {user?.name?.[0] || "U"}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="hidden sm:block font-medium text-gray-900">
                {user?.name || "User"}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        <main
          className="flex-1 overflow-y-auto p-4 md:p-8"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          <h1 className="text-xl md:text-2xl font-medium text-gray-900 mb-8">
            Profile & Friends
          </h1>

          <div className="max-w-4xl grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Profile Section */}
            <div
              className="rounded-lg border p-6"
              style={{
                borderColor: "var(--color-secondary)",
                backgroundColor: "var(--color-background)",
              }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                My Profile
              </h2>

              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={user.name || "User"}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-white font-semibold text-3xl"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      {user?.name?.[0] || "U"}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-white"></div>

                  <label
                    htmlFor="profile-image"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    <Camera size={16} className="text-white" />
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>

                <h3 className="text-xl font-semibold text-gray-900">
                  {user?.name || "User"}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              {uploading && (
                <div className="text-center text-sm text-gray-500 mb-4">
                  Uploading image...
                </div>
              )}
            </div>

            {/* Friends Section */}
            <div
              className="rounded-lg border p-6"
              style={{
                borderColor: "var(--color-secondary)",
                backgroundColor: "var(--color-background)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Friends ({acceptedFriends.length})
                </h2>
                <button
                  onClick={() => setShowAddFriend(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-white rounded-full transition-colors text-sm"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <UserPlus size={14} />
                  Add Friend
                </button>
              </div>

              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Pending Requests
                  </h3>
                  <div className="space-y-2">
                    {pendingRequests.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {friend.image ? (
                              <img
                                src={friend.image}
                                alt={friend.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                                style={{
                                  backgroundColor: "var(--color-primary)",
                                }}
                              >
                                {friend.name?.[0] || "U"}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {friend.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {friend.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptFriend(friend.id)}
                            className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleRemoveFriend(friend.id)}
                            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends List */}
              <div className="space-y-2">
                {acceptedFriends.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No friends yet</p>
                    <p className="text-xs">
                      Add friends to see their study status
                    </p>
                  </div>
                ) : (
                  acceptedFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {friend.image ? (
                            <img
                              src={friend.image}
                              alt={friend.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                              style={{
                                backgroundColor: "var(--color-primary)",
                              }}
                            >
                              {friend.name?.[0] || "U"}
                            </div>
                          )}
                          {friend.is_online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {friend.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {friend.is_online ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </section>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add Friend
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter your friend's email address to send a friend request
            </p>
            <input
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none mb-4"
              style={{ borderColor: "var(--color-secondary)" }}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddFriend(false);
                  setFriendEmail("");
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFriend}
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}