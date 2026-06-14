export const formatDeliveryTimeLabel = (deliveryTime?: string | null): string => {
  const rawValue = (deliveryTime ?? "").trim();

  if (!rawValue) {
    return "Entrega estimada: a convenir";
  }

  const lowerValue = rawValue.toLowerCase();

  if (lowerValue.startsWith("entrega estimada:")) {
    const normalizedValue = rawValue.split(":").slice(1).join(":").trim();
    return `Entrega estimada: ${normalizedValue || "a convenir"}`;
  }

  if (lowerValue.startsWith("entrega:")) {
    const normalizedValue = rawValue.split(":").slice(1).join(":").trim();
    return `Entrega estimada: ${normalizedValue || "a convenir"}`;
  }

  return `Entrega estimada: ${rawValue}`;
};
