const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [ {
    username: "newuser",
    password: "password123"
  }];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
// Login route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the user exists and the password is correct
  const user = users.find(user => user.username === username && user.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, 'Testing123', { expiresIn: '1h' });

  // Save the token in the session
  req.session.token = token;

  return res.status(200).json({ message: "Login successful", token });
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const token = req.session.token;

  if (!token) {
    return res.status(401).json({ message: "Please log in to add or modify reviews" });
  }

  // Log that we're starting to verify the token
  console.log("Verifying token...");

  jwt.verify(token, 'Testing123', (err, decoded) => {
    if (err) {
      console.log("Token verification failed:", err);
      return res.status(403).json({ message: "Invalid token" });
    }

    console.log("Token successfully verified for user:", decoded.username);

    const username = decoded.username;
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Add or modify the user's review
    book.reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const token = req.session.token;

  if (!token) {
    return res.status(401).json({ message: "Please log in to delete a review" });
  }

  // Verify the token
  jwt.verify(token, 'Testing123', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const username = decoded.username;
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has a review for this book
    if (book.reviews[username]) {
      // Delete the user's review
      delete book.reviews[username];
      return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
    } else {
      return res.status(404).json({ message: "You have not reviewed this book" });
    }
  });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
