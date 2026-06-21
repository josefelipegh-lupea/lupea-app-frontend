const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  children?: Category[];
}

export interface Meta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface CategoriesResponse {
  data: Category[];
  meta: Meta;
}

export interface FlatCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  specification: string | null;
  parentId: number | null;
}

export interface RepuestoFlat {
  id: number;
  name: string;
  subcategoria: string;
  categoria: string;
  label: string;
}

export async function getCategories(): Promise<CategoriesResponse> {
  const res = await fetch(
    `${API_URL}/categories?populate=children&filters[parent][$null]=true`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(
      responseData.error?.message || "Error al obtener las categorías",
    );
  }

  return responseData;
}

export async function getAllCategoriesFlat(jwt: string): Promise<FlatCategory[]> {
  const res = await fetch(`${API_URL}/categories/flat-all`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Error al obtener taxonomía");
  }
  return data.data as FlatCategory[];
}

export function buildRepuestosFlat(nodes: FlatCategory[]): RepuestoFlat[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const result: RepuestoFlat[] = [];

  for (const node of nodes) {
    if (node.parentId === null) continue;
    const sub = byId.get(node.parentId);
    if (!sub || sub.parentId === null) continue;
    const cat = byId.get(sub.parentId);
    if (!cat) continue;
    result.push({
      id: node.id,
      name: node.name,
      subcategoria: sub.name,
      categoria: cat.name,
      label: `${node.name} — ${sub.name} / ${cat.name}`,
    });
  }

  return result;
}
