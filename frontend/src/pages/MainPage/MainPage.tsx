import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import { identifyUser, resetAnalytics, trackEvent } from "../../lib/analytics";
import {
  configureRevenueCat,
  userHasProEntitlement,
} from "../../lib/revenuecat";

function MainPage() {
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasPro, setHasPro] = useState(false);

  const navigate = useNavigate();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      return;
    }

    trackEvent("auth_sign_out_succeeded");
    resetAnalytics();

    navigate("/users/sign-in");
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getClaims();
        const claims = data?.claims;

        if (error || !claims) {
          navigate("/users/sign-in");
          return;
        }

        identifyUser(claims.sub);
        configureRevenueCat(claims.sub);

        try {
          const isProUser = await userHasProEntitlement();
          setHasPro(isProUser);
        } catch (error) {
          console.error("Error checking RevenueCat entitlement:", error);
          setHasPro(false);
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", claims.sub)
          .single();

        if (profileError) {
          console.error("Error loading profile:", profileError);
          setUserName(claims.email || "");
          return;
        }
        setUserName(profile?.name || claims.email || "");
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate("/users/sign-in");
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main>
      <button type="button" onClick={handleSignOut}>
        Sign out
      </button>
      <h1>This is the main page</h1>
      <p>Signed in as {userName}</p>
      <p>Plan: {hasPro ? "Pro" : "Free"}</p>
    </main>
  );
}

export default MainPage;
