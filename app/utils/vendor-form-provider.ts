import {
  ProviderProfileData,
  UpdateProviderProfileDTO,
  Category,
  BaseEntity,
  ProviderLocationDTO,
} from "@/app/lib/api/vendor/vendorProfile";
import { ProviderFormData } from "@/components/provider-onboarding/types";

export interface FullProviderProfile extends ProviderProfileData {
  username: string;
  email: string;
  mainCategories?: Category[];
  subcategories?: Category[];
  brands?: BaseEntity[];
  locations?: (ProviderLocationDTO & { id: number })[];
}

export const buildUpdateBody = (
  vendor: FullProviderProfile,
  currentForm: ProviderFormData
): UpdateProviderProfileDTO => {
  const existingLocation = vendor.locations?.[0];
  const locationPayload: ProviderLocationDTO = {
    name: existingLocation?.name || "Tienda Principal",
    type: "branch",
    state: existingLocation?.state || "",
    municipality: existingLocation?.municipality || "",
    parish: existingLocation?.parish || "",
    address: existingLocation?.address || "",
    exactAddress: existingLocation?.exactAddress || "",
    latitude: existingLocation?.latitude || 0,
    longitude: existingLocation?.longitude || 0,
    placeId: existingLocation?.placeId || "",
  };

  return {
    // 1. Datos comerciales
    // Aunque username y email no se envíen en el DTO (según tu interfaz),
    // el formulario los usa para visualización. El DTO solo pide businessName y phoneNumber.
    businessName: currentForm.businessName || vendor.businessName,
    phoneNumber: currentForm.phoneNumber || vendor.phoneNumber,

    // 2. Información comercial
    mainCategories:
      currentForm.mainCategories.length > 0
        ? currentForm.mainCategories.map((c) => c.id)
        : vendor.mainCategories?.map((c) => c.id) || [],

    subcategories:
      currentForm.subcategories.length > 0
        ? currentForm.subcategories.map((s) => s.id)
        : vendor.subcategories?.map((s) => s.id) || [],

    brands:
      currentForm.brands.length > 0
        ? currentForm.brands.map((b) => b.id)
        : vendor.brands?.map((b) => b.id) || [],

    // 3. Condiciones de venta
    paymentMethods:
      currentForm.paymentMethods.length > 0
        ? currentForm.paymentMethods
        : vendor.paymentMethods || [],
    warrantyPolicy: currentForm.warrantyPolicy || vendor.warrantyPolicy,
    returnPolicy: currentForm.returnPolicy || vendor.returnPolicy,

    // 4. Logística y entrega
    hasStorePickup: currentForm.hasStorePickup,
    hasLocalDelivery: currentForm.hasLocalDelivery,
    hasNationalDelivery: currentForm.hasNationalDelivery,
    nationalCarriers:
      currentForm.nationalCarriers.length > 0
        ? currentForm.nationalCarriers
        : vendor.nationalCarriers || [],

    termsAccepted: true,
    location: locationPayload,
  };
};
