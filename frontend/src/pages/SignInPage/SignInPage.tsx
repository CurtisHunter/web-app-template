import { useState } from "react";
import { Link } from "react-router";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log({
      email,
      password,
    });
  }

  return (
    <main>
      <h1>Sign in</h1>
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
      <div>
        <p>
          Need an Account? <Link to="/users/sign_up">Sign up</Link>
        </p>
      </div>
    </main>
  );
}

export default SignInPage;
