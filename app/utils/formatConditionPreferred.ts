export const formatConditionPreferred = (condition?: string | null): string => {
  if (!condition) return "Original";

  const normalized = condition.trim().toLowerCase();

  if (normalized === "no_importa") return "Cualquiera";
  if (normalized === "original") return "Original";
  if (normalized === "oem") return "OEM";

  return condition.replace(/_/g, " ");
};
