"use client";

import { useState, ChangeEvent } from "react";
import { IconsApp } from "@/components/icons/Icons";
import styles from "./Vehicles.module.css";
import { useSidebar } from "@/context/SidebarContext";
import { useVehicleValidation } from "@/hooks/useVehicleValidation";
import Button from "@/components/button/Button";
import Header from "@/components/header/Header";
import InputField from "@/components/input/InputField";

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: string;
  version: string;
  engine: string;
}

const VehiclesPage = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { isExpanded } = useSidebar();

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 1,
      brand: "Toyota",
      model: "Corolla",
      year: "2022",
      version: "XEI",
      engine: "2.0",
    },
    {
      id: 2,
      brand: "Ford",
      model: "Fiesta",
      year: "2015",
      version: "Titanium",
      engine: "1.6",
    },
  ]);

  const [currentVehicle, setCurrentVehicle] = useState<Omit<Vehicle, "id">>({
    brand: "",
    model: "",
    year: "",
    version: "",
    engine: "",
  });

  const { isFormValid } = useVehicleValidation(currentVehicle);
  const currentYearPlaceholder = new Date().getFullYear().toString();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setCurrentVehicle({ ...vehicle });
    setEditingId(vehicle.id);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (currentVehicle.brand && currentVehicle.model) {
      if (editingId) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === editingId ? { ...currentVehicle, id: editingId } : v
          )
        );
      } else {
        setVehicles((prev) => [...prev, { ...currentVehicle, id: Date.now() }]);
      }
      closeForm();
    }
  };

  const handleDelete = () => {
    if (editingId) {
      setVehicles((prev) => prev.filter((v) => v.id !== editingId));
      closeForm();
    }
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setCurrentVehicle({
      brand: "",
      model: "",
      year: "",
      version: "",
      engine: "",
    });
  };

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <div className={styles.mainContainer}>
        <Header
          onBack={() => (isAdding ? closeForm() : window.history.back())}
          title={
            isAdding
              ? editingId
                ? "Editar vehículo"
                : "Nuevo vehículo"
              : "Vehículos"
          }
        />
        <div className={styles.content}>
          {!isAdding ? (
            <div className={styles.listWrapper}>
              <div className={styles.listContainer}>
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={styles.vehicleCard}
                    onClick={() => handleEditClick(vehicle)}
                  >
                    <div className={styles.iconWrapper}>
                      <IconsApp.Business />
                    </div>
                    <div className={styles.info}>
                      <h3>
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <p>
                        {vehicle.year} • {vehicle.version} • Motor{" "}
                        {vehicle.engine}
                      </p>
                    </div>
                    <IconsApp.RightArrow />
                  </div>
                ))}
              </div>

              <Button
                className={styles.addVehicleBtn}
                onClick={() => setIsAdding(true)}
              >
                <span className={styles.addIcon}>+</span> Agregar nuevo vehículo
              </Button>
            </div>
          ) : (
            <div className={styles.layoutContent}>
              <div className={styles.columnLeft}>
                <div className={styles.inputContainer}>
                  <label className={styles.label}>Marca</label>

                  <InputField
                    name="brand"
                    value={currentVehicle.brand}
                    onChange={handleChange}
                    placeholder="Ej: Toyota"
                  />
                </div>
                <div className={styles.inputContainer}>
                  <label className={styles.label}>Modelo</label>

                  <InputField
                    name="model"
                    value={currentVehicle.model}
                    onChange={handleChange}
                    placeholder="Ej: Corolla"
                  />
                </div>
                <div className={styles.inputContainer}>
                  <label className={styles.label}>Versión</label>

                  <InputField
                    name="version"
                    value={currentVehicle.version}
                    onChange={handleChange}
                    placeholder="Ej: Full"
                  />
                </div>
              </div>

              <div className={styles.columnRight}>
                <div className={styles.row}>
                  <div className={styles.inputContainer}>
                    <label className={styles.label}>Año</label>

                    <InputField
                      name="year"
                      value={currentVehicle.year}
                      onChange={handleChange}
                      placeholder={currentYearPlaceholder}
                    />
                  </div>
                  <div className={styles.inputContainer}>
                    <label className={styles.label}>Motor</label>

                    <InputField
                      name="engine"
                      value={currentVehicle.engine}
                      onChange={handleChange}
                      placeholder="2.0"
                    />
                  </div>
                </div>

                <div className={styles.buttonGroup}>
                  <Button
                    className={styles.btnSave}
                    onClick={handleSave}
                    disabled={!isFormValid}
                  >
                    Guardar
                  </Button>
                  {editingId && (
                    <button
                      className={styles.btnCancelVisible}
                      onClick={handleDelete}
                    >
                      Eliminar vehículo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiclesPage;
