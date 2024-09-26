const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require('path');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));




const userRouter = require('./routes/user');  // Import user router
const adminRouter = require('./routes/admin');  // Import admin router

app.use('/', userRouter);  // Use router middleware
app.use('/admin', adminRouter);  // Use admin router middleware if applicable

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
