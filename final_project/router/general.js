const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    const userExists = users.some((user) => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // If the username does not exist, register the new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Return the list of books (or any data you want)
    return res.status(200).json(books);
});

module.exports.general = public_users;
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;
    
    // Check if the book with the provided ISBN exists
    const book = books[isbn];
    
    if (book) {
        // If the book exists, return the book details
        return res.status(200).json(book);
    } else {
        // If the book is not found, return a 404 error message
        return res.status(404).json({ message: "Book not found" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let booksByAuthor = [];

    // Iterate through all the books and find matches for the provided author
    Object.keys(books).forEach((isbn) => {
        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
            booksByAuthor.push(books[isbn]);
        }
    });

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else {
        return res.status(404).json({ message: "No books found for the author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let booksByTitle = [];

    // Iterate through all the books and find matches for the provided title
    Object.keys(books).forEach((isbn) => {
        if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
            booksByTitle.push(books[isbn]);
        }
    });

    if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle);
    } else {
        return res.status(404).json({ message: "No books found with the given title" });
    }
});
//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});
module.exports.general = public_users;



public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
      const response = await axios.get(`https://yousef9amr-5001.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai//title/${title}`); // Adjust URL if needed
      res.status(200).json(response.data);
    } catch (error) {
      res.status(404).json({ message: "Book not found with the given title", error: error.message });
    }
  });