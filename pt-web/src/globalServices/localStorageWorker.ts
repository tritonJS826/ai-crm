import {Language} from "src/dictionary/dictionaryLoader";

export const DEFAULT_LANGUAGE: Language = "en";

/**
 * Worker for accessing local storage
 */
class LocalStorageWorker<T extends LocalStorageData> {

  /**
   * If false - local storage is not supported
   */
  public isLocalStorageSupported: boolean;

  constructor() {
    this.isLocalStorageSupported = typeof window["localStorage"] !== "undefined" && window["localStorage"] !== null;

    this.setValueByDefaultIfNotExist("language", DEFAULT_LANGUAGE);

  }

  /**
   * Set item to localstorage
   */
  public setItemByKey(key: keyof T, value: T[keyof T]): void {
    this.checkLocalStorageSupport();
    localStorage.setItem(String(key), JSON.stringify(value));
  }

  /**
   * Check is Item in storage
   */
  public isItemExist(key: keyof T): boolean {
    this.checkLocalStorageSupport();

    return !!localStorage.getItem(String(key));
  }

  /**
   * Get Item by key
   */
  public getItemByKey<U extends T[keyof T]>(key: keyof T): U | null {
    this.checkLocalStorageSupport();

    return JSON.parse(String(localStorage.getItem(String(key))));
  }

  /**
   * Get Item by key
   * Use this method only with values which 100% exist in the storage
   * - for example if value was settled in localStorageWorker contructor
   */
  public getExistentItemByKey<U extends T[keyof T]>(key: keyof T): U {
    this.checkLocalStorageSupport();

    return JSON.parse(String(localStorage.getItem(String(key))));
  }

  /**
   * Remove item by key
   */
  public removeItemByKey(key: keyof T): void {
    this.checkLocalStorageSupport();
    localStorage.removeItem(String(key));
  }

  private setValueByDefaultIfNotExist<K extends keyof T>(
    key: K,
    value: T[K],
  ): void {
    if (!this.isItemExist(key)) {
      this.setItemByKey(key, value);
    }
  }

  /**
   * Check local storage support
   */
  private checkLocalStorageSupport() {
    if (!this.isLocalStorageSupported) {
      throw new Error("Local storage is not supported");
    }
  }

}

export const localStorageWorker = new LocalStorageWorker<LocalStorageData>();

/**
 * Available localStorage items of {@link LocalStorageData}
 * Keys of {@link LocalStorageData} is a localStorage  items keys
 * Value of {@link LocalStorageData} is a localStorage items values
 */
export type LocalStorageData = {

  /**
   * Access token
   */
  accessToken: Token;

  /**
   * Refresh token
   */
  refreshToken: Token;

  /**
   * Supported languages
   */
  language: Language;
}

export type Token = {

  /**
   * Access token
   */
  token: string | null;
}
