import type { NextFunction, Request, Response } from "express";

const { validationResult } = require("express-validator");

function validateRequest(req: Request, res: Response, next: NextFunction) {
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
