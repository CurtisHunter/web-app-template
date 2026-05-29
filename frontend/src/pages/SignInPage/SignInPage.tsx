import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import { trackEvent } from "../../lib/analytics";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    trackEvent("auth_sign_in_submitted", { method: "email" });

    // Supabase owns password verification; Express only receives verified
    // access tokens for protected backend actions.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      trackEvent("auth_sign_in_failed", {
        method: "email",
        reason: error.message,
      });
      return;
    }

    trackEvent("auth_sign_in_succeeded", { method: "email" });

    navigate("/");
  }

  async function handleGoogleSignIn() {
    trackEvent("auth_google_sign_in_started", {
      method: "google",
    });

    // OAuth redirects back to the app origin, where the main page checks auth
    // and loads profile/billing status.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      trackEvent("auth_google_sign_in_failed", {
        method: "google",
        reason: error.message,
      });
      setErrorMessage(error.message);
    }
  }

  return (
    <main>
      <h1>Sign in</h1>
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={(e) => handleSubmit(e)}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button type="submit">Log In</button>
      </form>
      <button type="button" onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>
      <div>
        <p>
          Need an Account? <Link to="/users/sign-up">Sign up</Link>
        </p>
      </div>
    </main>
  );
}

export default SignInPage;
