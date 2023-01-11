const express = require("express");
const app = express();
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const sessionConfig = {
  secret: "egeGBTCTEcgwrtgc54cg66666666h.b/3/3.b/[g[er2",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 + 60 * 60 * 24 * 7,
    maxAge: 1000 + 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

const user = require("./routes/userRoute");

// Routes
app.use("/api/v1/user", user);

app.use(errorMiddleware);

module.exports = app;
