import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode
import "react-toastify/dist/ReactToastify.css";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => emailRegex.test(email.trim());

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.trim() === "") {
      toast.error("Password cannot be empty.");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:3000/admin/login",
        { email: email.trim(), password: password.trim() },
        { headers: { "Content-Type": "application/json" } }
      );

      if (data.status === "ok") {
        localStorage.setItem("adminApp_token", data.token); // Change 'data.user' to 'data.token'
        toast.success("Login Successful");
        navigate("/admin/dashboard");
      } else {
        toast.error("Please check your email or password.");
      }
    } catch (error) {
      console.error("Error:", error.response || error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const checkTokenValidity = () => {
    const token = localStorage.getItem("adminApp_token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000; // Get current time in seconds

        // Check if the token is expired
        if (decoded.exp < currentTime) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("adminApp_token"); // Clear expired token
          navigate("/admin"); // Redirect to login page
        }
      } catch (error) {
        console.error("Token validation error:", error);
        toast.error("Invalid token. Please log in again.");
        localStorage.removeItem("adminApp_token"); // Clear invalid token
        navigate("/admin"); // Redirect to login page
      }
    }
  };

  // Check token validity on component mount
  useEffect(() => {
    checkTokenValidity();
  }, []);

  return (
    <div className="flex justify-center items-center w-full h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-80">
        <h1 className="mb-6 text-center text-2xl font-bold">Admin Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            aria-label="Email"
            required
          />
          <input
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            aria-label="Password"
            required
          />
          <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300">
            Login
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default AdminLogin;
