import { useState } from "react";
import { Link, useNavigate } from "react-router";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const response = await fetch("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors) {
        setErrorMessage(data.errors[0].msg);
        return;
      }

      setErrorMessage(data.message || "Something went wrong");
      return;
    }

    navigate("/");
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
      <div>
        <p>
          Need an Account? <Link to="/users/sign-up">Sign up</Link>
        </p>
      </div>
    </main>
  );
}

export default SignInPage;
