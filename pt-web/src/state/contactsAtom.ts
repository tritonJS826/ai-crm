import {atom} from "jotai";
import {ContactBase} from "src/services/contact";

export const contactsAtom = atom<ContactBase[] | []>([]);
