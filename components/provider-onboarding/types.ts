import { ChangeEvent } from "react";

export interface ProviderFormData {
  username: string;
  email: string;
  business_name: string;
  phone: string;
  categories: string[];
  brands: string[];
  business_photos: File[];
}

export interface StepProps {
  formData: ProviderFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<ProviderFormData>>;
}
