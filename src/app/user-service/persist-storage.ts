
import {distinctUntilChanged, map, filter} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { storageAPI } from '../../helpers/localstorage';
import { Subject ,  Observable } from 'rxjs';

export const PREFIX = 'ps';

export interface PersistEntry {
    key: string;
    value: string;
}

/**
 * An iterator for PersistStorage, this is a snapshot of current storage state, it is safe
 * to do modification when iterating. however the iterator does not guarantee the data is fresh.
 */
export class PersistStorageIterator implements IterableIterator<PersistEntry> {
    private _entires: PersistEntry[];
    private _position = 0;

    constructor() {
        let key, i;
        this._entires = [];
        for (i = 0; i < storageAPI.length; i++) {
            key = storageAPI.key(i);
            if (key && this.hasPrefix(key)) {
                this._entires.push({
                    key: key,
                    value: storageAPI.getItem(key)
                });
            }
        }
    }

    next(value?: any): IteratorResult<PersistEntry> {
        if (this._position >= this._entires.length) {
            return {
                value: null,
                done: true
            };
        }
        return {
            value: this._entires[this._position++],
            done: false
        };
    }

    return(value?: any): IteratorResult<PersistEntry> {
        return null;
    }

    throw(e?: any): IteratorResult<PersistEntry> {
        return null;
    }

    [Symbol.iterator](): IterableIterator<PersistEntry> {
        return this;
    }

    private hasPrefix(key: string):boolean {
        return key.startsWith(PREFIX + ':');
    }
}

@Injectable()
export class PersistStorage {
    private _itemChange = new Subject<{key: string, value: string}>();

    constructor(private _userService: UserService) {
        this._userService.getUserInfo()
            .subscribe((user) => {
                if (!user) {
                    this.clear();
                }
            })
    }

    setItem(key: string, value: string) {
        let keyInStorage = `${PREFIX}:${key}`;
        storageAPI.setItem(keyInStorage, value);
        this._itemChange.next({key, value});
    }

    getItem(key: string, defaultValue: string | null): string {
        let keyInStorage = `${PREFIX}:${key}`;
        let value = storageAPI.getItem(keyInStorage);
        return value !== null ? value: defaultValue;
    }

    removeItem(key: string): void {
        let keyInStorage = `${PREFIX}:${key}`;
        storageAPI.removeItem(keyInStorage);
    }

    startsWith(key: string, prefix: string): boolean {
        let prefixOfStorage = `${PREFIX}:${prefix}:`;
        return key.startsWith(prefixOfStorage);
    }

    iterator(): PersistStorageIterator {
        return new PersistStorageIterator();
    }

    subscribe(key: string): Observable<string> {
        return this._itemChange.asObservable().pipe(
            filter((item) => {
                return item.key === key;
            }),
            map(({value}) => {
                return value;
            }),
            distinctUntilChanged(),);
    }

    private clear() {
        for (let i = 0; i < storageAPI.length; i++) {
            let key = storageAPI.key(i);
            if (key.startsWith(PREFIX)) {
                storageAPI.removeItem(key);
                i--;
            }
        }
    }
}
