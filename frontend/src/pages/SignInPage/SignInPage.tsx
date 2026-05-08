function SignInPage() {
  return (
    <main>
      <h1>Sign in</h1>
      <form>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" />
        </div>
        <button type="submit">Log In</button>
      </form>
    </main>
  );
}

export default SignInPage;
