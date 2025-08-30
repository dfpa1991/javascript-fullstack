const { Schema, model } = require("mongoose");

const BookSchema = new Schema ({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true }, // unique: true -> ensures that the ISBN is unique - No duplicates. If so mongodb will throw and error 11000
    imagePath: { type: String, required: false },
    created_at: { type: Date, default: Date.now }
})
// Ensure the unique index is created
BookSchema.index({ isbn: 1}, { unique: true });

module.exports = model("Book", BookSchema);