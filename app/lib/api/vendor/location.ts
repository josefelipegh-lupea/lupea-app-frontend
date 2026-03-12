import {
  LocationValues,
  MunicipalitiesResponse,
  ParishesResponse,
  StateResponse,
} from "../client/location";

const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface ProviderLocation {
  id: number;
  documentId: string;
  name: string;
  type: "branch" | "main";
  state: string;
  municipality: string;
  parish: string;
  address: string;
  exactAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
  status: string;
}

export interface LocationsResponse {
  ok: boolean;
  data: ProviderLocation[];
}

export interface CreateLocationDTO {
  name: string;
  type: string;
  state: string;
  municipality: string;
  parish: string;
  address: string;
  exactAddress: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

export async function getStatesProvider(jwt: string): Promise<StateResponse> {
  const res = await fetch(`${API_URL}/catalog/venezuela/states`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener los estados");
  return data;
}

export async function getMunicipalitiesProvider(
  jwt: string,
  stateId: number
): Promise<MunicipalitiesResponse> {
  const res = await fetch(
    `${API_URL}/catalog/venezuela/municipalities?stateId=${stateId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Error al obtener los municipios");
  return data;
}

export async function getParishesProvider(
  jwt: string,
  stateId: number,
  municipality: string
): Promise<ParishesResponse> {
  const params = new URLSearchParams({
    state: stateId.toString(),
    municipality: municipality,
  });

  const res = await fetch(
    `${API_URL}/catalog/venezuela/parishes?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.message || "Error al obtener las parroquias");

  return data;
}

export async function createLocationProvider(
  jwt: string,
  locationData: LocationValues
) {
  const res = await fetch(`${API_URL}/provider-profiles/me/locations`, {
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

export async function getProviderLocations(
  jwt: string
): Promise<LocationsResponse> {
  const res = await fetch(`${API_URL}/provider-profiles/me/locations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });
  const data: LocationsResponse = await res.json();
  if (!res.ok) throw new Error("Error al obtener ubicaciones");
  return data;
}

export async function addProviderLocation(
  jwt: string,
  payload: CreateLocationDTO
): Promise<{ ok: boolean; data: ProviderLocation }> {
  const res = await fetch(`${API_URL}/provider-profiles/me/locations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al crear ubicación");
  return data;
}

export const updateProviderLocation = async (
  token: string,
  id: number,
  data: CreateLocationDTO
) => {
  const res = await fetch(`${API_URL}/provider-profiles/me/locations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al actualizar la ubicación");
  return res.json();
};

export async function deleteProviderLocation(
  jwt: string,
  id: number
): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_URL}/provider-profiles/me/locations/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al eliminar ubicación");
  return data;
}
