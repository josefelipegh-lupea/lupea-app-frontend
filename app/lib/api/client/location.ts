const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface LocationValues {
  name: string;
  type: string;
  state: string;
  city: string;
  searchText: string;
  zone: string;
  exactAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export interface Location extends LocationValues {
  id: number;
  documentId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ClientLocationsResponse {
  ok: boolean;
  data: Location[];
}

export async function getClientLocations(
  jwt: string
): Promise<ClientLocationsResponse> {
  const res = await fetch(`${API_URL}/client-profiles/me/locations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.error?.message || "No se pudieron obtener las ubicaciones"
    );
  }
  return data;
}

// Crear ubicación
export async function createLocation(
  jwt: string,
  locationData: LocationValues
) {
  const res = await fetch(`${API_URL}/client-profiles/me/locations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(locationData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al crear la ubicación");
  return data;
}

// Actualizar ubicación
export async function updateLocation(
  jwt: string,
  id: number,
  locationData: LocationValues
) {
  const res = await fetch(`${API_URL}/client-profiles/me/locations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(locationData),
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Error al actualizar la ubicación");
  return data;
}

// Eliminar ubicación
export async function deleteLocation(jwt: string, id: number) {
  const res = await fetch(`${API_URL}/client-profiles/me/locations/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Error al eliminar la ubicación");
  return data;
}
