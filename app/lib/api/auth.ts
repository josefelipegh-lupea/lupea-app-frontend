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
    displayName: string;
    tokensAvailable: number;
    tokensLastRenewal: string;
    privacyLevel: string;
  };
};

export type RegisterResponse = {
  ok: boolean;
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    confirmed: boolean;
  };
  clientProfile: {
    id: number;
    tokensAvailable: number;
  };
  note: string;
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
    throw new Error(data.error || "Credenciales incorrectas");
  }

  return data;
}

export async function registerClient(
  username: string,
  email: string,
  password: string,
  terms_accepted: boolean = true
): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}/auth/local/register-client`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
      terms_accepted,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error al registrar el usuario");
  }

  return data;
}
