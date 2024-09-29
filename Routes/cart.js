const router = require("express").Router();
const userModel = require("../models/user");
const { authenticateToken } = require("./userAuth");

// add to cart
router.put("/add-cart", authenticateToken, async (req, res) => {
  try {
    let { book_id, id } = req.headers;
    const userData = await userModel.findById(id);
    const isBook = userData.cart.includes(book_id);
    if (isBook) {
      return res.status(200).json({ message: "Book is already in cart" });
    }
    await userModel.findByIdAndUpdate(id, { $push: { cart: book_id } });
    res.status(200).json({ message: "Book successfuly added in Cart" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// remove from cart
router.put("/remove-cart/:book_id", authenticateToken, async (req, res) => {
  try {
    let { book_id } = req.params;
    let { id } = req.headers;
    await userModel.findOneAndUpdate(
      { _id: id },
      {
        $pull: { cart: book_id },
      }
    );
    res.status(200).json({ message: "Book removed from Cart" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Show all book of cart
router.get("/all-cart", authenticateToken, async (req, res) => {
  try {
    let { id } = req.headers;
    const userData = await userModel.findById(id).populate("cart");
    const isBook = userData.cart.reverse();
    return res.status(200).json({ status: "successful", data: isBook });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
