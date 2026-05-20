import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate("/");
  }

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
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
