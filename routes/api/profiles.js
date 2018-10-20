const express = require('express');
const router = express.Router();

// @route  GET api/profiles/test
// @desc   Tests profiles route
// @access Public
router.get("/test", async (req, res, next) => {
  res.json({
    message: "Welcome to profiles api page"
  });
});

module.exports = router;