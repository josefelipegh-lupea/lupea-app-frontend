export const formatProviderReputation = (
  rating?: number | null,
  reviewCount?: number | null,
) => {
  const numericRating = Number(rating ?? 0);
  const numericReviewCount = Number(reviewCount ?? 0);

  if (!Number.isFinite(numericRating) || numericRating <= 0) {
    return {
      hasRating: false,
      label: "Sin calificaciones",
    };
  }

  const formattedRating = numericRating.toFixed(1);

  if (Number.isFinite(numericReviewCount) && numericReviewCount > 0) {
    return {
      hasRating: true,
      label: `${formattedRating} (${numericReviewCount})`,
    };
  }

  return {
    hasRating: true,
    label: formattedRating,
  };
};
