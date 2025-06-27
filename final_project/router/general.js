const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
        users.push({username: username, password: password});
        return res.status(200).json({message: "User successfully registered"});
    } else {
        return res.status(404).json({message: "User already exists"})
    }
  }
  return res.status(404).json({message: "Unable to register user"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  author = author.replace(/_/g, " "); // Replace underscores with space
  let matchingBooks = {};
  // Loop through books to account for authors with multiple books
  Object.entries(books).map(entry => {
    let isbn = entry[0];
    let info = entry[1];
    if (info.author === author) {
        matchingBooks[isbn] = {
            author: author,
            title: info.title,
            reviews: info.reviews
        }
    }
  });
  if (JSON.stringify(matchingBooks) !== '{}') {
    res.send(matchingBooks);
  } else {
    res.send("Unable to find author");
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title;
  title = title.replace(/_/g, " "); // Replace underscores with space
  let matchingBooks = {};
  // Loop through books to account for chance of multiple books with the same title
  Object.entries(books).map(entry => {
    let isbn = entry[0];
    let info = entry[1];
    if (info.title === title) {
        matchingBooks[isbn] = {
            author: info.author,
            title: info.title,
            reviews: info.reviews
        }
    }
  });
  if (JSON.stringify(matchingBooks) !== '{}') {
    res.send(matchingBooks);
  } else {
    res.send("Unable to find author");
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const reviews = books[req.params.isbn].reviews;
  if (JSON.stringify(reviews) !== '{}') {
    res.send(reviews);
  } else {
    res.send("There are no reviews for this book yet");
  }
});

module.exports.general = public_users;
