const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  return users.some(user => user.username === username);

};

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.

  return users.some(user => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if credentials are valid
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }

  // Create JWT token
  const token = jwt.sign({ username: username }, "access", { expiresIn: '1h' });

  // Save token in session
  req.session.authorization = {
    token,
    username
  };

  return res.status(200).json({ message: "User successfully logged in", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session?.authorization?.username;

  // Validate session and input
  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required in query parameter" });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update the review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session?.authorization?.username;

  // Ensure user is logged in
  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user's review exists
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review by this user to delete" });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
