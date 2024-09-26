
const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const upload = require("../helper/multer");
const authMiddleware = require('../middleware/authMiddleware');  // Import JWT middleware

// Define your routes
router.post('/signup', userController.doSignup);
router.post('/login', userController.doLogin);
router.get('/profile', userController.loadProfile);  // Protected route
router.put('/profile', upload.single('profileImage'), userController.editProfile);  // Protected route with file upload

module.exports = router;  // Export the router
