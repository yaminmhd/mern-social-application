const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const encryptPassword = require("../../utils/helper").encryptPassword;
const retrieveGravatar = require("../../utils/helper").retrieveGravatar;

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

module.exports = router;
