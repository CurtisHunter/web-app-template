import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import { trackEvent } from "../../lib/analytics";

function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    trackEvent("auth_sign_up_submitted", {
      method: "email",
    });

    // Store display name in Supabase user metadata. The database trigger can
    // copy this into public.profiles without trusting frontend table writes.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      trackEvent("auth_sign_up_failed", {
        method: "email",
        reason: error.message,
      });
      return;
    }
    trackEvent("auth_sign_up_succeeded", {
      method: "email",
    });
    navigate("/users/sign-in");
  }

  return (
    <main>
      <h1>Sign up</h1>
      {errorMessage && <p>{errorMessage}</p>}

      <form onSubmit={(e) => handleSubmit(e)}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

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

        <button type="submit">Create Account</button>
      </form>

      <div>
        <p>
          Already have an Account? <Link to="/users/sign-in">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

export default SignUpPage;
