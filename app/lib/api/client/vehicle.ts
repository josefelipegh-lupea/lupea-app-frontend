import { VehicleValues } from "@/schemas/vehicleSchema";

const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface Vehicle {
  id: number;
  documentId: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  engine: string;
}

export interface ClientVehiclesResponse {
  ok: boolean;
  data: Vehicle[];
}

export async function createVehicle(jwt: string, vehicleData: VehicleValues) {
  const res = await fetch(`${API_URL}/client-profiles/me/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(vehicleData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al crear");
  return data;
}

// Actualizar
export async function updateVehicle(
  jwt: string,
  id: number,
  vehicleData: VehicleValues
) {
  const res = await fetch(`${API_URL}/client-profiles/me/vehicles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(vehicleData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al actualizar");
  return data;
}

export async function deleteVehicle(jwt: string, id: number) {
  const res = await fetch(`${API_URL}/client-profiles/me/vehicles/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al eliminar");
  return data;
}

export async function getClientVehicles(
  jwt: string
): Promise<ClientVehiclesResponse> {
  const res = await fetch(`${API_URL}/client-profiles/me/vehicles`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error?.message || "No se pudieron obtener los vehículos del cliente"
    );
  }

  return data;
}
