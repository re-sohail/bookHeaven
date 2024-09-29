const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
require("./connection/connection");
const user = require("./Routes/user");
const book = require("./Routes/book");
const favourit = require("./Routes/favourite");
const cart = require("./Routes/cart");
const order = require("./Routes/order");

// cors function use to communication between frontend and backend
app.use(cors());

app.use(express.json());
// Routes
app.use("/api/v1", user);
app.use("/api/v1", book);
app.use("/api/v1", favourit);
app.use("/api/v1", cart);
app.use("/api/v1", order);

app.listen(process.env.PORT, (req, res) => {
  console.log(`Server is running ${process.env.PORT}`);
});
