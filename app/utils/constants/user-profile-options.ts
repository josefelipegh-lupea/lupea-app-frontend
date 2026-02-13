import React from "react";
import { IconsApp } from "@/components/icons/Icons";

export interface MenuItemConfig {
  label: string;
  icon: () => React.ReactElement;
  isSwitch?: boolean;
}

const MENU_CONFIG: Array<{
  id: string;
  title: string;
  items?: MenuItemConfig[];
}> = [
  {
    id: "cuenta",
    title: "CUENTA",
    items: [
      { label: "Información personal", icon: IconsApp.Personal },
      { label: "Ubicaciones", icon: IconsApp.Location },
      { label: "Vehículos", icon: IconsApp.Vehicle },
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

export default MENU_CONFIG;
