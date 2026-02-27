"use client";

import { IconsApp } from "@/components/icons/Icons";
import styles from "../../app/(dashboard)/home/user/request/Request.module.css";
import { FormData } from "@/app/(dashboard)/home/user/request/page";

interface DeliveryStepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function DeliveryStep({
  formData,
  setFormData,
}: DeliveryStepProps) {
  const handleMethodChange = (method: "retiro" | "envio") => {
    setFormData((prev) => ({
      ...prev,
      deliveryMethod: method,
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      deliveryCity: e.target.value,
    }));
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          {/* Aquí puedes usar un icono de camión de tu IconsApp */}
          <div className={styles.iconWrapper}>
            <IconsApp.Truck color="#f58220" />
          </div>
        </div>
        <h2 className={styles.cardTitle}>Preferencias de Entrega</h2>
      </div>
      <div className={styles.divider} />

      <div className={styles.cardBody}>
        {/* Selector de Ciudad / Comuna */}
        <div className={styles.field}>
          <label>Ciudad / Comuna</label>
          <div className={styles.selectWrapper}>
            <div
              className={styles.iconOverlay}
              style={{ left: "16px", right: "auto" }}
            >
              <IconsApp.Pin />
            </div>
            <select
              style={{ paddingLeft: "45px" }} // Espacio para el icono de la izquierda
              name="deliveryCity"
              value={formData.deliveryCity}
              onChange={handleCityChange}
            >
              <option value="Caracas, RM">Caracas, RM</option>
              <option value="Miranda, RM">Miranda, RM</option>
              {/* Más ciudades... */}
            </select>
            <div className={styles.iconOverlay}>
              <IconsApp.DownArrow />
            </div>
          </div>
        </div>

        <div className={styles.deliveryToggleGroup}>
          {/* Esta es la cápsula blanca que se desliza */}
          <div
            className={`${styles.slider} ${
              formData.deliveryMethod === "envio"
                ? styles.sliderRight
                : styles.sliderLeft
            }`}
          />

          <button
            type="button"
            className={`${styles.toggleBtn} ${
              formData.deliveryMethod === "retiro" ? styles.activeText : ""
            }`}
            onClick={() => handleMethodChange("retiro")}
          >
            Retiro en tienda
          </button>

          <button
            type="button"
            className={`${styles.toggleBtn} ${
              formData.deliveryMethod === "envio" ? styles.activeText : ""
            }`}
            onClick={() => handleMethodChange("envio")}
          >
            Envío a domicilio
          </button>
        </div>
      </div>
    </section>
  );
}
