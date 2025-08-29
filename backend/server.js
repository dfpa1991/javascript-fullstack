// Importing the dotenv module
require("dotenv").config();

// Importing the express module
const express = require("express");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
// Intializing the express app
const app = express();
// Importing the database
require("./database");

// Port setting
app.set("port", process.env.PORT || 3000);  // dotenv is used to get the port from the .env file -> Variable name is PORT

// Middleware
app.use(morgan("dev")); // Logging

// Configuring multer for file uploads
const storage = multer.diskStorage({
    destination: path.join(__dirname, "public/uploads"),
    filename: (req, file, callback) => {
        callback(null, new Date().getTime() + path.extname(file.originalname)); // Add timestamp to the filename and extract the extension
    }
});

app.use(multer({ storage }).single("image")); // Multer for file uploads
// Express urlencoded middleware
app.use(express.urlencoded({ extended: false }));
// Express json middleware
app.use(express.json());

// Routes - Importing the books route
app.use('/api/books', require("./routes/books")); // Serve the route /api/books to send JSON data

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Starting the server
app.listen(app.get("port"), () => {
    console.log(`Server is running on port ${app.get('port')}`);
});