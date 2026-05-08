//const db = require("../db/queries");
//const { body, validationResult, matchedData } = require("express-validator");

exports.healthCheck = async (req, res) => {
  res.json({ status: "ok" });
};
