const db = require("../db/queries");
const { body, validationResult, matchedData } = require("express-validator");

exports.coloursListGet = async (req, res) => {
  const colours = await db.getColours();
  console.log(colours[0].colour);
  res.render("colours", { colours: colours });
};

exports.viewColourGet = async (req, res) => {
  const colour = await db.getColourbyId(req.params.colourId);
  const allColours = await db.getColours();
  res.render("viewColour", {
    colour: colour,
    allColours: allColours,
  });
};

exports.ColourByIdGet = async (req, res) => {
  const colour = await db.getColourbyId(req.params.colourId);
  console.log(colour);
  res.render("updateColour", { colour: colour });
};

exports.colourDeletePost = async (req, res) => {
  await db.deleteColour(req.params.colourId);
  res.redirect("/colours");
};

const alphaErr = "must only contain letters.";
const lengthErr = "Must be beteween 1 and 10 characters";
const numberErr = "Must be a number";

validateUser = [
  body("colour")
    .trim()
    .isAlpha()
    .withMessage(`Colour ${alphaErr}`)
    .isLength({ min: 1, max: 15 })
    .withMessage(`Colour ${lengthErr}`),
  body("powerRank").trim().isNumeric().withMessage(`powerRank ${numberErr}`),
  body("description")
    .trim()
    .matches("^[a-zA-Z0-9_ ]*$")
    .withMessage(`Description ${alphaErr}`),
];

exports.coloursCreateGet = async (req, res) => {
  res.render("createColour");
};

exports.coloursCreatePost = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("createColour", {
        errors: errors.array(),
      });
    }
    const { colour, powerRank, description } = matchedData(req);
    db.addColour(colour, powerRank, description);
    res.redirect("/");
  },
];

exports.UpdateColourPost = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("createColour", {
        errors: errors.array(),
      });
    }
    const { colour, powerRank, description } = matchedData(req);
    db.updateColourbyId(colour, powerRank, description, req.params.colourId);

    res.redirect("/colours");
  },
];
