import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultProfileImage = "https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"; // Replace with your dummy image URL

const Profile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [profileImage, setProfileImage] = useState(defaultProfileImage);
  const [imagePreview, setImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please log in.");
        return;
      }
  
      const { data } = await axios.get("http://localhost:3000/profile", {
        headers: {
          "Authorization": `Bearer ${token}`, // Using Bearer scheme
        },
      });
  
      if (data.status === "ok") {
        setName(data.user.name);
        setEmail(data.user.email);
        setMobile(data.user.mobile);
        if (data.user.profileImage) {
          setProfileImage(data.user.profileImage);
        }
      } else {
        toast.error(data.error || "Failed to load profile.");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile. " + (error.response ? error.response.data.error : ""));
    }
  };
  
  
  
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setProfileImage(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Basic validation
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email cannot be empty.");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!String(mobile).trim()) {
      toast.error("Mobile number cannot be empty.");
      return;
    }
    const mobilePattern = /^[0-9]{10}$/; // Assuming a 10-digit mobile number
    if (!mobilePattern.test(mobile)) {
      toast.error("Mobile number must be 10 digits long and contain only numbers.");
      return;
    }
  
    // Check if the profile image is a valid file type and size (if needed)
    if (profileImage && typeof profileImage !== "string") {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(profileImage.type)) {
        toast.error("Only JPEG, PNG, or GIF files are allowed.");
        return;
      }
      if (profileImage.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Profile image must be smaller than 2MB.");
        return;
      }
    }
  
    // Create FormData object
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("mobile", mobile);
    
    // Check if the profile image is a valid file
    if (profileImage && typeof profileImage !== "string") {
      formData.append("profileImage", profileImage);
    }
  
    try {
      console.log("Submitting profile data:", {
        name,
        email,
        mobile,
        profileImage: typeof profileImage === "string" ? profileImage : "File"
      }); // Debugging line
  
      const { data } = await axios.put("http://localhost:3000/profile", formData, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Profile update response:", data); // Debugging line
  
      if (data.status === "ok") {
        toast.success("Profile updated successfully.");
        loadProfile(); // Reload profile data
        setIsEditing(false); // Exit editing mode
      } else {
        toast.error(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Something went wrong. Please try again." + (error.response ? error.response.data.error : ""));
    }
  };
  
  

  // Logout function to clear token and redirect
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const user = jwtDecode(token);
        if (!user) {
          localStorage.removeItem("token");
          navigate("/");
        } else {
          loadProfile();
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        navigate("/");
      }
    } else {
      navigate("/");
    }
    
  }, [navigate]);

  return (
    <div className="relative flex justify-center items-center w-full h-screen bg-gray-100">
      {/* Log Out button in the top-right corner */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-300"
      >
        Log Out
      </button>

      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="mb-6 text-center text-2xl font-bold">Profile</h1>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              className="border border-gray-300 p-2 rounded-md"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
            />
            <input
              className="border border-gray-300 p-2 rounded-md"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              hidden
            />
            <input
              className="border border-gray-300 p-2 rounded-md"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile Number"
              required
            />
            <input
              className="border border-gray-300 p-2 rounded-md"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Profile Preview" className="mb-4 w-32 h-32 object-cover rounded-full mx-auto" />
            )}
            <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300">
              Update Profile
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-red-500 hover:underline mt-2"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <img
              src={profileImage ? `http://localhost:3000/uploads/${profileImage}` : defaultProfileImage}
              alt="Profile"
              className="mb-4 w-32 h-32 object-cover rounded-full"
            />
            <p className="text-lg font-semibold">Name: {name}</p>
            <p className="text-lg font-semibold">Email: {email}</p>
            <p className="text-lg font-semibold">Mobile: {mobile}</p>

            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Edit Profile
            </button>
          </div>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Profile;
