import type {AboutDictEn} from "src/dictionary/dictionaries/about/about.en";
import type {AboutDictRu} from "src/dictionary/dictionaries/about/about.ru";
import type {AuthDictEn} from "src/dictionary/dictionaries/auth/auth.en";
import type {AuthDictRu} from "src/dictionary/dictionaries/auth/auth.ru";
import type {BiohackingDictEn} from "src/dictionary/dictionaries/biohacking/biohacking.en";
import type {BiohackingDictRu} from "src/dictionary/dictionaries/biohacking/biohacking.ru";
import type {CommonDictEn, NotFoundDictEn} from "src/dictionary/dictionaries/common/common.en";
import type {CommonDictRu, NotFoundDictRu} from "src/dictionary/dictionaries/common/common.ru";
import type {ConditionsDictEn} from "src/dictionary/dictionaries/conditions/conditions.en";
import type {ConditionsDictRu} from "src/dictionary/dictionaries/conditions/conditions.ru";
import type {FooterDictEn} from "src/dictionary/dictionaries/footer/footer.en";
import type {FooterDictRu} from "src/dictionary/dictionaries/footer/footer.ru";
import type {HeaderDictEn} from "src/dictionary/dictionaries/header/header.en";
import type {HeaderDictRu} from "src/dictionary/dictionaries/header/header.ru";
import type {HomeDictEn} from "src/dictionary/dictionaries/home/home.en";
import type {HomeDictRu} from "src/dictionary/dictionaries/home/home.ru";
import type {PaymentSuccessDictEn} from "src/dictionary/dictionaries/payment/paymentDict.en";
import type {PaymentSuccessDictRu} from "src/dictionary/dictionaries/payment/paymentDict.ru";
import type {ProfileDictEn} from "src/dictionary/dictionaries/profile/profile.en";
import type {ProfileDictRu} from "src/dictionary/dictionaries/profile/profile.ru";
import type {SosDictEn} from "src/dictionary/dictionaries/sos/sos.en";
import type {SosDictRu} from "src/dictionary/dictionaries/sos/sos.ru";
import type {TestsDictEn} from "src/dictionary/dictionaries/tests/tests.en";
import type {TestsDictRu} from "src/dictionary/dictionaries/tests/tests.ru";

export enum DictionaryKey {
  HOME = "home",
  COMMON = "common",
  TESTS = "tests",
  CONDITIONS = "conditions",
  BIOHACKING = "biohacking",
  ABOUT = "about",
  HEADER = "header",
  FOOTER = "footer",
  SOS = "sos",
  PROFILE = "profile",
  AUTH = "auth",
  NOT_FOUND = "notFound",
  PAYMENT_SUCCESS = "paymentSuccess",
}

export type Language = "en" | "ru";

export type DictionaryMap = {
  [DictionaryKey.HOME]: HomeDictEn | HomeDictRu;
  [DictionaryKey.COMMON]: CommonDictEn | CommonDictRu;
  [DictionaryKey.TESTS]: TestsDictEn | TestsDictRu;
  [DictionaryKey.CONDITIONS]: ConditionsDictEn | ConditionsDictRu;
  [DictionaryKey.BIOHACKING]: BiohackingDictEn | BiohackingDictRu;
  [DictionaryKey.ABOUT]: AboutDictEn | AboutDictRu;
  [DictionaryKey.HEADER]: HeaderDictEn | HeaderDictRu;
  [DictionaryKey.FOOTER]: FooterDictEn | FooterDictRu;
  [DictionaryKey.SOS]: SosDictEn | SosDictRu;
  [DictionaryKey.PROFILE]: ProfileDictEn | ProfileDictRu;
  [DictionaryKey.AUTH]: AuthDictEn | AuthDictRu;
  [DictionaryKey.NOT_FOUND]: NotFoundDictEn | NotFoundDictRu;
  [DictionaryKey.PAYMENT_SUCCESS]: PaymentSuccessDictEn | PaymentSuccessDictRu;
};

const loaders: {
  [K in DictionaryKey]: {
    [L in Language]: () => Promise<DictionaryMap[K]>;
  };
} = {
  [DictionaryKey.HOME]: {
    en: async () => (await import("./dictionaries/home/home.en")).home,
    ru: async () => (await import("./dictionaries/home/home.ru")).home,
  },
  [DictionaryKey.COMMON]: {
    en: async () => (await import("./dictionaries/common/common.en")).common,
    ru: async () => (await import("./dictionaries/common/common.ru")).common,
  },
  [DictionaryKey.TESTS]: {
    en: async () => (await import("./dictionaries/tests/tests.en")).testsDict,
    ru: async () => (await import("./dictionaries/tests/tests.ru")).testsDict,
  },
  [DictionaryKey.CONDITIONS]: {
    en: async () => (await import("./dictionaries/conditions/conditions.en")).conditionsDict,
    ru: async () => (await import("./dictionaries/conditions/conditions.ru")).conditionsDict,
  },
  [DictionaryKey.BIOHACKING]: {
    en: async () => (await import("./dictionaries/biohacking/biohacking.en")).biohackingDict,
    ru: async () => (await import("./dictionaries/biohacking/biohacking.ru")).biohackingDict,
  },
  [DictionaryKey.ABOUT]: {
    en: async () => (await import("./dictionaries/about/about.en")).aboutDict,
    ru: async () => (await import("./dictionaries/about/about.ru")).aboutDict,
  },
  [DictionaryKey.HEADER]: {
    en: async () => (await import("./dictionaries/header/header.en")).header,
    ru: async () => (await import("./dictionaries/header/header.ru")).header,
  },
  [DictionaryKey.FOOTER]: {
    en: async () => (await import("./dictionaries/footer/footer.en")).footer,
    ru: async () => (await import("./dictionaries/footer/footer.ru")).footer,
  },
  [DictionaryKey.SOS]: {
    en: async () => (await import("./dictionaries/sos/sos.en")).sosDict,
    ru: async () => (await import("./dictionaries/sos/sos.ru")).sosDict,
  },
  [DictionaryKey.PROFILE]: {
    en: async () => (await import("./dictionaries/profile/profile.en")).profileDictEn,
    ru: async () => (await import("./dictionaries/profile/profile.ru")).profileDictRu,
  },
  [DictionaryKey.AUTH]: {
    en: async () => (await import("./dictionaries/auth/auth.en")).authDict,
    ru: async () => (await import("./dictionaries/auth/auth.ru")).authDict,
  },
  [DictionaryKey.NOT_FOUND]: {
    en: async () => (await import("./dictionaries/common/common.en")).notFoundDict,
    ru: async () => (await import("./dictionaries/common/common.ru")).notFoundDict,
  },
  [DictionaryKey.PAYMENT_SUCCESS]: {
    en: async () => (await import("./dictionaries/payment/paymentDict.en")).paymentSuccessDictEn,
    ru: async () => (await import("./dictionaries/payment/paymentDict.ru")).paymentSuccessDictRu,
  },
};

export async function loadDictionary<K extends DictionaryKey>(
  key: K,
  lang: Language,
): Promise<DictionaryMap[K]> {
  return loaders[key][lang]();
}
