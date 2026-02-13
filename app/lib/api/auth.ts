const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export type LoginResponse = {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    // confirmed: boolean;
  };
  clientProfile: {
    id: number;
    display_name: string;
    tokens_available: number;
    tokens_last_renewal: string;
    privacy_level: string;
  };
};

export async function loginClient(
  identifier: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/local/login-client`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier,
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Manejo de errores específicos de Strapi
    throw new Error(data.error?.message || "Credenciales incorrectas");
  }

  return data;
}
