import { useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const email = useRef("");
  const password = useRef("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const trimmedEmail = email.trim();
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedEmail);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail(email.current.value)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.current.value.trim() === "") {
      toast.error("Password cannot be empty.");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:3000/login",
        {
          email: email.current.value.trim(),
          password: password.current.value.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.user) {
        localStorage.setItem("token", data.user);
        toast.success("Login Successful");
        navigate("/profile");
      } else {
        toast.error("Please check your email or password.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-80">
        <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            className="border border-gray-300 p-2 rounded-md"
            ref={email}
            type="email"
            placeholder="Email"
            required
          />
          <input
            className="border border-gray-300 p-2 rounded-md"
            ref={password}
            type="password"
            placeholder="Password"
            required
          />
          <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300">
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <button onClick={() => navigate("/")} className="text-blue-500 hover:underline">
            Register
          </button>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
