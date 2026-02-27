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

export async function getCategories(): Promise<CategoriesResponse> {
  const res = await fetch(`${API_URL}/categories?populate=children`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(
      responseData.error?.message || "Error al obtener las categorías"
    );
  }

  return responseData;
}
