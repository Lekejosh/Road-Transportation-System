const express = require("express");
const app = express();
const errorMiddleware = require("./middlewares/error");
const bodyParser = require("body-parser");
const checkTrips = require("./middlewares/serviceWorker");
const cors = require("cors");
const { Cookies } = require("universal-cookie-express");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

setInterval(checkTrips, 60 * 1000);

const cookies = new Cookies();
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
app.use(cookies.express());
app.use(session(sessionConfig));

const user = require("./routes/userRoute");
const driver = require("./routes/driverRoute");
const transport = require("./routes/transportRoute");
const order = require("./routes/orderRoute");
const admin = require("./routes/adminRoute");

// Routes
app.get("/", (req, res) => {
  res
    .status(200)
    .json({
      success: true,
      message: "Welcome to Road Transport Resrvation API",
    });
});
app.use("/api/v1/user", user);
app.use("/api/v1/driver", driver);
app.use("/api/v1/transport", transport);
app.use("/api/v1/order", order);
app.use("/api/v1/admin", admin);

app.use(errorMiddleware);

module.exports = app;
