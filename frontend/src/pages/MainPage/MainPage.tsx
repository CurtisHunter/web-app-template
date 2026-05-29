import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import { identifyUser, resetAnalytics, trackEvent } from "../../lib/analytics";
import { apiGet, apiPost } from "../../lib/api";

function MainPage() {
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasPro, setHasPro] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

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

  async function handleUpgrade() {
    setIsStartingCheckout(true);
    setCheckoutError("");
    try {
      // Checkout is a backend action because Stripe secret keys must never
      // reach the browser. The access token lets the backend derive user.id.
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        navigate("/users/sign-in");
        return;
      }

      const { response, data } = await apiPost(
        "/api/create-checkout-session",
        session.access_token,
      );

      if (!response.ok) {
        console.error("Error creating Stripe checkout session");
        setCheckoutError("Could not start checkout. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Error presenting Stripe checkout", error);
      setCheckoutError("Could not start checkout. Please try again.");
    } finally {
      setIsStartingCheckout(false);
    }
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        // getClaims is the fast client-side auth check for routing/UI. Backend
        // endpoints still verify the access token before doing trusted work.
        const { data, error } = await supabase.auth.getClaims();
        const claims = data?.claims;

        if (error || !claims) {
          navigate("/users/sign-in");
          return;
        }

        identifyUser(claims.sub);

        // Backend billing status returns only { hasPro } so sensitive Stripe and
        // subscription table details stay server-owned.
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate("/users/sign-in");
          return;
        }

        try {
          const { response, data: billingStatus } = await apiGet(
            "/api/billing/status",
            session.access_token,
          );

          if (!response.ok) {
            console.error("Error loading billing status:", billingStatus);
            setHasPro(false);
            return;
          }

          setHasPro(billingStatus.hasPro);
        } catch (error) {
          console.error("Error loading billing status:", error);
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

    function checkCheckoutStatus() {
      // Stripe redirects back with a small status marker. Webhooks still decide
      // the real subscription state, so this message is only UX feedback.
      const searchParams = new URLSearchParams(window.location.search);
      const checkoutStatus = searchParams.get("checkout");

      if (checkoutStatus === "success") {
        setCheckoutMessage(
          "Checkout completed. Your plan may take a moment to update.",
        );
      }

      if (checkoutStatus === "cancelled") {
        setCheckoutMessage("Checkout cancelled.");
      }
    }

    checkCheckoutStatus();
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
      {checkoutMessage && <p>{checkoutMessage}</p>}
      <p>Signed in as {userName}</p>
      <p>Plan: {hasPro ? "Pro" : "Free"}</p>
      {!hasPro && (
        <div>
          {checkoutError && <p>{checkoutError}</p>}
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={isStartingCheckout}
          >
            {isStartingCheckout ? "Starting checkout..." : "Upgrade"}
          </button>
        </div>
      )}
    </main>
  );
}

export default MainPage;
