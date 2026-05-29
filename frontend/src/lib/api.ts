const apiUrl = import.meta.env.VITE_API_URL;

// Small authenticated API helpers. They centralize the backend URL and bearer
// token header without becoming a full request framework too early.
export async function apiGet(path: string, accessToken: string) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  return { response, data };
}

// POST helper currently covers server actions that do not need a JSON body,
// such as creating a Stripe Checkout Session for the authenticated user.
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
