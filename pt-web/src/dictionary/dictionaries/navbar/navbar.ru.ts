import {NavbarKey} from "src/components/Navbar/navbarConfig";

export const navbar: {labels: Record<NavbarKey, string>} = {
  labels: {
    chat: "",
    tasks: "",
    notes: "",
    customers: "",
    settings: "",
    logout: "",
  },
} as const;

export type NavbarDictRu = typeof navbar;
