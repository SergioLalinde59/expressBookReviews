const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 

  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ 

  let user = users.find((user) => user.username === username);
  if (user && user.password === password) {
    return true;
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  //Check if the user is already registered
  if (!isValid(username)) {
    return res.status(400).json({message: "User not registered"});
  }

  //Check if the username and password match
  if (!authenticatedUser(username,password)) {
    return res.status(400).json({message: "Invalid login. Check username and password"});
  }
  //Create an access token
  const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });
  // Store the access token in the session
  req.session.authorization = { accessToken, username };
  // Send the access token back to the user
  return res.status(200).json({ accessToken }); 
});

// Add or modify a book review
regd_users.put("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  // Try to get review from body first, then from query parameters
  const reviewText = req.body.review || req.query.review; 
  const username = req.session.authorization?.username; 

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!reviewText) {
    return res.status(400).json({ message: "Review text is required in request body or query parameters" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Ensure the reviews object exists
  if (!book.reviews) {
    book.reviews = {};
  }

  // Add or update the review for the logged-in user
  book.reviews[username] = reviewText;

  return res.status(200).json({ message: `Review for ISBN ${isbn} by user ${username} added/updated successfully`, reviews: book.reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the book has reviews and if the user has a review for this book
  if (book.reviews && book.reviews[username]) {
    // Delete the user's review
    delete book.reviews[username];
    return res.status(200).json({ message: `Review for ISBN ${isbn} by user ${username} deleted successfully`, reviews: book.reviews });
  } else {
    // User doesn't have a review for this book or the book has no reviews
    return res.status(404).json({ message: "Review not found for this user and ISBN" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
