const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface VehicleItemResponse<T> {
  data: T[];
}

export interface VehicleItem {
  id: number;
  documentId: string;
  name: string;
}

export interface VehicleMasterRef {
  id: number;
  documentId: string;
  name: string;
}

export interface Vehicle {
  id: number;
  documentId: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  engine: string;
  brandMaster?: VehicleMasterRef | null;
  modelMaster?: VehicleMasterRef | null;
  modelEngineMaster?: VehicleMasterRef | null;
  engineTypeMaster?: VehicleMasterRef | null;
}

export interface VehiclePayload {
  brand?: string;
  model?: string;
  engine?: string;
  version?: string;
  year: number;
  brandId?: number;
  modelId?: number;
  modelEngineId?: number;
  engineTypeId?: number;
}

const VENEZUELA_GENERIC_ENGINE_TYPES = new Set([
  "Gasolina",
  "Diésel",
  "Híbrido",
  "Eléctrico",
  "Etanol / Flex",
]);

function sortVehicleItems(items: VehicleItem[]) {
  return [...items].sort((left, right) =>
    left.name.localeCompare(right.name, "es", {
      sensitivity: "base",
      numeric: true,
    })
  );
}

export interface ClientVehiclesResponse {
  ok: boolean;
  data: Vehicle[];
}

export async function createVehicle(jwt: string, vehicleData: VehiclePayload) {
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

export async function updateVehicle(
  jwt: string,
  id: number,
  vehicleData: VehiclePayload
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

export async function getBrands(
  jwt: string
): Promise<VehicleItemResponse<VehicleItem>> {
  const res = await fetch(`${API_URL}/vehicle-brands?sort[0]=name:asc`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error?.message || "No se pudieron obtener los vehículos del cliente"
    );
  }

  return {
    ...data,
    data: sortVehicleItems(data.data || []),
  };
}

export async function getEngineTypes(
  jwt: string
): Promise<VehicleItemResponse<VehicleItem>> {
  const res = await fetch(`${API_URL}/engine-types?sort[0]=name:asc`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error?.message || "No se pudieron obtener los tipos de motor"
    );
  }

  return {
    ...data,
    data: sortVehicleItems(
      (data.data || []).filter((item: VehicleItem) =>
        VENEZUELA_GENERIC_ENGINE_TYPES.has(item.name)
      )
    ),
  };
}

export async function getModelsByBrand(
  jwt: string,
  brandDocumentId: string
): Promise<VehicleItemResponse<VehicleItem>> {
  const res = await fetch(
    `${API_URL}/vehicle-models?filters[brand][documentId][$eq]=${brandDocumentId}&sort[0]=name:asc`,
    {
      headers: { Authorization: `Bearer ${jwt}` },
    }
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error?.message || "No se pudieron obtener los modelos"
    );
  }

  return {
    ...data,
    data: sortVehicleItems(data.data || []),
  };
}

export async function getModelEnginesByModel(
  jwt: string,
  modelDocumentId: string
): Promise<VehicleItemResponse<VehicleItem>> {
  const res = await fetch(
    `${API_URL}/client-profiles/catalog/vehicle-model-engines?modelDocumentId=${encodeURIComponent(modelDocumentId)}`,
    {
      headers: { Authorization: `Bearer ${jwt}` },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "No se pudieron obtener los motores");
  }

  return {
    ...data,
    data: sortVehicleItems(data.data || []),
  };
}
