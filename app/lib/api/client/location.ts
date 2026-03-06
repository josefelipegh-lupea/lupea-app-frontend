const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface LocationValues {
  name: string;
  type: string;
  state: string;
  municipality: string;
  parish: string;
  address: string;
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

export interface State {
  id: number;
  name: string;
  isoCode: string;
  capital: string;
}

export interface StateResponse {
  ok: boolean;
  data: State[];
}

export interface Municipality {
  name: string;
  capital: string;
  parishCount: number;
}

export interface MunicipalitiesResponse {
  ok: boolean;
  data: {
    state: State;
    municipalities: Municipality[];
  };
}

export interface ParishesResponse {
  ok: boolean;
  data: {
    state: { id: number; name: string };
    municipality: { name: string; capital: string };
    parishes: string[];
  };
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

export async function getStates(jwt: string): Promise<StateResponse> {
  const res = await fetch(
    `${API_URL}/client-profiles/catalog/venezuela/states`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener los estados");
  return data;
}

export async function getMunicipalities(
  jwt: string,
  stateId: number
): Promise<MunicipalitiesResponse> {
  const res = await fetch(
    `${API_URL}/client-profiles/catalog/venezuela/municipalities?stateId=${stateId}`,
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

export async function getParishes(
  jwt: string,
  stateId: number,
  municipalityName: string
): Promise<ParishesResponse> {
  const res = await fetch(
    `${API_URL}/client-profiles/catalog/venezuela/parishes?stateId=${stateId}&municipality=${municipalityName}`,
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
