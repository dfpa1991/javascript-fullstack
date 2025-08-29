const mongoose = require("mongoose");

console.log(process.env.MONGODB_URL);

// Connect to MongoDB -> //useNewUrlParser: true <- deprecated
mongoose.connect(process.env.MONGODB_URL)
.then(db => console.log("Connected to MongoDB. Host:", db.connection.host))
.catch(err => console.log(err));
