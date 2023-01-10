const express = require("express");
const app = express();
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");
// const session = require("express-session");
const bodyParser = require("body-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const user = require("./routes/userRoute");

// Routes
app.use("/api/v1/user", user);

app.use(errorMiddleware)

module.exports = app;
