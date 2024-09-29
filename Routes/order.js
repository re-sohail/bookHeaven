const router = require("express").Router();
const userModel = require("../models/user");
const orderModel = require("../models/order");
const { authenticateToken } = require("./userAuth");

// place order
router.post("/place-order", authenticateToken, async (req, res) => {
  try {
    let { id } = req.headers;
    let { order } = req.body;

    for (const OrderData of order) {
      const newOrder = new orderModel({
        user: id,
        book: OrderData._id,
      });

      const Data = await newOrder.save();

      // Add order to user's order list
      await userModel.findByIdAndUpdate(id, { $push: { order: Data._id } });

      // Remove book from user's cart
      await userModel.findByIdAndUpdate(id, { $pull: { cart: OrderData._id } });
    }

    return res
      .status(200)
      .json({ status: "success", message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// order history
router.get("/order-history", authenticateToken, async (req, res) => {
  try {
    let { id } = req.headers;

    let userData = await userModel.findById(id).populate({
      path: "order",
      populate: {
        path: "book",
      },
    });

    if (!userData || !userData.order) {
      return res.status(200).json({ status: "success", data: [] });
    }

    let orderData = userData.order.reverse();
    return res.status(200).json({ status: "success", data: orderData });
  } catch (error) {
    console.error("Error fetching order history: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// all order
router.get("/all-order", authenticateToken, async (req, res) => {
  try {
    let allOrder = await orderModel
      .find()
      .populate({ path: "book" })
      .populate({ path: "user" })
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: "success", data: allOrder });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/update-status/:_id", authenticateToken, async (req, res) => {
  try {
    const adminId = req.headers.id; // User ID from headers (admin verification)
    const { _id } = req.params; // Order ID from URL params
    const { status } = req.body; // Status to be updated

    // Verify if the user is an admin
    const adminVerify = await userModel.findById(adminId);
    if (!adminVerify || adminVerify.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to update the order status.",
      });
    }

    // Update the order status
    const updateStatus = await orderModel.findByIdAndUpdate(
      _id,
      { status: status }, // Updating the status field
      { new: true } // Return the updated order document
    );

    if (!updateStatus) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.status(200).json({
      status: "success",
      message: "Status updated successfully",
      data: updateStatus, // Return updated order data
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
