// Importing the dotenv module
// Check if the environment is development or production
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
} else {
    require("dotenv").config({ path: ".env.production" }); // Production mode
}
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
// Express json middleware <- Server understands JSON data
app.use(express.json());
// Root route
// Routes - Importing the books route
app.use('/api/books', require("./routes/books")); // Serve the route /api/books to send JSON data
// Static files, public route
app.use(express.static(path.join(__dirname, "public")));
// 404 API error handler
app.use(/^\/api\/.*/, (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 404,
            codeMessage: 'ROUTE_NOT_FOUND',
            message: 'API endpoint not found',
            path: req.originalUrl,
            method: req.method,
            avalableEndpoints: [
                'GET /api/books',
                'DELETE /api/books/:id',
                'POST /api/books',
                'POST /api/books/bulk'
            ]
        }
    });  
});
// 404 all other routes - Wildcard route Regex
app.use(/^.*/, (req, res) => {
    res.status(404).send('<h1>404 Not Found</h1>');
});

// Starting the server
app.listen(app.get("port"), () => {
    console.log(`Server is running on port ${app.get('port')}`);
});

