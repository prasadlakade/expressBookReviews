const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // Add this at the top with other requires

public_users.get('/books-data', (req, res) => {
  res.status(200).json(books);
});


public_users.post("/register", (req, res) => {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the user already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add the new user
  users.push({ username, password });

  return res.status(200).json({ message: "User successfully registered" });

});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  try {
    const response = await axios.get('http://localhost:5001/books-data');
    res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/books-data/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`http://localhost:5001/books-data/${isbn}`);
    res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    res.status(404).json({ message: "Book not found", error: error.message });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const requestedAuthor = req.params.author.toLowerCase();

  try {
    const response = await axios.get('http://localhost:5001/books-data');
    const allBooks = response.data;

    const matchingBooks = [];

    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].author.toLowerCase() === requestedAuthor) {
        matchingBooks.push({ isbn, ...allBooks[isbn] });
      }
    });

    if (matchingBooks.length > 0) {
      res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
      res.status(404).json({ message: "No books found for the given author" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const requestedTitle = req.params.title.toLowerCase();

  try {
    const response = await axios.get('http://localhost:5001/books-data');
    const allBooks = response.data;

    const matchingBooks = [];

    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].title.toLowerCase() === requestedTitle) {
        matchingBooks.push({ isbn, ...allBooks[isbn] });
      }
    });

    if (matchingBooks.length > 0) {
      res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
      res.status(404).json({ message: "No books found with the given title" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }

});

module.exports.general = public_users;
