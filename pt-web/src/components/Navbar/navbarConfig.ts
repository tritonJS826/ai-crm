import {PATHS} from "src/routes/routes";

export enum NavbarKeys {
    CHAT ="chat",
    TASKS = "tasks",
    NOTES = "notes",
    CUSTOMERS = "customers",
    SETTINGS = "settings",
}

export const navbarConfig: {key: string; iconSrc: string; href: string}[] = [
  {
    key: NavbarKeys.CHAT,
    iconSrc: `src/assets/navbarIcons/${NavbarKeys.CHAT}.avif`,
    href: PATHS.CHAT,
  },
  {
    key: NavbarKeys.TASKS,
    iconSrc: `src/assets/navbarIcons/${NavbarKeys.TASKS}.avif`,
    href: PATHS.HOME,
  },
  {
    key: NavbarKeys.NOTES,
    iconSrc: `src/assets/navbarIcons/${NavbarKeys.NOTES}.avif`,
    href: PATHS.HOME,
  },
  {
    key: NavbarKeys.CUSTOMERS,
    iconSrc: `src/assets/navbarIcons/${NavbarKeys.CUSTOMERS}.avif`,
    href: PATHS.HOME,
  },
  {
    key: NavbarKeys.SETTINGS,
    iconSrc: `src/assets/navbarIcons/${NavbarKeys.SETTINGS}.avif`,
    href: PATHS.HOME,
  },
];
