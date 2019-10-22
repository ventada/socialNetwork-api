const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");

const app = express();

// connect database
connectDB();

// init middleware
app.use(express.json({ exstended: false }));
app.use(express.urlencoded({ exstended: false }));

app.get("/", (req, res) => {
  res.send("api running");
});

// Define Routes
app.use("/api/users", require("./routes/api/user"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/post"));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
