/**
 * provide a in-memory polyfill for localstorage
 */
export class LocalStorage implements Storage {
    valuesMap = new Map<string, string>();

    getItem(key: string): string | null {
        const stringKey = String(key);
        if (this.valuesMap.has(key)) {
            return String(this.valuesMap.get(stringKey));
        }
        return null;
    }

    setItem(key: string, val: any): void {
        this.valuesMap.set(String(key), String(val));
    }

    removeItem(key: string): void {
        this.valuesMap.delete(key);
    }

    clear(): void {
        this.valuesMap.clear();
    }

    key(index: number): string | null {
        if (arguments.length === 0) {
            throw new TypeError("Failed to execute 'key' on 'Storage': 1 argument required, but only 0 present.") // this is a TypeError implemented on Chrome, Firefox throws Not enough arguments to Storage.key.
        }
        let arr = Array.from(this.valuesMap.keys());
        return arr[index];
    }

    get length(): number {
        return this.valuesMap.size;
    }

    [key: string]: any;
    [index: number]: string;
}
export let localstorageSupport: boolean;
export let storageAPI: Storage;
try {
    // Test webstorage existence.
    if (!window.localStorage || !window.sessionStorage) throw "exception";
    // Test webstorage accessibility - Needed for Safari private browsing.
    localStorage.setItem('storage_test', '1');
    localStorage.removeItem('storage_test');
    localstorageSupport = true;
    storageAPI = window.localStorage;
} catch (e) {
    console.log('localstorage disabled, use in-memory object as polyfill');
    localstorageSupport = false;
    storageAPI = new LocalStorage();
}
