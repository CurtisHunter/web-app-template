const { body, validationResult, matchedData } = require("express-validator");

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
    res.json({ message: "sign up route", received: { name, email, password } });
  },
];

exports.signIn = async (req, res) => {
  res.json({ message: "sign in route", received: req.body });
};

exports.signOut = async (req, res) => {
  res.json({ message: "sign out route" });
};

exports.getCurrentUser = async (req, res) => {
  res.json({ user: null });
};
