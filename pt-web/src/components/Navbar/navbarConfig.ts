import {PATHS} from "src/routes/routes";

export enum NavbarKeys {
    CHAT ="chat",
    TASKS = "tasks",
    NOTES = "notes",
    CUSTOMERS = "customers",
    SETTINGS = "settings",
}

export const navbarConfig: {key: NavbarKeys; iconSrc: string; href: string}[] = [
  {
    key: NavbarKeys.CHAT,
    iconSrc: "src/assets/navbarIcons/chat.avif",
    href: PATHS.CHAT,
  },
  {
    key: NavbarKeys.TASKS,
    iconSrc: "src/assets/navbarIcons/tasks.avif",
    href: PATHS.HOME,
  },
  {
    key: NavbarKeys.NOTES,
    iconSrc: "src/assets/navbarIcons/notes.avif",
    href: PATHS.HOME,
  },
  {
    key: NavbarKeys.CUSTOMERS,
    iconSrc: "src/assets/navbarIcons/customers.avif",
    href: PATHS.HOME,
  },
  {
    key: NavbarKeys.SETTINGS,
    iconSrc: "src/assets/navbarIcons/settings.avif",
    href: PATHS.HOME,
  },
];
