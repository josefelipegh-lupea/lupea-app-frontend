import { BaseEntity } from "@/app/lib/api/vendor/vendorProfile";
import { ChangeEvent } from "react";

export interface ProviderFormData {
  username: string;
  email: string;
  businessName: string;
  phoneNumber: string;
  mainCategories: BaseEntity[];
  subcategories: BaseEntity[];
  brands: BaseEntity[];
  businessPhotos: File[];
  paymentMethods: string[];
  warrantyPolicy?: string;
  returnPolicy?: string;
  hasStorePickup: boolean;
  hasLocalDelivery: boolean;
  hasNationalDelivery: boolean;
  nationalCarriers: string[];
}

export interface StepProps {
  formData: ProviderFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  updateFormData?: (newData: Partial<ProviderFormData>) => void;
  setFormData: React.Dispatch<React.SetStateAction<ProviderFormData>>;
}
