const router = require("express").Router();
const userModel = require("../models/user");
const { authenticateToken } = require("./userAuth");

// Add book to favourite
router.put("/add-favourit", authenticateToken, async (req, res) => {
  try {
    let { book_id, id } = req.headers;
    const userData = await userModel.findById(id);
    const isBook = userData.favourit.includes(book_id);
    if (isBook) {
      return res.status(400).json({ message: "book is already in favourite" });
    }

    await userModel.findByIdAndUpdate(id, { $push: { favourit: book_id } });
    return res.status(200).json({ message: "book added to favourite" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Remove book from favourite
router.put("/remove-favourit", authenticateToken, async (req, res) => {
  try {
    let { book_id, id } = req.headers;
    const userData = await userModel.findById(id);
    const isBook = userData.favourit.includes(book_id);
    if (isBook) {
      await userModel.findByIdAndUpdate(id, { $pull: { favourit: book_id } });
    }
    return res.status(200).json({ message: "book removed from favourite" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get all favourit book
router.get("/all-favourite", authenticateToken, async (req, res) => {
  try {
    let { id } = req.headers;
    const userData = await userModel.findById(id).populate("favourit");
    const isBook = userData.favourit;
    return res.status(200).json({
      status: "successfull",
      data: isBook,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
module.exports = router;
