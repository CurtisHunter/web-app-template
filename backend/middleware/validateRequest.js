const { validationResult } = require("express-validator");

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    error: "Invalid request",
    details: errors.array(),
  });
}

module.exports = validateRequest;
