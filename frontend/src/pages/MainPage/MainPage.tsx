import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function MainPage() {
  const [userName, setUserName] = useState("");

  const navigate = useNavigate();

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
      <h1>This is the main page</h1>
      <p>Signed in as: {userName}</p>
    </main>
  );
}

export default MainPage;
