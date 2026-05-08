function SignUpPage() {
  return (
    <main>
      <h1>Sign up</h1>
      <form>
        <div>
          <label htmlFor="name">Username</label>
          <input id="username" name="username" type="text"></input>
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" />
        </div>
        <button type="submit">Create Account</button>
      </form>
    </main>
  );
}

export default SignUpPage;
