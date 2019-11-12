const express = require("express");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const request = require("request");
const keys = require("../../config/keys");

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
      ["name", "avatar"]
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
        .isEmpty()
    ]
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
      linkedin
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
            $set: profileFeilds
          },
          { new: true }
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
  }
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
      ["name", "avatar"]
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

// @route PUT /api/profile/experience
// @desc  Update the profile / adding the experience
// @access  private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "title is required")
        .not()
        .isEmpty(),
      check("company", "company is required")
        .not()
        .isEmpty(),
      check("from", "from Date is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).send("server error");
    }
  }
);

// @route DELETE /api/profile/experience
// @desc  deleiting the profile  experience
// @access  private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // GEt remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexof(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
});

// @route PUT /api/profile/education
// @desc  Update the profile / adding the education
// @access  private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "school is required")
        .not()
        .isEmpty(),
      check("degree", "degree is required")
        .not()
        .isEmpty(),
      check("fieldofstudy", "fieldofstudy is required")
        .not()
        .isEmpty(),
      check("from", "from Date is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,

      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).send("server error");
    }
  }
);

// @route DELETE /api/profile/education
// @desc  deleiting the profile  education
// @access  private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // GEt remove index
    const removeIndex = profile.education
      .map(item => item.id)
      .indexof(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
});

// @route GET /api/profile/github/:username
// @desc  get user repo
// @access  public\
router.get("/github/:username", async (req, res) => {
  try {
    const option = {
      uri: `https://api.github/users/${req.params.username}/repos/?per_page=5&sort=created:asc&client_id=${keys.githubClientID}&client_secret=${keys.githubSecret}`,
      method: "GET",
      headers: { "user-agent": "node.js" }
    };

    request(option, (error, response, body) => {
      if (error) console.log(error);

      if (response.statusCode !== 200) {
        res.status(404).json({ msg: "No github rep found" });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
});

module.exports = router;
