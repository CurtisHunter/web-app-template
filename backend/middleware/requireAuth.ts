import type { NextFunction, Request, Response } from "express";
import type { User } from "@supabase/supabase-js";

const supabase = require("../lib/supabase");

type AuthenticatedRequest = Request & {
  user?: User;
};

async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  // All protected backend routes expect the frontend to send the current
  // Supabase access token as Authorization: Bearer <token>.
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  // getUser(token) asks Supabase Auth to verify the token. This is safer than
  // decoding claims locally when backend access controls depend on the result.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid auth token" });
  }

  req.user = user;
  next();
}

module.exports = requireAuth;
