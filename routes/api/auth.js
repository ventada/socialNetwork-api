const express = require("express");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator/check");
const keys = require("../../config/keys");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../../models/User");

const router = express.Router();

// @route GET /api/Auth
// @desc  Test routes
// @access  Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

// @route POST /api/auth
// @desc  Auhtenticate routes & get token
// @access  Public
router.post(
  "/",
  [
    check("password", "Password is required")
      .not()
      .isEmpty(),
    check("email", "please include a valid email address").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        res.status(400).json([{ msg: "Invalid Credentials" }]);
      }

      // match the user and it's password\
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json([{ msg: "Invalid Credentials" }]);
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        keys.jwtSecret,
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        },
      );
    } catch (err) {
      console.log(err.message);
      res.status(500);
    }
  },
);

module.exports = router;
