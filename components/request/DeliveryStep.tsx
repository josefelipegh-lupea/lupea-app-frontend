"use client";

import { IconsApp } from "@/components/icons/Icons";
import styles from "../../app/(dashboard)/home/user/request/Request.module.css";
import { Location, State } from "@/app/lib/api/client/location";
import { QuoteRequestFormData } from "@/hooks/useRequesFormAutoSave";

interface DeliveryStepProps {
  formData: QuoteRequestFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteRequestFormData>>;
  states: State[];
  isCompleted: boolean;
  locations: Location[];
  saveDraft: (data: QuoteRequestFormData) => void;
}

export default function DeliveryStep({
  formData,
  setFormData,
  states,
  isCompleted,
  locations,
  saveDraft,
}: DeliveryStepProps) {
  const handleMethodChange = (method: "retiro" | "delivery") => {
    const updatedData = {
      ...formData,
      deliveryMethod: method,
      deliveryCity: "",
    };

    setFormData(updatedData);
    saveDraft(updatedData);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    const updatedData = {
      ...formData,
      deliveryCity: value,
    };

    setFormData(updatedData);
    saveDraft(updatedData);
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          <div className={styles.iconWrapper}>
            <IconsApp.Truck color="#f58220" />
          </div>
        </div>
        <h2 className={styles.cardTitle}>Preferencias de Entrega</h2>
        {isCompleted && (
          <div className={styles.stepCompletedBadge}>
            <IconsApp.Check />
          </div>
        )}
      </div>
      <div className={styles.divider} />

      <div className={styles.cardBody}>
        <div className={`${styles.field} ${styles.fieldMarginTop}`}>
          <label>Ubicación <span className={styles.required}>*</span></label>
          <div className={styles.selectWrapper}>
            <div
              className={`${styles.iconOverlay} ${styles.iconOverlayLeft}`}
            >
              <IconsApp.Pin />
            </div>
            <select
              className={styles.selectWithLeftIcon}
              name="deliveryCity"
              value={formData.deliveryCity}
              onChange={handleCityChange}
            >
              <option value="">Selecciona una ubicación</option>

              {/* {isRetiro
                ? states.map((state) => (
                    <option key={`state-${state.id}`} value={state.id}>
                      {state.name}
                    </option>
                  ))
                :  */}

              {locations.map((loc) => (
                <option key={`loc-${loc.id}`} value={loc.id}>
                  {loc.name} - {loc.state}
                </option>
              ))}
            </select>
            <div className={styles.iconOverlay}>
              <IconsApp.DownArrow />
            </div>
          </div>
        </div>

        <div className={styles.deliveryToggleGroup}>
          <div
            className={`${styles.slider} ${
              formData.deliveryMethod === "delivery"
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
              formData.deliveryMethod === "delivery" ? styles.activeText : ""
            }`}
            onClick={() => handleMethodChange("delivery")}
          >
            Envío a domicilio
          </button>
        </div>

        {locations.length === 0 && (
          <p className={styles.warningText}>
            * No tienes direcciones guardadas. Ve a tu perfil para agregar una.
          </p>
        )}
      </div>
    </section>
  );
}
