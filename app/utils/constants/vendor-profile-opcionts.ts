import React from "react";
import { IconsApp } from "@/components/icons/Icons";

export interface MenuItemConfig {
  label: string;
  icon: () => React.ReactElement;
  isSwitch?: boolean;
  href?: string;
}

const MENU_CONFIG_VENDOR: Array<{
  id: string;
  title: string;
  items?: MenuItemConfig[];
}> = [
  {
    id: "cuenta",
    title: "CUENTA",
    items: [
      {
        label: "Datos comerciales",
        icon: IconsApp.Personal,
        href: "/profile/vendor/basics",
      },
      {
        label: "Información comercial",
        href: "/profile/vendor/classification",
        icon: IconsApp.Location,
      },
      {
        label: "Ubicaciones",
        href: "/profile/vendor/location",
        icon: IconsApp.Vehicle,
      },
      {
        label: "Condiciones de venta",
        href: "/profile/vendor/conditions",
        icon: IconsApp.Vehicle,
      },
      {
        label: "Logística y entrega",
        href: "/profile/vendor/logistics",
        icon: IconsApp.Vehicle,
      },
    ],
  },
  {
    id: "preferencias",
    title: "PREFERENCIAS",
    items: [
      { label: "Notificaciones", icon: IconsApp.Notification, isSwitch: true },
    ],
  },
  {
    id: "historial",
    title: "HISTORIAL",
    items: [
      { label: "Historial de solicitudes", icon: IconsApp.History, href: "/profile/vendor/history/requests" },
      { label: "Historial de Ordenes", icon: IconsApp.History, href: "/profile/vendor/history/orders" },
      { label: "Historial de Cotizaciones", icon: IconsApp.History, href: "/profile/vendor/history/quotes" },
    ],
  },
  {
    id: "seguridad",
    title: "SEGURIDAD",
    items: [
      {
        label: "Cambiar clave",
        icon: IconsApp.Eye,
      },
    ],
  },
  {
    id: "legal",
    title: "LEGAL",
    items: [
      {
        label: "Términos y condiciones",
        icon: IconsApp.History,
      },
    ],
  },
  {
    id: "version",
    title: "LUPEA VER. 1.0",
  },
];

export default MENU_CONFIG_VENDOR;
