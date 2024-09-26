const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const upload = require("../helper/multer");
const adminAuthuthMiddleware = require('../middleware/adminAuthMiddleware'); 

// Define admin-related routes
router.post('/login', adminController.adminDoLogin); // Admin login route
router.get('/users', adminAuthuthMiddleware, adminController.adminDashboard); // Protected route to fetch all users
router.post('/users', adminAuthuthMiddleware, upload.single('profileImage'), adminController.createUser); // Protected route to create a new user
router.put('/users/:userId', adminAuthuthMiddleware, upload.single('profileImage'), adminController.updateUser); // Protected route to update a user
router.delete('/users/:userId', adminAuthuthMiddleware, adminController.deleteUser); // Protected route to delete a user

module.exports = router; // Export the router
