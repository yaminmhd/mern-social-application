const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Post = require("../../models/Post");
const validatePostInput = require("../../validation/post");
const Profile = require("../../models/Profile");

// @route  GET api/posts/test
// @desc   Tests post route
// @access Public
router.get("/test", async (req, res, next) => {
  res.json({
    message: "Welcome to posts api page"
  });
});

// @route  GET api/posts
// @desc   get post
// @access Public
router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    res.status(404).json({ nopostfound: "No post found" });
  }
});

// @route  GET api/posts/:id
// @desc   get post by id
// @access Public
router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    res.json(post);
  } catch (error) {
    res.status(404).json({ nopostfound: "No post found with that id" });
  }
});

// @route  POST api/posts/
// @desc   Create post
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const { errors, isValid } = validatePostInput(req.body);

    //check validation
    if (!isValid) {
      //if any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    try {
      const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      });

      await newPost.save();
      res.json({
        message: "New post created",
        newPost
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route  DELETE api/posts/:id
// @desc   delete post by id
// @access private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      // const profile = await Profile.findOne({user: req.user.id});
      const post = await Post.findById(req.params.id);
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ notauthorized: "User not authorized" });
      }
      await post.remove();
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({
        message: error,
        nopostfound: "No post found"
      });
    }
  }
);

// @route  POST api/posts/like/:id
// @desc   like post
// @access private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      // const profile = await Profile.findOne({user: req.user.id});
      const post = await Post.findById(req.params.id);
      const currentLikeStatusOfUser = post.likes.filter(
        like => like.user.toString() === req.user.id
      );
      if (currentLikeStatusOfUser.length > 0) {
        return res.status(400).json({
          alreadyliked: "User already likes this post"
        });
      }

      //add user id to likes array
      post.likes.unshift({
        user: req.user.id
      });

      await post.save();

      res.json(post);
    } catch (error) {
      res.status(404).json({
        message: error,
        nopostfound: "No post found"
      });
    }
  }
);

// @route  POST api/posts/unlike/:id
// @desc   unlike post
// @access private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      // const profile = await Profile.findOne({user: req.user.id});
      const post = await Post.findById(req.params.id);
      const currentLikeStatusOfUser = post.likes.filter(
        like => like.user.toString() === req.user.id
      );
      if (currentLikeStatusOfUser.length === 0) {
        return res.status(400).json({
          notliked: "You have not yet liked this post"
        });
      }

      //get the removed index
      const removedIndex = post.likes
        .map(item => item.user.toString())
        .indexOf(req.user.id);

      //splice out of array
      post.likes.splice(removedIndex, 1);

      await post.save();
      res.json(post);
    } catch (error) {
      res.status(404).json({
        message: error,
        nopostfound: "No post found"
      });
    }
  }
);
module.exports = router;
