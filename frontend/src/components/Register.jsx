import { useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const navigate = useNavigate();
  const name = useRef("");
  const email = useRef("");
  const mobile = useRef("");
  const password = useRef("");
  const confirmPassword = useRef("");

  const validateName = (name) => {
    const trimmedName = name.trim();
    return trimmedName.length >= 4; // Minimum 4 characters
  };
  const validateEmail = (email) => {
    const trimmedEmail = email.trim();
    const [localPart, domainPart] = trimmedEmail.split("@");
    const [domain, tld] = domainPart ? domainPart.split(".") : [];
    return (
      trimmedEmail.length > 0 &&
      localPart.length >= 3 &&
      domainPart &&
      domain.length >= 2 &&
      tld.length >= 2
    );
  };
  const validateMobile = (mobile) => {
    const trimmedMobile = mobile.trim();
    return /^[0-9]{10}$/.test(trimmedMobile); // 10 digit mobile number
  };
  const validatePassword = (password) => {
    const trimmedPassword = password.trim();
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(trimmedPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateName(name.current.value)) {
      toast.error("Please enter a valid name (at least 4 characters).");
      return;
    }

    if (!validateEmail(email.current.value)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!validateMobile(mobile.current.value)) {
      toast.error("Mobile number must be 10 digits.");
      return;
    }

    if (!validatePassword(password.current.value)) {
      toast.error(
        "Password must be at least 8 characters long, include uppercase, lowercase, digit, and special character."
      );
      return;
    }

    if (password.current.value.trim() !== confirmPassword.current.value.trim()) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:3000/signup",
        {
          name: name.current.value.trim(),
          email: email.current.value.trim(),
          mobile: mobile.current.value.trim(),
          password: password.current.value.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      // Handle API response
      if (data.status === "ok") {
        navigate("/login");
      } else if (data.status === "error" && data.error === "User with this email already exists") {
        toast.error("This email is already in use. Please try another one.");
      } else {
        toast.error(data.message || "Signup failed.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-80">
        <h1 className="mb-6 text-center text-2xl font-bold">Register</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            className="border border-gray-300 p-2 rounded-md"
            ref={name}
            type="text"
            placeholder="Name"
            required
          />
          <input
            className="border border-gray-300 p-2 rounded-md"
            ref={email}
            type="email"
            placeholder="Email"
            required
          />
          <input
            className="border border-gray-300 p-2 rounded-md"
            ref={mobile}
            type="tel"
            placeholder="Mobile Number"
            required
          />
          <input
            className="border border-gray-300 p-2 rounded-md"
            ref={password}
            type="password"
            placeholder="Password"
            required
          />
          <input
            className="border border-gray-300 p-2 rounded-md"
            ref={confirmPassword}
            type="password"
            placeholder="Confirm Password"
            required
          />
          <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300">
            Signup
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-500 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Register;
