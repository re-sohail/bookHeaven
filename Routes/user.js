const router = require("express").Router();
const userModel = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { authenticateToken } = require("./userAuth");

// Sign up
router.post("/sign-up", async (req, res) => {
  try {
    let { name, username, email, password, address } = req.body;
    let errors = [];

    // Username length Checking
    if (username.length <= 4) {
      errors.push("username should be greater then 4");
    }
    // Password Length Checking
    if (password.length <= 6) {
      errors.push("Password Should be Greater the 6 Characters");
    }

    if (errors.length === 0) {
      // Username checking in DB
      const existingUser = await userModel.findOne({ username: username });
      if (existingUser) {
        errors.push("username is already exist");
      }

      // Email Checkin in DB
      const existingEmail = await userModel.findOne({ email: email });
      if (existingEmail) {
        errors.push("Email is Already exist");
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors });
    }

    // password hashing
    const saltRound = 10;
    const hasdedPassword = await bcrypt.hash(password, saltRound);

    const newUser = new userModel({
      name: name,
      username: username,
      email: email,
      password: hasdedPassword,
      address: address,
    });
    await newUser.save();

    return res.status(200).json({ message: "signup successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Sign in
router.post("/sign-in", async (req, res) => {
  try {
    let { email, password } = req.body;

    const existingEmail = await userModel.findOne({ email: email });
    if (!existingEmail) {
      return res.status(400).json({ message: "invalid credentials " });
    }

    await bcrypt.compare(password, existingEmail.password, (err, data) => {
      if (data) {
        const authclaim = [
          {
            username: existingEmail.username,
            role: existingEmail.role,
          },
        ];
        const token = jwt.sign({ authclaim }, process.env.secretKey, {
          expiresIn: "30d",
        });

        res.status(200).json({
          id: existingEmail._id,
          role: existingEmail.role,
          token: token,
        });
      } else {
        res.status(400).json({ message: "Invalid credentials" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// user information
router.get("/get-user-information", authenticateToken, async (req, res) => {
  try {
    let { id } = req.headers;
    let userData = await userModel.findById(id).select("-password");
    return res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// address Update
router.put("/update-address", authenticateToken, async (req, res) => {
  try {
    let { id } = req.headers;
    let { address } = req.body;
    await userModel.findByIdAndUpdate(id, { address: address });
    res.status(200).json({ message: "Address Updated Successfuly" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
