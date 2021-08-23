const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const dbErrorHelper = require("../lib/dbErrorHelper");

async function createUser(req, res) {
  try {
    let createdUser = new User({
      email: req.body.email,
      password: req.body.password,
      username: req.body.username,
    });
    let genSalt = await bcrypt.genSalt(12);
    let hashedPassword = await bcrypt.hash(createdUser.password, genSalt);

    createdUser.password = hashedPassword;
    await createdUser.save();

    res.json({
      message: "User Created!!",
    });
  } catch (e) {
    res.status(500).json({
      message: dbErrorHelper(e),
    });
  }
}

async function login(req, res) {
  try {
    let foundUser = await User.findOne({ email: req.body.email });

    if (!foundUser) {
      throw Error("User Name not found, Please Register.");
    }
    let comparedPassword = await bcrypt.compare(
      req.body.password,
      foundUser.password
    );
    if (!comparedPassword) {
      throw Error("Invaild Password!!");
    }

    let jwtToken = jwt.sign(
      {
        username: foundUser.username,
        email: foundUser.email,
      },
      process.env.JWT_USER_SECRET_KEY
    );

    res.cookie("jwt-cookie", jwtToken, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: false,
      secure: false,
    });

    res.json({
      user: {
        email: foundUser.email,
        username: foundUser.username,
      },
    });
  } catch (e) {
        res.status(500).json({
            message: dbErrorHelper(e),
    });
    }
}

module.exports = { createUser, login };
