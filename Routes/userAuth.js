const jwt = require("jsonwebtoken");
const user = require("../models/user");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token === null) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, process.env.secretKey, (err, data) => {
    if (err) {
      return res.status(403).json("Token Expired");
    }
  });

  req.user = user;
  next();
};

module.exports = { authenticateToken };
