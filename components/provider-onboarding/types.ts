import { BaseEntity } from "@/app/lib/api/vendor/vendorProfile";
import { ChangeEvent } from "react";

export interface ProviderFormData {
  username: string;
  email: string;
  businessName: string;
  phone: string;
  mainCategories: BaseEntity[];
  brands: BaseEntity[];
  businessPhotos: File[];
  paymentMethods: string[];
  warrantyPolicy?: string;
  returnPolicy?: string;
  hasStorePickup: boolean;
  hasLocalDelivery: boolean;
  hasNationalDelivery: boolean;
  shippingCarriers: string[];
}

export interface StepProps {
  formData: ProviderFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<ProviderFormData>>;
}
