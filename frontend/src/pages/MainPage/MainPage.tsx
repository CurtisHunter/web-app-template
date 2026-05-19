import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";

function MainPage() {
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      return;
    }

    navigate("/users/sign-in");
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getClaims();
        const claims = data?.claims;

        if (error || !claims) {
          navigate("/users/sign-in");
          return;
        }

        const userMetadata = claims.user_metadata as
          | { name?: string }
          | undefined;

        setUserName(userMetadata?.name || claims.email || "");
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
