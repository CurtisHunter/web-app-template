const db = require("../db/queries");
const { body, validationResult, matchedData } = require("express-validator");

exports.servePage = async (req, res) => {
  res.render("index");
};
