import chatIcon from "src/assets/navbarIcons/chat.avif";
import customersIcon from "src/assets/navbarIcons/customers.avif";
import notesIcon from "src/assets/navbarIcons/notes.avif";
import settingsIcon from "src/assets/navbarIcons/settings.avif";
import tasksIcon from "src/assets/navbarIcons/tasks.avif";
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
    iconSrc: chatIcon,
    href: PATHS.CHAT,
  },
  {
    key: NavbarKey.TASKS,
    iconSrc: tasksIcon,
    href: PATHS.HOME,
  },
  {
    key: NavbarKey.NOTES,
    iconSrc: notesIcon,
    href: PATHS.HOME,
  },
  {
    key: NavbarKey.CUSTOMERS,
    iconSrc: customersIcon,
    href: PATHS.HOME,
  },
  {
    key: NavbarKey.SETTINGS,
    iconSrc: settingsIcon,
    href: PATHS.HOME,
  },
];
