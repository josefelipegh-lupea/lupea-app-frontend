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

type StrapiPaginationMeta = {
  pagination?: {
    page: number;
    pageCount: number;
    pageSize: number;
    total: number;
  };
};

type StrapiVehicleItemResponse = VehicleItemResponse<VehicleItem> & {
  meta?: StrapiPaginationMeta;
  error?: {
    message?: string;
  };
};

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

function normalizeVehicleName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function findVehicleItemByName(
  items: VehicleItem[],
  targetName?: string | null
) {
  const normalizedTarget = normalizeVehicleName(String(targetName || ""));

  if (!normalizedTarget) {
    return undefined;
  }

  return items.find(
    (item) => normalizeVehicleName(item.name) === normalizedTarget
  );
}

async function fetchAllVehicleItems(
  jwt: string,
  endpoint: string,
  fallbackErrorMessage: string,
  filter?: (item: VehicleItem) => boolean
): Promise<VehicleItemResponse<VehicleItem>> {
  const allItems: VehicleItem[] = [];
  const seenDocumentIds = new Set<string>();
  const separator = endpoint.includes("?") ? "&" : "?";
  let page = 1;
  let pageCount = 1;

  do {
    const res = await fetch(
      `${API_URL}/${endpoint}${separator}pagination[page]=${page}&pagination[pageSize]=100`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );

    const data: StrapiVehicleItemResponse = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || fallbackErrorMessage);
    }

    for (const item of data.data || []) {
      if (seenDocumentIds.has(item.documentId)) {
        continue;
      }

      seenDocumentIds.add(item.documentId);
      allItems.push(item);
    }

    pageCount = data.meta?.pagination?.pageCount ?? 1;
    page += 1;
  } while (page <= pageCount);

  return {
    data: sortVehicleItems(filter ? allItems.filter(filter) : allItems),
  };
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
  return fetchAllVehicleItems(
    jwt,
    "vehicle-brands?sort[0]=name:asc",
    "No se pudieron obtener los vehículos del cliente"
  );
}

export async function getEngineTypes(
  jwt: string
): Promise<VehicleItemResponse<VehicleItem>> {
  return fetchAllVehicleItems(
    jwt,
    "engine-types?sort[0]=name:asc",
    "No se pudieron obtener los tipos de motor",
    (item) => VENEZUELA_GENERIC_ENGINE_TYPES.has(item.name)
  );
}

export async function getModelsByBrand(
  jwt: string,
  brandDocumentId: string
): Promise<VehicleItemResponse<VehicleItem>> {
  return fetchAllVehicleItems(
    jwt,
    `vehicle-models?filters[brand][documentId][$eq]=${brandDocumentId}&sort[0]=name:asc`,
    "No se pudieron obtener los modelos"
  );
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
