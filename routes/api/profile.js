const express = require("express");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

const router = express.Router();

// @route GET /api/profile/me
// @desc  gt current user profile
// @access  private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"],
    );

    if (!profile) {
      return res.status(400).json({ msg: "there is no profile for ths user" });
    }

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

// @route POST /api/profile
// @desc  create or update a user profile
// @access  private
router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required")
        .not()
        .isEmpty(),
      check("skills", "skills is required")
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors });
    }
    const {
      company,
      website,
      bio,
      status,
      githubusername,
      location,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // build profile object
    const profileFeilds = {};
    profileFeilds.user = req.user.id;

    if (company) profileFeilds.company = company;
    if (bio) profileFeilds.bio = bio;
    if (githubusername) profileFeilds.githubusername = githubusername;
    if (website) profileFeilds.website = website;
    if (status) profileFeilds.status = status;
    if (location) profileFeilds.location = location;

    if (skills) {
      profileFeilds.skills = skills.split(",").map(skill => skill.trim());
    }

    // build social objject
    profileFeilds.social = {};
    if (youtube) profileFeilds.social.youtube = youtube;
    if (twitter) profileFeilds.social.twitter = twitter;
    if (facebook) profileFeilds.social.facebook = facebook;
    if (instagram) profileFeilds.social.instagram = instagram;
    if (linkedin) profileFeilds.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          {
            $set: profileFeilds,
          },
          { new: true },
        );

        return res.json(profile);
      }

      // creat
      profile = new Profile(profileFeilds);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).send("serve error");
    }
  },
);

// @route GET /api/profile
// @desc  get all profile
// @access  public

router.get("/", async (req, res) => {
  try {
    let profiles = await Profile.find().populate("user", ["name", "avatar"]);

    res.json(profiles);
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
});

// @route GET /api/profile/user/:user_id
// @desc  get  profile by user id
// @access  public
router.get("/user/:user_id", async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.params.user_id }).populate(
      "user",
      ["name", "avatar"],
    );

    if (!profile) return res.status(400).json({ msg: "Profile Not Found" });

    res.json(profile);
  } catch (err) {
    console.log(err);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Profile Not Found" });
    }
    res.status(500).send("server error");
  }
});

// @route Delete /api/profile
// @desc  delete user profile , user , post
// @access  private
router.delete("/user/:user_id", auth, async (req, res) => {
  try {
    // @todo remove user post
    // remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    await User.findOneAndRemove({ _id: req.user.id });

    if (!profile) return res.status(400).json({ msg: "Profile Not Found" });

    res.json({ msg: "user deleted" });
  } catch (err) {
    console.log(err);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Profile Not Found" });
    }
    res.status(500).send("server error");
  }
});
module.exports = router;
