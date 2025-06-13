/* eslint-disable no-dupe-class-members */

import { NativeModules } from 'react-native';
import { KeychainAccessibility } from './constants';

const { RNEncryptedStorage } = NativeModules;

if (!RNEncryptedStorage) {
  throw new Error('RNEncryptedStorage is undefined');
}

type KeychainAccessibilityKeys = keyof typeof KeychainAccessibility;

export type EncryptedStorageOptions = {
  /**
   * **iOS only** - Control item availability relative to the lock state of the device.
   *
   * If the attribute ends with the string `ThisDeviceOnly`, the item can be restored to the same device that created a backup,
   * but it isn't migrated when restoring another device's backup data.
   * [Read more](https://developer.apple.com/documentation/security/keychain_services/keychain_items/restricting_keychain_item_accessibility?language=objc)
   *
   * Default value: `kSecAttrAccessibleAfterFirstUnlock`
   */
  keychainAccessibility?: typeof KeychainAccessibility[KeychainAccessibilityKeys];
  /**
   * A string for identifying a set of storage items. Should not contain path separators.
   *
   * Uses [kSecAttrService](https://developer.apple.com/documentation/security/ksecattrservice?language=objc) on iOS
   * and [fileName](https://developer.android.com/reference/kotlin/androidx/security/crypto/EncryptedSharedPreferences?hl=en#create) on Android.
   *
   * Default value: App's bundle id
   */
  storageName?: string;
};

export type StorageErrorCallback = (error?: Error) => void;
export type StorageValueCallback = (error?: Error, value?: string) => void;

// Default options
const defaultOptions: EncryptedStorageOptions = {
  keychainAccessibility: KeychainAccessibility.kSecAttrAccessibleAfterFirstUnlock,
};

export default class EncryptedStorage {
  /**
   * Writes data to the disk, using SharedPreferences or KeyChain, depending on the platform.
   * @param {string} key - A string that will be associated to the value for later retrieval.
   * @param {string} value - The data to store.
   * @param {EncryptedStorageOptions} options - Configuration options.
   */
  static setItem(key: string, value: string, options?: EncryptedStorageOptions): Promise<void>;

  /**
   * Writes data to the disk, using SharedPreferences or KeyChain, depending on the platform.
   * @param {string} key - A string that will be associated to the value for later retrieval.
   * @param {string} value - The data to store.
   * @param {Function} cb - The function to call when the operation completes.
   */
  static setItem(key: string, value: string, cb: StorageErrorCallback): void;

  /**
   * Writes data to the disk, using SharedPreferences or KeyChain, depending on the platform.
   * @param {string} key - A string that will be associated to the value for later retrieval.
   * @param {string} value - The data to store.
   * @param {EncryptedStorageOptions} options - Configuration options.
   * @param {Function} cb - The function to call when the operation completes.
   */
  static setItem(key: string, value: string, options: EncryptedStorageOptions, cb: StorageErrorCallback): void;

  static setItem(
    key: string,
    value: string,
    optionsOrCallback?: EncryptedStorageOptions | StorageErrorCallback,
    cb?: StorageErrorCallback
  ): void | Promise<void> {
    let options: EncryptedStorageOptions = defaultOptions;
    let callback: StorageErrorCallback | undefined;

    // Handle overloaded parameters
    if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    } else if (typeof optionsOrCallback === 'object') {
      options = { ...defaultOptions, ...optionsOrCallback };
      callback = cb;
    }

    if (callback) {
      RNEncryptedStorage.setItem(key, value, options, callback);
      return;
    }

    return RNEncryptedStorage.setItem(key, value, options);
  }

  /**
   * Retrieves data from the disk, using SharedPreferences or KeyChain, depending on the platform and returns it as the specified type.
   * @param {string} key - A string that is associated to a value.
   * @param {EncryptedStorageOptions} options - Configuration options.
   */
  static getItem(key: string, options?: EncryptedStorageOptions): Promise<string | null>;

  /**
   * Retrieves data from the disk, using SharedPreferences or KeyChain, depending on the platform and returns it as the specified type.
   * @param {string} key - A string that is associated to a value.
   * @param {Function} cb - The function to call when the operation completes.
   */
  static getItem(key: string, cb: StorageValueCallback): void;

  /**
   * Retrieves data from the disk, using SharedPreferences or KeyChain, depending on the platform and returns it as the specified type.
   * @param {string} key - A string that is associated to a value.
   * @param {EncryptedStorageOptions} options - Configuration options.
   * @param {Function} cb - The function to call when the operation completes.
   */
  static getItem(key: string, options: EncryptedStorageOptions, cb: StorageValueCallback): void;

  static getItem(
    key: string,
    optionsOrCallback?: EncryptedStorageOptions | StorageValueCallback,
    cb?: StorageValueCallback
  ): void | Promise<string | null> {
    let options: EncryptedStorageOptions = defaultOptions;
    let callback: StorageValueCallback | undefined;

    // Handle overloaded parameters
    if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    } else if (typeof optionsOrCallback === 'object') {
      options = { ...defaultOptions, ...optionsOrCallback };
      callback = cb;
    }

    if (callback) {
      RNEncryptedStorage.getItem(key, options)
        .then((value: string | null) => callback!(undefined, value))
        .catch((error: Error) => callback!(error));
      return;
    }

    return RNEncryptedStorage.getItem(key, options);
  }

  /**
   * Deletes data from the disk, using SharedPreferences or KeyChain, depending on the platform.
   * @param {string} key - A string that is associated to a value.
   * @param {EncryptedStorageOptions} options - Configuration options.
   */
  static removeItem(key: string, options?: EncryptedStorageOptions): Promise<void>;

  /**
   * Deletes data from the disk, using SharedPreferences or KeyChain, depending on the platform.
   * @param {string} key - A string that is associated to a value.
   * @param {Function} cb - The function to call when the operation completes.
   */
  static removeItem(key: string, cb: StorageErrorCallback): void;

  /**
   * Deletes data from the disk, using SharedPreferences or KeyChain, depending on the platform.
   * @param {string} key - A string that is associated to a value.
   * @param {EncryptedStorageOptions} options - Configuration options.
   * @param {Function} cb - The function to call when the operation completes.
   */
  static removeItem(key: string, options: EncryptedStorageOptions, cb: StorageErrorCallback): void;

  static removeItem(
    key: string,
    optionsOrCallback?: EncryptedStorageOptions | StorageErrorCallback,
    cb?: StorageErrorCallback
  ): void | Promise<void> {
    let options: EncryptedStorageOptions = defaultOptions;
    let callback: StorageErrorCallback | undefined;

    // Handle overloaded parameters
    if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    } else if (typeof optionsOrCallback === 'object') {
      options = { ...defaultOptions, ...optionsOrCallback };
      callback = cb;
    }

    if (callback) {
      RNEncryptedStorage.removeItem(key, options)
        .then(() => callback!())
        .catch((error: Error) => callback!(error));
      return;
    }

    return RNEncryptedStorage.removeItem(key, options);
  }

  /**
   * Clears all data from disk, using SharedPreferences or KeyChain, depending on the platform.
   * @param {EncryptedStorageOptions} options - Configuration options.
   */
  static clear(options?: EncryptedStorageOptions): Promise<void>;

  /**
   * Clears all data from disk, using SharedPreferences or KeyChain, depending on the platform.
   * @param {Function} cb - The function to call when the operation completes.
   */
  static clear(cb: StorageErrorCallback): void;

  /**
   * Clears all data from disk, using SharedPreferences or KeyChain, depending on the platform.
   * @param {EncryptedStorageOptions} options - Configuration options.
   * @param {Function} cb - The function to call when the operation completes.
   */
  static clear(options: EncryptedStorageOptions, cb: StorageErrorCallback): void;

  static clear(
    optionsOrCallback?: EncryptedStorageOptions | StorageErrorCallback,
    cb?: StorageErrorCallback
  ): void | Promise<void> {
    let options: EncryptedStorageOptions = defaultOptions;
    let callback: StorageErrorCallback | undefined;

    // Handle overloaded parameters
    if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    } else if (typeof optionsOrCallback === 'object') {
      options = { ...defaultOptions, ...optionsOrCallback };
      callback = cb;
    }

    if (callback) {
      RNEncryptedStorage.clear(options)
        .then(() => callback!())
        .catch((error: Error) => callback!(error));
      return;
    }

    return RNEncryptedStorage.clear(options);
  }
}
