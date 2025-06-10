const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
  //Write the authenication mechanism here
  // Check if session contains authorization info
  if (!req.session || !req.session.authorization) {
    return res.status(401).json({ message: "Unauthorized: No session" });
  }

  const token = req.session.authorization.token;

  jwt.verify(token, "access", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // Attach user info to the request object for use in protected routes
    req.user = user;
    next();
  });
});

const PORT = 5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

//app.listen(PORT,()=>console.log("Server is running"));
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});