import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function MainPage() {
  const [userName, setUserName] = useState("");

  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      const response = await fetch("http://localhost:3000/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      navigate("/users/sign-in");
    } catch (error) {
      console.error("Error posting data (sign out):", error);
    }
  }

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch("http://localhost:3000/api/auth/me", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        navigate("/users/sign-in");
        return;
      }

      setUserName(data.user.name);
    }

    checkAuth();
  }, [navigate]);
  return (
    <main>
      <button type="button" onClick={handleSignOut}>
        Sign out
      </button>
      <h1>This is the main page</h1>
      <p>Signed in as: {userName}</p>
    </main>
  );
}

export default MainPage;
