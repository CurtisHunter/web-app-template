import type { Request } from "express";
import type { User } from "@supabase/supabase-js";

export type AuthenticatedRequest = Request & {
  user: User;
};

export type MaybeAuthenticatedRequest = Request & {
  user?: User;
};
