import React from "react";
import { IconsApp } from "@/components/icons/Icons";

export interface MenuItemConfig {
  label: string;
  icon: () => React.ReactElement;
  isSwitch?: boolean;
  href?: string;
}

const MENU_CONFIG_USER: Array<{
  id: string;
  title: string;
  items?: MenuItemConfig[];
}> = [
  {
    id: "cuenta",
    title: "CUENTA",
    items: [
      {
        label: "Información personal",
        icon: IconsApp.Personal,
        href: "/profile/user/personal-info",
      },
      {
        label: "Ubicaciones",
        icon: IconsApp.Location,

        href: "/profile/user/location",
      },
      {
        label: "Vehículos",
        icon: IconsApp.Vehicle,
        href: "/profile/user/vehicle",
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
      { label: "Historial de solicitudes", icon: IconsApp.History },
      { label: "Historial de Ordenes", icon: IconsApp.History },
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

export default MENU_CONFIG_USER;
