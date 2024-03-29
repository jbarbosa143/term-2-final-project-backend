require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cors = require("cors");
var passport = require("passport");

var userPassportStrategy = require("./routes/utils/passport/userPassport");

mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MONGO DB CONNECTED"))
  .catch((e) => console.log(e));

var usersRouter = require("./routes/users/usersRouter");

var app = express();

app.use(passport.initialize());

passport.use("jwt-user", userPassportStrategy);

// let orignalUrl =
//   process.env.NODE_ENV === "development"
//     ? "http://localhost:3000"
//     : "DEPLOY URL";

// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json("error");
});

module.exports = app;
