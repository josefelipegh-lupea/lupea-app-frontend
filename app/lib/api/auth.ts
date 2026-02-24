const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export type LoginResponse = {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    confirmed: boolean;
    role: string;
  };
  profileType: string;
  profile: {
    id: number;
    displayName: string;
    tokensAvailable: number;
    tokensLastRenewal: string;
    privacyLevel: string;
  };
};

export type RegisterClientResponse = {
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

export type RegisterProviderResponse = {
  ok: boolean;
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    confirmed: boolean;
  };
  providerProfile: {
    id: number;
    status: "pending" | "approved" | "rejected";
  };
};

export async function loginClient(
  identifier: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
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
    const message =
      typeof data.error === "object" ? data.error.message : data.error;
    throw new Error(message || "Credenciales incorrectas");
  }

  return data;
}

export async function registerClient(
  username: string,
  email: string,
  password: string,
  termsAccepted: boolean = true
): Promise<RegisterClientResponse> {
  const res = await fetch(`${API_URL}/auth/register-client`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
      termsAccepted,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error al registrar el usuario");
  }

  return data;
}

export async function registerProvider(
  username: string,
  email: string,
  password: string,
  state: string,
  city: string,
  mainCategories: number[],
  termsAccepted: boolean
): Promise<RegisterProviderResponse> {
  const res = await fetch(`${API_URL}/auth/register-provider`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
      state,
      city,
      mainCategories,
      termsAccepted,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMessage =
      typeof data.error === "object" ? data.error.message : data.error;

    throw new Error(errorMessage || "Error al registrar el proveedor");
  }

  return data;
}

export async function confirmClientEmail(
  confirmationToken: string
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(
    `${API_URL}/auth/email-confirmation-json?confirmation=${confirmationToken}`,
    {
      method: "GET",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const errorMessage =
      typeof data.error === "object" ? data.error.message : data.error;

    throw new Error(errorMessage || "Error al registrar el proveedor");
  }

  return data;
}

export async function forgotPassword(
  email: string
): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier: email }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMessage =
      typeof data.error === "object" ? data.error.message : data.error;

    throw new Error(errorMessage || "Error al registrar el proveedor");
  }

  return data;
}

export async function resetPassword(
  token: string,
  password: string
): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: token,
      password: password,
      passwordConfirmation: password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMessage =
      typeof data.error === "object" ? data.error.message : data.error;

    throw new Error(errorMessage || "Error al registrar el proveedor");
  }

  return data;
}
