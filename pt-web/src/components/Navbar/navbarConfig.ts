import {PATHS} from "src/routes/routes";

export enum NavbarKey {
    CHAT ="chat",
    TASKS = "tasks",
    NOTES = "notes",
    CUSTOMERS = "customers",
    SETTINGS = "settings",
}

export const navbarConfig: {key: NavbarKey; iconSrc: string; href: string}[] = [
  {
    key: NavbarKey.CHAT,
    iconSrc: "src/assets/navbarIcons/chat.avif",
    href: PATHS.CHAT,
  },
  {
    key: NavbarKey.TASKS,
    iconSrc: "src/assets/navbarIcons/tasks.avif",
    href: PATHS.HOME,
  },
  {
    key: NavbarKey.NOTES,
    iconSrc: "src/assets/navbarIcons/notes.avif",
    href: PATHS.HOME,
  },
  {
    key: NavbarKey.CUSTOMERS,
    iconSrc: "src/assets/navbarIcons/customers.avif",
    href: PATHS.HOME,
  },
  {
    key: NavbarKey.SETTINGS,
    iconSrc: "src/assets/navbarIcons/settings.avif",
    href: PATHS.HOME,
  },
];
