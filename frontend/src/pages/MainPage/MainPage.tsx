import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "../../api/client";

function MainPage() {
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      const response = await apiFetch("/api/auth/sign-out", {
        method: "POST",
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
      try {
        const response = await apiFetch("/api/auth/me");

        const data = await response.json();

        if (!response.ok) {
          navigate("/users/sign-in");
          return;
        }

        setUserName(data.user.name);
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
    </main>
  );
}

export default MainPage;
