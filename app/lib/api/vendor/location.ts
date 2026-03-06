import {
  LocationValues,
  MunicipalitiesResponse,
  ParishesResponse,
  StateResponse,
} from "../client/location";

const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

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
  municipalityName: string
): Promise<ParishesResponse> {
  const res = await fetch(
    `${API_URL}/catalog/venezuela/parishes?stateId=${stateId}&municipality=${municipalityName}`,
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
