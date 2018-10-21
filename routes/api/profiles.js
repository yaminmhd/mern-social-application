const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const validateProfileInput = require("../../validation/profile");

// @route  GET api/profiles/test
// @desc   Tests profiles route
// @access Public
router.get("/test", async (req, res, next) => {
  res.json({
    message: "Welcome to profiles api page"
  });
});

// @route  GET api/profiles/
// @desc   get current users profile
// @access private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const errors = {};

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      if (profile) {
        res.json(profile);
      }
    } catch (error) {
      next(error);
    }
  }
);

// @route  POST api/profiles
// @desc   create or edit user profile
// @access private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //check validation
    if (!isValid) {
      //return any errors with 400 status
      return res.status(400).json(errors);
    }

    //Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;

    //skills - split into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    //social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      //update
      const updatedProfile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      res.json(updatedProfile);
    } else {
      //create

      //check if handle exists
      const existingProfileWithHandle = await Profile.findOne({
        handle: profileFields.handle
      });
      if (existingProfileWithHandle) {
        errors.handle = "That handle already exists";
        res.status(400).json(errors);
      }

      //save
      const newProfile = new Profile(profileFields);
      const result = await newProfile.save();
      res.json(result);
    }
  }
);

module.exports = router;
