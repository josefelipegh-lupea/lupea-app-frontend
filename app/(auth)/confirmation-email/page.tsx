"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./ConfirmationEmail.module.css";
import { IconsApp } from "@/components/icons/Icons";
import { toast } from "react-hot-toast";
import { confirmClientEmail } from "../../lib/api/auth";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  const verify = useCallback(
    async (token: string) => {
      try {
        const confirm = await confirmClientEmail(token);
        console.log(confirm);

        Promise.resolve().then(() => {
          setStatus("success");
          toast.success("¡Email confirmado!");
        });

        setTimeout(() => {
          router.push("/login");
        }, 5000);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error de validación";
        Promise.resolve().then(() => {
          setStatus("error");
          toast.error(msg);
        });
      }
    },
    [router]
  );

  useEffect(() => {
    const code = searchParams.get("confirmation");

    const executionTimer = setTimeout(() => {
      if (!code) {
        setStatus("error");
        return;
      }
      verify(code);
    }, 0);

    return () => clearTimeout(executionTimer);
  }, [searchParams, verify]);

  return (
    <div className={styles.bgWrapper}>
      <div className={styles.confirmCard}>
        {/* <div className={styles.brandIcon}>
          <IconsApp.Email />
        </div> */}

        {status === "loading" && (
          <>
            <h1 className={styles.title}>Verificando cuenta</h1>
            <p className={styles.subtitle}>Espera un momento, por favor...</p>
            <div className={styles.loader} />
          </>
        )}

        {status === "success" && (
          <>
            <h1 className={styles.title}>¡Correo confirmado!</h1>
            <p className={styles.subtitle}>
              Tu cuenta ha sido activada con éxito. Ya puedes iniciar sesión.
            </p>
            <button
              className={styles.mainButton}
              onClick={() => router.replace("/login")}
            >
              Iniciar Sesión
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className={styles.title}>Enlace no válido</h1>
            <p className={styles.subtitle}>
              El código ha expirado o es incorrecto. Intenta registrarte de
              nuevo.
            </p>
            <button
              className={styles.mainButton}
              onClick={() => router.replace("/user/register")}
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
