const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export async function subscribeLead(
  email: string,
  source: "footer" | "ai_waitlist"
): Promise<void> {
  const res = await fetch(`${API_URL}/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { email, source } }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Error al registrar el correo");
  }
}
