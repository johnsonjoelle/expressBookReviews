const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if a user with the username exists
const isValid = (username)=>{ //returns boolean
  let matchingUsers = users.filter(user => {
    return user.username === username;
  });
  if (matchingUsers.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validUsers = users.filter(user => {
    return (user.username === username && user.password === password);
  });
  if (validUsers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if username and password were entered
  if ( !username || !password ) {
    return res.status(404).json({message: "Username and password required"})
  }
  // Authenticate user
  if( authenticatedUser(username, password) ) {
    let accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {accessToken, username};
    return res.status(200).json({message: "User successfully logged in"});
  } else {
    return res.status(208).json({message: "Invalid login: Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Check if user has left a review on the book
  const userAuth = req.user; // from auth function in index.js
  const isbn = req.params.isbn;
  const review = req.query.review;
  const user = req.session.authorization.username;
  let reviews = books[isbn];
  let userReview = reviews.user;
  if (!userAuth) {
    return res.status(404).json({message: "User must be logged in"});
  }
  if (user && isbn && review) {
    books[isbn]["reviews"][user] = review;
    res.send(books[isbn]);
  } else {
    return res.status(404).json({message: "Error uploading review"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const user = req.session.authorization.username;
//   let userReviews = books[isbn]["reviews"];
  let userReview = books[isbn]["reviews"][user];
  if (userReview) {
    delete books[isbn]["reviews"][user];
    res.send("User review deleted");
  } else {
    res.status(404).json({message: "No review located"});
  }
//   let userReview = userReviews.filter(review => {
    
//   })
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
