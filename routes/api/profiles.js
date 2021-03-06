const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

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
      const profile = await Profile.findOne({ user: req.user.id }).populate(
        "user",
        ["name", "avatar"]
      );
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

// @route  GET api/profiles/all
// @desc   get all profiles
// @access public
router.get("/all", async (req, res, next) => {
  const errors = {};
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);

    if (!profiles) {
      errors.noprofile = "There are no profiles";
      res.status(404).json(errors);
    }

    res.json(profiles);
  } catch (error) {
    res.status(404).json({
      profile: " There are no profiles ",
      message: error
    });
  }
});

// @route  GET api/profiles/handle/:handle
// @desc   get profile by handle
// @access public
router.get("/handle/:handle", async (req, res, next) => {
  const errors = {};
  try {
    const profile = await Profile.findOne({
      handle: req.params.handle
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      errors.noprofile = "There is no profile for this user";
      res.status(404).json(errors);
    }

    res.json(profile);
  } catch (error) {
    res.status(404).json({
      profile: " There is no profile for this user ",
      message: error
    });
  }
});

// @route  GET api/profiles/users/:user_id
// @desc   get profile by user id
// @access public
router.get("/user/:user_id", async (req, res, next) => {
  const errors = {};
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      errors.noprofile = "There is no profile for this user";
      res.status(404).json(errors);
    }

    res.json(profile);
  } catch (error) {
    res.status(404).json({
      profile: " There is no profile for this user ",
      message: error
    });
  }
});

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

// @route  POST api/profiles/experience
// @desc   add experience to profile
// @access private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    //check validation
    if (!isValid) {
      //return any errors with 400 status
      return res.status(400).json(errors);
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //add to experience array
      profile.experience.unshift(newExp);

      await profile.save();
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
);

// @route  POST api/profiles/education
// @desc   add education to profile
// @access private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const { errors, isValid } = validateEducationInput(req.body);

    //check validation
    if (!isValid) {
      //return any errors with 400 status
      return res.status(400).json(errors);
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //add to experience array
      profile.education.unshift(newEdu);

      await profile.save();
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
);

// @route  DELETE api/profiles/experience/:exp_id
// @desc   delete experience from profile
// @access private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      //get removed index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      //splice out of array
      profile.experience.splice(removeIndex, 1);

      await profile.save();
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
);

// @route  DELETE api/profiles/education/:edu_id
// @desc   delete education from profile
// @access private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      //get removed index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      //splice out of array
      profile.education.splice(removeIndex, 1);

      await profile.save();
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
);

// @route  DELETE api/profiles/
// @desc   delete user and user'sprofile
// @access private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      await Profile.findOneAndRemove({ user: req.user.id });
      await User.findOneAndRemove({ _id: req.user.id });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);
module.exports = router;
