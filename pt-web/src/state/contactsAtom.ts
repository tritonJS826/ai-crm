import {atom} from "jotai";
import {ContactBase} from "src/services/contactService";

export const contactsAtom = atom<ContactBase[] | []>([]);
