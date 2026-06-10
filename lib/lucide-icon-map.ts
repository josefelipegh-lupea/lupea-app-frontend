import {
  FileText,
  Network,
  BadgeCheck,
  Truck,
  TrendingUp,
  ShoppingCart,
  Store,
  Brain,
  ArrowRight,
  Send,
  Share2,
  Globe,
} from "lucide-react";

export const LUCIDE_ICON_MAP: Record<string, React.ComponentType<any>> = {
  FileText,
  Network,
  BadgeCheck,
  Truck,
  TrendingUp,
  ShoppingCart,
  Store,
  Brain,
  ArrowRight,
  Send,
  Share2,
  Globe,
};

/**
 * Obtener componente lucide por nombre
 * Fallback seguro: retorna null si no existe
 */
export function getIconComponent(iconName?: string) {
  if (!iconName) return null;
  return LUCIDE_ICON_MAP[iconName] || null;
}
