const router = require("express").Router();
const userModel = require("../models/user");
const bookModel = require("../models/book");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");
const { route } = require("./user");

// Add Book - Admin role
router.post("/add-book", authenticateToken, async (req, res) => {
  try {
    let { id } = req.headers;
    let { url, title, author, description, price, language } = req.body;

    const adminVerify = await userModel.findById(id);
    if (!adminVerify) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (adminVerify.role !== "admin") {
      return res.status(403).json({
        message: "You cannot post book, only Admin can post the book",
      });
    }

    const book = new bookModel({
      url,
      title,
      author,
      description,
      price,
      language,
    });

    await book.save();
    res.status(200).json({ message: "Book Added Successfully" });
  } catch (error) {
    console.error("Error adding book:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// update Book
router.put("/update-book", authenticateToken, async (req, res) => {
  try {
    let { book_id } = req.headers;
    let { url, title, author, description, price, language } = req.body;

    await bookModel.findByIdAndUpdate(
      book_id,
      {
        url: url,
        title: title,
        author: author,
        description: description,
        price: price,
        language: language,
      },
      { new: true }
    );
    res.status(200).json({ message: "Book Updated successfuly" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete Book
router.delete("/delete-book", authenticateToken, async (req, res) => {
  try {
    let { book_id } = req.headers;
    await bookModel.findByIdAndDelete(book_id);
    res.status(200).json({ message: "Book Deleted Successfuly" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Read / add Books
router.get("/all-book", async (req, res) => {
  try {
    const book = await bookModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: "successfull", data: book });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Recently Add book limit 4
router.get("/recent-book", async (req, res) => {
  try {
    const book = await bookModel.find().sort({ createdAt: -1 }).limit();
    return res.status(200).json({ status: "successfull", data: book });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// book details
router.get("/details/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const book = await bookModel.findById(id);
    return res.status(200).json({ status: "successfuly", data: book });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
