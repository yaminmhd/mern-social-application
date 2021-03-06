const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const encryptPassword = require("../../utils/helper").encryptPassword;
const comparePassword = require("../../utils/helper").comparePassword;
const retrieveGravatar = require("../../utils/helper").retrieveGravatar;
const jwt = require("jsonwebtoken");
const secret = require("../../config/keys").secret;
const passport = require("passport");

//load input validation for register and login page
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// @route  GET api/users/test
// @desc   Tests users route
// @access Public
router.get("/test", async (req, res, next) => {
  res.json({
    message: "Welcome to users api page"
  });
});

// @route  GET api/users/register
// @desc   Register user
// @access Public
router.post("/register", async (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      res.status(400).json({ email: "Email already exists" });
    } else {
      const encryptedPassword = await encryptPassword(req.body.password);
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: retrieveGravatar(req.body.email),
        password: encryptedPassword
      });
      await newUser.save();
      res.status(201).json(newUser);
    }
  } catch (error) {
    next(error);
  }
});

// @route  GET api/users/login
// @desc   Login user /returning JWT token
// @access Public

router.post("/login", async (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //find user by email
  try {
    const user = await User.findOne({ email });
    if (!user) {
      errors.email = "User not found";
      res.status(404).json(errors);
    }

    if (user) {
      const isMatch = await comparePassword(password, user.password);
      if (isMatch) {
        //user matched & create jwt payload
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };
        //sign the token
        const token = await jwt.sign(payload, secret, { expiresIn: 3600 });
        if (token) {
          res.json({
            success: true,
            token: `Bearer ${token}`
          });
        } else {
          res.json({
            message: "Error"
          });
        }
      } else {
        errors.password = "Password incorrect";
        res.status(400).json(errors);
      }
    }
  } catch (error) {
    next(error);
  }
});

// @route  GET api/users/current
// @desc   Return current user
// @access Private

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
