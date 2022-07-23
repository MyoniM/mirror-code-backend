require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
var morgan = require("morgan");
var fs = require("fs");
var path = require("path");

const app = express();

// ? create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});

// // ? create a api rate limiter for email verification
// const emailAPIRateLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5,
// });

app.use(cors());
app.use(express.json());
app.use(morgan("combined", { stream: accessLogStream }));

// routes
app.use("/api/v1", require("./routes/code.route"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
