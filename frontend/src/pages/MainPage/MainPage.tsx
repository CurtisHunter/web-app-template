import { useEffect, useState } from "react";

function MainPage() {
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    async function checkApi() {
      const response = await fetch("http://localhost:3000/api/health");
      const data = await response.json();

      setApiStatus(data.status);
    }

    checkApi();
  });
  return (
    <main>
      <h1>This is the main page</h1>
      <p>API status: {apiStatus}</p>
    </main>
  );
}

export default MainPage;
