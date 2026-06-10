"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Client Component: verifica localStorage y redirige usuarios autenticados
 * NO bloquea el renderizado del landing (useEffect asincrónico)
 */
export function AuthRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    const userData = localStorage.getItem("userData");

    if (jwt && userData) {
      try {
        const user = JSON.parse(userData);
        const role = user?.role === "provider" ? "vendor" : "user";
        router.replace(`/home/${role}`);
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.replace("/home/user");
      }
    }
  }, [router]);

  return null;
}
