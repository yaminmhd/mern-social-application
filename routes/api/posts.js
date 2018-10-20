const express = require("express");
const router = express.Router();

// @route  GET api/posts/test
// @desc   Tests post route
// @access Public
router.get("/tesst", async (req, res, next) => {
  res.json({
    message: "Welcome to posts api page"
  });
});
module.exports = router;
