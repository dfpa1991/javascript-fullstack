// Importing the express router
const { Router } = require("express");

// Initializing the router
const router = Router();

// Routes
router.get("/", (req, res) => {
    res.json({ message: "Hello World" });
});

// Exporting the router
module.exports = router;