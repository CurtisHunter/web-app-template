const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { email, password } = matchedData(req);
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  },
];

exports.signOut = async (req, res) => {
  res.json({ message: "sign out route" });
};

exports.getCurrentUser = async (req, res) => {
  res.json({ user: null });
};
