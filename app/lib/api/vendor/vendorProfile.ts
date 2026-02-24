const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface ProviderProfile {
  id: number;
  documentId: string;
  username: string;
  email: string;
  businessName: string;
  state: string;
  city: string;
  status: string;
  termsAccepted: boolean;
  mainCategories: Category[];
}

export async function getProviderProfile(
  jwt: string
): Promise<ProviderProfile> {
  const res = await fetch(`${API_URL}/provider-profiles/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error?.message || "No se pudo obtener el perfil del proveedor"
    );
  }

  return data;
}
