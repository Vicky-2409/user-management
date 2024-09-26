const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import JWT for token generation
const User = require("../models/userModel")

// Secret for signing the JWT (should be stored in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "yourSuperSecretKey";

const adminDoLogin = async (req, res) => {
  try {
    const adminData = {
      email: "admin@gmail.com",
      password: await bcrypt.hash("Admin@123", 10), // Hashed password
    };

    let adminEmail = req.body.email;
    let adminPassword = req.body.password;

    // Simulating a database query - replace this with actual DB logic
    // const adminData = await Admin.findOne({ email: adminEmail });

    if (adminData && adminEmail === adminData.email) {
      const isPasswordValid = await bcrypt.compare(adminPassword, adminData.password);

      if (isPasswordValid) {
        const token = jwt.sign(
          { id: adminData.email, name: "Admin" },
          process.env.JWT_SECRET || 'your_default_secret',
          { expiresIn: '1h' }
        );

        res.json({ status: 'ok', token, message: 'Login successful' });
      } else {
        res.status(401).json({ status: 'error', message: 'Incorrect email or password' });
      }
    } else {
      res.status(401).json({ status: 'error', message: 'Incorrect email or password' });
    }
  } catch (error) {
    console.error("Login error: ", error);
    res.status(500).json({ status: 'error', message: 'An error occurred, please try again.' });
  }
};



const adminDashboard  = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.json(users); // Send users as JSON
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Email already exists.' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    const userData = { ...req.body, password: hashedPassword };
    if (req.file) {
      userData.profileImage = req.file.filename; // Save the uploaded filename
    }

    // Proceed to create the user
    const newUser = new User(userData);
    await newUser.save();
    res.status(201).json({ status: 'ok', message: 'User created successfully.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, password } = req.body;

    // Check if the email already exists, but ignore the current user's email
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ status: 'error', message: 'Email already in use.' });
    }

    // Hash the password if it's being updated
    const updateData = { ...req.body };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (req.file) {
      updateData.profileImage = req.file.filename; // Save the uploaded filename
    }

    // Proceed to update the user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    res.json({ status: 'ok', message: 'User updated successfully', updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};




const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ status: 'ok', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error });
  }
};



module.exports = { adminDoLogin, adminDashboard, createUser, updateUser, deleteUser };
