const apiUrl = import.meta.env.VITE_API_URL;

export async function apiGet(path: string, accessToken: string) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  return { response, data };
}

export async function apiPost(path: string, accessToken: string) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  return { response, data };
}
