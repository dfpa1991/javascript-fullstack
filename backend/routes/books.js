// Importing the express router
const { Router } = require("express");

// Initializing the router
const router = Router();

// Importing the Book model and saving it in a variable
const Book = require("../models/Books");

// Requiring the mongoose module
const mongoose = require("mongoose");
// Validate the data using mongoose using a function
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

/*
 * Books API Routes
 * This file contains all the route handlers for book-related operations
 * including GET (retrieve), POST (create), and DELETE (remove) operations
 * Try and catch blocks are used to handle errors
 * Async functions are used to handle asynchronous operations
 * res.json() is used to send a response to the client
 * res.status() is used to set the status code of the response
 * req.body is used to get the body of the request
 * req.params is used to get the parameters of the request
 * req.query is used to get the query parameters of the request
 */

router.get("/", async (req, res) => {
    try {
        const books = await Book.find(); // Find all the books in the database - Async function
        res.json({ 
            sucess: true,
            count: books.length,
            books 
        });
    } catch (error) {
        console.log(`Error getting books: ${error}`);
        res.status(500).json({
            messsage: "Error retrieving books",
            success: false,
            error: error.message
        })
    }
});

router.post("/", async (req, res) => {
    try {
        const { title, author, isbn } = req.body;
        // Validate the data and if the data is not valid, return a 400 status code
        if (!title || !author || !isbn) {
            return res.status(400).json({
                message: "Title, author, and ISBN are required",
                success: false,
                data: null
            });
        }
        // Create a new book after the data is validated
        const newBook = new Book({ title, author, isbn });
        const savedBook = await newBook.save(); // Save the book in the database - Async function. The save method returns a promise.
        res.status(201).json({
            message: "Book created successfully",
            success: true,
            data: savedBook
        });
    } catch (error) {
        console.log(`Error creating book: ${error}`)
        // Handling duplicate key errors
        if (error.code === 11000) {
            /* 
             * Get the duplicate ISBN -> Optional chaining operator ?
             * Powerful JavaScript feature that lets you safely access nested object properties 
             * without worrying about null or undefined values causing errors.
             * const duplicateISBN = error.keyValue?.isbn;
             */
            const duplicateISBN = error.keyValue && error.keyValue.isbn ? error.keyValue.isbn : undefined;
            return res.status(400).json({
                message: `Book already exists with this ISBN ${duplicateISBN}`,
                error: error.keyValue,
                success: false,
                data: null,
                duplicateISBN: duplicateISBN
            });
        }
        // If the error is not a duplicate key error, return a 500 status code
        res.status(500).json ({
            message: "Error creating book",
            success: false,
            error: error.message
        });
    }
});

// Bulk operations -> Create multiple books at once
router.post("/bulk", async(req, res) => {
    // Declare books variable outside the try block so it's accessible in the catch block
    let books;
    let booksLength = 0;
    // Log the request body
    try {
        /* 
         * Destructure inside the try block so it's accessible in the catch block
         * The parentheses are a syntax requirement to disambiguate destructuring 
         * from block statements when assigning to existing variables!
         */
        ({ books } = req.body);
        // Ternary operator format: condition ? valueIfTrue : valueIfFalse
        booksLength = books ? books.length : 0;
        // Validate that books is an array 
        if (!books || !Array.isArray(books)) {
            return res.status(400).json({
                message: "Books must be an array",
                success: false,
                data: null
            });
        }
        // Validate that the books array is not empty
        if (books.length === 0) {
            return res.status(400).json({
                message: "Books array is empty",
                success: false,
                data: null
            });
        }
        // Validate that each book has a title, author, and isbn
        for (const book of books) {
            if (!book.title || !book.author || !book.isbn) {
                return res.status(400).json({
                    message: "Each book must have title, author, and isbn",
                    success: false,
                    data: null
                });
            }
        }
        // Insert all the books into the database
        const savedBooks = await Book.insertMany(books, { ordered: false }); // The ordered: false option allows the bulk insert to continue even if some documents fail to insert.
        // Log the saved books to the console
        console.log(savedBooks);
        // Return the response to the client as 201 status code
        res.status(201).json({
            message: "The books have been created successfully",
            sucess: true,
            data: savedBooks
        });
    } catch (error) {
        console.log(`Error creating books: ${error}`);
        const allErrorsMessages = error.writeErrors.map(writeError => writeError.err.errmsg);
        if (error.code === 11000){
            let duplicateISBNs = [];
            // Try to extract from bulk operation errors
            if (error.writeErrors && error.writeErrors.length > 0){
                console.log("Write errors found: ", error.writeErrors.length);
                // Extract ISBNs from the nested error structure
                duplicateISBNs = error.writeErrors
                    .filter(writeError => writeError.err?.code === 11000) // Only duplicate key errors are considered
                    .map(writeError => {
                        // Access the nested error object
                        const isbn = writeError.err?.op?.isbn;
                        console.log("Found duplicate ISBN: ", isbn);
                        console.log("Error message: ", writeError.err?.errmsg);
                        return isbn;
                    })
                    .filter(isbn => isbn !== undefined);
            } else if (error.keyValue?.isbn) {
                duplicateISBNs = [error.keyValue.isbn];
            }

            // Check if some books were successfully inserted
            const insertedCount = error.result?.insertedCount || 0;

            const message = duplicateISBNs.length > 0 
                ? `Books with ISBNs ${duplicateISBNs.map(isbn => `${isbn}`).join(", ")} already exist`
                : `A book already exists with this ISBN ${duplicateISBNs[0] || 'unknown'} already exists`;

            return res.status(400).json({
                message: message,
                success: false,
                data: null,
                duplicateISBNs: duplicateISBNs,
                sucessfulInserts: insertedCount,
                totalBooks: booksLength
            });
        }
        // If the error is not a duplicate key error, return status 500
        res.status(500).json({
            message: "Error creating books",
            sucess: false,
            data: error.message,
            allErrorsMessages: allErrorsMessages,
            error: error.writeErrors
        });

    }
});


// Async functions require try/catch blocks to handle errors
router.delete("/:id", async (req, res) => {
    try {
        console.log(`ID received: ${req.params.id}`);
        // Validate the ID
        console.log(isValidObjectId(req.params.id));
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid book ID: Input must be a 24 character hex string",
                success: false,
                data: `ID: ${req.params.id} is not a valid ID`
            });
        }
        // Check if the book exists first
        const bookExists = await Book.findById(req.params.id);
        if (!bookExists) {
            return res.status(404).json({
                message: "Book not found",
                success: false,
                data: `Book ID: ${req.params.id} does not exist`
            });
        }
        // Delete the book
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        console.log(`Book deleted: ${deletedBook}`);
        // Display the book that was deleted
        res.json({message: "Book has been deleted successfully", deletedBook});

    } catch (error) {
        if (req.params.id.length !== 24) {
            return res.status(400).json({
                message: "Invalid book ID: Input must be a 24 character hex string",
                success: false
            });
        }
        console.log(error);
        res.status(500).json({message: "Error deleting book"});
    }
});

// Exporting the router
module.exports = router;