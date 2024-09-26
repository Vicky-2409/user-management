const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String
    }
}, { 
    collection: "users",
    timestamps: true    // Add timestamps for createdAt and updatedAt
});


const userModel = mongoose.model("User",userSchema)

module.exports = userModel;