const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();

process.on("uncaughtException", (err) => {
  console.log(`Error: $err: ${err.message}`);
  console.log(`Shutting down the server due to uncaught Expectation`);
  process.exit(1);
});

mongoose
  .connect(process.env.DB_URI)
  .then(() =>
    app.listen(process.env.PORT, () => {
      console.log(`Server is working on http://localhost:${process.env.PORT}`);
    })
  )
  .catch((err) => {
    console.log(err);
  });

process.on("unhandledRejection", (err) => {
  console.log(`Error: $err: ${err.message}`);
  console.log(`Shutting down the server due to unhandled promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
