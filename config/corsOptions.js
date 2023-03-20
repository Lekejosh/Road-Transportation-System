const allowedOrigin = require("./allowedOrigin");

const corsOptions = {
  origin: (origin, callback) => {
    console.log(allowedOrigin);
    if (allowedOrigin.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed Cors"));
    }
  },
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
