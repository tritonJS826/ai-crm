import type {AuthDictEn} from "src/dictionary/dictionaries/auth/auth.en";
import type {CommonDictEn, NotFoundDictEn} from "src/dictionary/dictionaries/common/common.en";
import type {FooterDictEn} from "src/dictionary/dictionaries/footer/footer.en";
import type {HeaderDictEn} from "src/dictionary/dictionaries/header/header.en";
import type {PaymentSuccessDictEn} from "src/dictionary/dictionaries/payment/paymentDict.en";
import type {ProfileDictEn} from "src/dictionary/dictionaries/profile/profile.en";

export enum DictionaryKey {
  COMMON = "common",
  HEADER = "header",
  FOOTER = "footer",
  PROFILE = "profile",
  AUTH = "auth",
  NOT_FOUND = "notFound",
  PAYMENT_SUCCESS = "paymentSuccess",
}

export type Language = "en";

export type DictionaryMap = {
  [DictionaryKey.COMMON]: CommonDictEn;
  [DictionaryKey.HEADER]: HeaderDictEn;
  [DictionaryKey.FOOTER]: FooterDictEn;
  [DictionaryKey.PROFILE]: ProfileDictEn;
  [DictionaryKey.AUTH]: AuthDictEn;
  [DictionaryKey.NOT_FOUND]: NotFoundDictEn;
  [DictionaryKey.PAYMENT_SUCCESS]: PaymentSuccessDictEn;
};

const loaders: {
  [K in DictionaryKey]: {
    [L in Language]: () => Promise<DictionaryMap[K]>;
  };
} = {
  [DictionaryKey.COMMON]: {en: async () => (await import("./dictionaries/common/common.en")).common},
  [DictionaryKey.HEADER]: {en: async () => (await import("./dictionaries/header/header.en")).header},
  [DictionaryKey.FOOTER]: {en: async () => (await import("./dictionaries/footer/footer.en")).footer},
  [DictionaryKey.PROFILE]: {en: async () => (await import("./dictionaries/profile/profile.en")).profileDictEn},
  [DictionaryKey.AUTH]: {en: async () => (await import("./dictionaries/auth/auth.en")).authDict},
  [DictionaryKey.NOT_FOUND]: {en: async () => (await import("./dictionaries/common/common.en")).notFoundDict},
  [DictionaryKey.PAYMENT_SUCCESS]: {en: async () => (await import("./dictionaries/payment/paymentDict.en")).paymentSuccessDictEn},
};

export async function loadDictionary<K extends DictionaryKey>(
  key: K,
  lang: Language,
): Promise<DictionaryMap[K]> {
  return loaders[key][lang]();
}
