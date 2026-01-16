import {NavbarKey} from "src/components/Navbar/navbarConfig";

export const navbar: {labels: Record<NavbarKey, string>} = {
  labels: {
    chat: "Chat",
    tasks: "Tasks",
    notes: "Notes",
    customers: "Customers",
    settings: "Settings",
  },
} as const;

export type NavbarDictEn = typeof navbar;
