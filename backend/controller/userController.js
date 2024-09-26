const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Function to hash the password
const hashPassword = async (password) => {
  if (!password) {
    throw new Error("Password is required for hashing");
  }
  return await bcrypt.hash(password, 10); // Salt rounds set to 10
};

// Signup function
const doSignup = async (req, res) => {

  try {
    const { name, email, mobile, password } = req.body;

    // Check if the required fields are present
    if (!password) {
      return res.json({ status: "error", error: "Password is required" });
    }

    if (!email) {
      return res.json({ status: "error", error: "Email is required" });
    }

    // Check if user with the same email already exists
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ status: "error", error: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);
    const defaultProfileImage = "default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"; // Replace with your dummy image URL


    // Create a new user with the hashed password
    const user = await userModel.create({
      name,
      email,
      mobile,
      password: hashedPassword, // Store hashed password
      profileImage: defaultProfileImage
    });

    res.json({ status: "ok", message: "User created successfully" });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.json({ status: "error", error: error.message });
  }
};


// Login function
const doLogin = async (req, res) => {

  try {
    // Find user by email
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      // Compare password with hashed password
      if (await bcrypt.compare(req.body.password, user.password)) {
        // Generate a JWT token
        const token = jwt.sign(
          {
            name: user.name,
            email: user.email,
          },
          "secret", // Ensure to use environment variables for the secret in production
          { expiresIn: "1h" } // Token expires in 1 hour
        );
        return res.json({ status: "ok", user: token });
      } else {
        return res.json({ status: "error", user: false, error: "Invalid credentials" });
      }
    } else {
      return res.json({ status: "error", user: false, error: "User not found" });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.json({ status: "error", error: error.message });
  }
};

// Load profile function
const loadProfile = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.json({ status: "error", error: "No token provided" });
    }

    const decoded = jwt.verify(token, "secret");
    const email = decoded.email;

    

    // Find user by email
    const user = await userModel.findOne({ email });
    if (user) {
      return res.json({ status: "ok", user });
    } else {
      return res.json({ status: "error", error: "User not found" });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.json({ status: "error", error: "Token validation failed" });
  }
};


const editProfile = async (req, res) => {
  try {
    // Log the headers to debug


    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.json({ status: "error", error: "No token provided" });
    }

    const decoded = jwt.verify(token, "secret");
    const email = decoded.email;

    // Find the user and update their profile
    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        ...(req.file && { profileImage: req.file.filename }),
      },
      { new: true }
    );

    if (updatedUser) {
      return res.json({ status: "ok", user: updatedUser });
    } else {
      return res.json({ status: "error", error: "User not found" });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.json({ status: "error", error: error.message });
  }
};



module.exports = { doSignup, doLogin, loadProfile, editProfile };
