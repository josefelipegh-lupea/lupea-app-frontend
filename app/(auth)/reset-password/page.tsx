import { Suspense } from "react";
import ResetPassword from "./ResetPassword";

export default function ResetPasswordPage() {
  return (
    <div>
      <Suspense fallback={<div>Cargando...</div>}>
        <ResetPassword />
      </Suspense>
    </div>
  );
}
