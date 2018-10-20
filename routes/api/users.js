const express = require("express");
const router = express.Router();

// @route  GET api/users/test
// @desc   Tests users route
// @access Public
router.get("/test", async (req, res, next) => {
  res.json({
    message: "Welcome to users api page"
  });
});

module.exports = router;
