const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

module.exports = function(req, res, next) {
  // Get Token from header
  const token = req.header("x-auth-token");

  // check if no token
  if (!token) {
    return res.status(401).json({ msg: "no token,authorization denied" });
  }

  // verify token
  try {
    const decoded = jwt.verify(token, keys.jwtSecret);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "token is not valid" });
  }
};
