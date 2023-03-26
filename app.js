const express = require("express");
const app = express();
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const checkTrips = require("./middlewares/serviceWorker");
const cors = require("cors");
const credentials = require("./middlewares/credentials");
const corsOptions = require("./config/corsOptions");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(
//   cors({
//     origin: "http://localhost:4000",
//     credentials: true,
//   })
// );
app.use(cors({ credentials: true, origin: true }));
// app.use(cors(corsOptions));
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:4000"); // set the origin of the request
//   res.header("Access-Control-Allow-Credentials", true); // allow cookies, authorization headers, and SSL client certificates to be sent
//   res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE"); // specify the allowed HTTP methods
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // specify the allowed headers

//   if (req.method === "OPTIONS") {
//     res.sendStatus(200); // handle the preflight request
//   } else {
//     next(); // move on to the next middleware
//   }
// });

// app.use(credentials);

setInterval(checkTrips, 60 * 1000);

const sessionConfig = {
  secret: "egeGBTCTEcgwrtgc54cg66666666h.b/3/3.b/[g[er2",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: false,
    expires: Date.now() + 1000 + 60 * 60 * 24 * 7,
    maxAge: 1000 + 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

const user = require("./routes/userRoute");
const driver = require("./routes/driverRoute");
const transport = require("./routes/transportRoute");
const order = require("./routes/orderRoute");
const admin = require("./routes/adminRoute");
const state = require("./routes/stateRoute");

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Road Transport Resrvation API",
  });
});
app.use("/api/v1/user", user);
app.use("/api/v1/driver", driver);
app.use("/api/v1/transport", transport);
app.use("/api/v1/order", order);
app.use("/api/v1/admin", admin);
app.use("/api/v1/state", state);

app.use(errorMiddleware);

module.exports = app;
