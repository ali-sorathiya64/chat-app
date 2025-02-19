import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast';

const UserProfileUpdate = () => {
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://https://full-stack-chat-app-mern.vercel.app/v1/user"; // Replace with your backend URL if needed

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/me`, {
          withCredentials: true,
        });
        setBio(data.user.bio || "");
        setPreviewAvatar(data.user.avatar?.url || "");
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data?.message || error.message);
        toast.error("Failed to fetch user profile. Please check your connection.");
      }
    };
    fetchProfile();
  }, [API_BASE_URL]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewAvatar(URL.createObjectURL(file)); // Show preview of the selected avatar
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("bio", bio);
    if (avatar) formData.append("avatar", avatar);

    try {
      const { data } = await axios.put(`${API_BASE_URL}/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      toast.success(data.message || "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error.response?.data?.message || error.message);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center text-white mb-6">Update Profile</h2>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-md bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write a brief bio..."
            rows="4"
          ></textarea>
        </div>

        <div className="mb-4 text-center">
          <label className="block text-sm font-medium text-gray-300 mb-2">Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="block mx-auto mb-3 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-700 file:bg-gray-700 file:text-gray-400 hover:file:bg-gray-600"
          />
          {previewAvatar && (
            <img
              src={previewAvatar}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-700 mx-auto shadow-sm"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-sm font-semibold text-white rounded-md transition-all ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"}`}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default UserProfileUpdate;
