const express = require('express');
const public_users = express.Router();

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (users.some(user => user.username === username)) {
    return res.status(400).json({message: "Username already exists"});
  }
  users.push({username: username, password: password}); // Add the new user to the users array
  return res.status(201).json({message: "User registered successfully"});
});

// Function to simulate fetching books asynchronously
const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    // Simulate async operation (e.g., fetching from a database or another API)
    setTimeout(() => {
      if (books) {
        resolve(books);
      } else {
        reject("Could not fetch books");
      }
    }, 100); // Simulate a small delay
  });
};

// Function to simulate fetching a book by ISBN asynchronously
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    }, 100); // Simulate delay
  });
};

// Function to simulate fetching books by author asynchronously
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const booksArray = Object.values(books);
      const booksByAuthor = booksArray.filter(book => book.author === author);
      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        reject("No books found by this author");
      }
    }, 100); // Simulate delay
  });
};

// Function to simulate fetching books by title asynchronously
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const booksArray = Object.values(books);
      const booksByTitle = booksArray.filter(book => book.title === title);
      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject("No books found with this title");
      }
    }, 100); // Simulate delay
  });
};

// Get the book list available in the shop using async-await
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await getAllBooks();
    res.send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    res.status(500).json({ message: "Error fetching book list", error: error });
  }
});

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await getBookByISBN(isbn);
    return res.send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error }); // Use the error message from the promise rejection
  }
});

// Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const booksByAuthor = await getBooksByAuthor(author);
    return res.send(JSON.stringify(booksByAuthor, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error }); // Use the error message from the promise rejection
  }
});

// Get all books based on title using async-await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const booksByTitle = await getBooksByTitle(title);
    return res.send(JSON.stringify(booksByTitle, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error }); // Use the error message from the promise rejection
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
 
  const isbn = req.params.isbn;
  const book = books[isbn]; // Access book directly by ISBN
  
  if (book && book.reviews) { // Check if book and reviews exist
    return res.send(JSON.stringify(book.reviews, null, 4));
  } else if (book) { // Book exists but might not have reviews
    return res.send(JSON.stringify({}, null, 4)); // Return empty reviews object
  } else { // Book not found
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
