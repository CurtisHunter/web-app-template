const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../db/queries");
const passport = require("passport");

const alphaErr = "must only contain letters.";
const lengthErr = "Must be between 1 and 30 characters";
const emailErr = "Must be an email";
const passwordErr = "must be at least 8 characters";

const validateSignUp = [
  body("name")
    .trim()
    .matches(/^[A-Za-z ]+$/)
    .withMessage(`Name ${alphaErr}`)
    .isLength({ min: 1, max: 30 })
    .withMessage(`First name ${lengthErr}`),
  body("email")
    .trim()
    .isEmail()
    .withMessage(`email ${emailErr}`)
    .normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage(`Password ${passwordErr}`),
];

exports.signUp = [
  validateSignUp,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { name, email, password } = matchedData(req);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser(name, email, hashedPassword);
    res.status(201).json({ user });
  },
];

const validateSignIn = [
  body("email")
    .trim()
    .isEmail()
    .withMessage(`email ${emailErr}`)
    .normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage(`Password ${passwordErr}`),
];

exports.signIn = [
  validateSignIn,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({ message: info.message });
      }

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
          },
        });
      });
    })(req, res, next);
  },
];

exports.signOut = async (req, res) => {
  res.json({ message: "sign out route" });
};

exports.getCurrentUser = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ user: null });
  }

  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      created_at: req.user.created_at,
    },
  });
};
